import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";
import { runAIReview } from "@/lib/ai/ai-engine";

// Helper: Get realistic diff content for the review based on the repository name
function getRepositoryMockDiff(repoName: string): string {
  if (repoName.includes("api-gateway")) {
    return `diff --git a/src/middleware/auth.ts b/src/middleware/auth.ts
index 838e123..928da1b 100644
--- a/src/middleware/auth.ts
+++ b/src/middleware/auth.ts
@@ -20,10 +20,10 @@ export async function checkSession(req: Request, res: Response) {
   const token = req.headers.authorization;
   
-  const tokenSecret = process.env.JWT_SECRET || "temp_secret_key";
-  const decoded = jwt.verify(token, tokenSecret);
+  const tokenSecret = process.env.JWT_SECRET;
+  if (!tokenSecret) {
+    throw new Error("JWT_SECRET is not configured");
+  }
+  const decoded = jwt.verify(token, tokenSecret);
   
   req.user = decoded;
-  const userPosts = await db.query("SELECT * FROM posts WHERE user_id = " + req.user.id);
-  return res.json({ user: req.user, posts: userPosts });
 }`;
  }
  
  if (repoName.includes("developer-dashboard")) {
    return `diff --git a/src/components/AnalyticsPanel.tsx b/src/components/AnalyticsPanel.tsx
index 472b8d9..102ea8c 100644
--- a/src/components/AnalyticsPanel.tsx
+++ b/src/components/AnalyticsPanel.tsx
@@ -110,6 +110,7 @@ export function AnalyticsPanel({ data }) {
   
   const sortedMetrics = data.map(d => computeHeavyAggregates(d)).sort((a,b) => b.val - a.val);
+  const cachedMetrics = useMemo(() => {
+    return data.map(d => computeHeavyAggregates(d)).sort((a,b) => b.val - a.val);
+  }, [data]);
 
   return (
-    <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
+    <div className="p-6 bg-white dark:bg-white/5 rounded-xl shadow-md">
       <Chart data={sortedMetrics} />
     </div>
   );`;
  }

  // Generic backup diff
  return `diff --git a/src/index.ts b/src/index.ts
index e69de29..838e123 100644
--- a/src/index.ts
+++ b/src/index.ts
@@ -1,3 +1,6 @@
 export function greet(name: string) {
-  console.log("hello " + name)
+  if (!name) {
+    throw new Error("Name must be provided");
+  }
+  console.log(\`Hello, \${name}!\`);
 }`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prId, mode } = body;

    if (!prId || !mode) {
      return NextResponse.json({ error: "Missing prId or mode parameters" }, { status: 400 });
    }

    // Initialize database connection
    await dbService.init();

    // Find Pull Request
    const pr = await dbService.pullRequests.findUnique(prId);
    if (!pr) {
      return NextResponse.json({ error: "Pull Request not found" }, { status: 404 });
    }

    // Get Mock Diff matching this PR's repository
    const repoName = pr.repository?.name || "";
    const diffContent = getRepositoryMockDiff(repoName);

    // Append custom review guidelines from the repository to the diff payload
    const customRules = pr.repository?.customRules 
      ? `\n\n[CUSTOM TEAM CODING RULES TO ENFORCE]:\n${pr.repository.customRules}` 
      : "";

    // Trigger AI Engine
    const reviewResult = await runAIReview({
      prId,
      mode,
      diffContent: diffContent + customRules
    });

    // Save Review in DB
    const providers = await dbService.aiProviders.findMany();
    const activeProvider = providers.find((p: any) => p.isActive) || providers.find((p: any) => p.isFallback) || providers[0];
    
    const savedReview = await dbService.reviews.create({
      prId,
      mode,
      decision: reviewResult.decision,
      healthScore: reviewResult.healthScore,
      durationMs: reviewResult.durationMs,
      tokensUsed: reviewResult.tokensUsed,
      cost: reviewResult.cost,
      providerId: activeProvider?.id || "openai"
    });

    // Save Review comments
    const reviewCommentsData = reviewResult.comments.map(c => ({
      reviewId: savedReview.id,
      filePath: c.filePath,
      lineNumber: c.lineNumber,
      severity: c.severity,
      category: c.category,
      content: c.content,
      codeSnippet: c.codeSnippet,
      suggestion: c.suggestion
    }));

    if (reviewCommentsData.length > 0) {
      await dbService.reviewComments.createMany(reviewCommentsData);
    }

    // Update PR Status
    // In a real environment, we would also hit the GitHub/GitLab API to post status check markers.
    await dbService.auditLogs.create(
      "AI_REVIEW_COMPLETED", 
      `Completed AI Review for PR #${pr.number} in ${mode} mode (Score: ${reviewResult.healthScore}%)`
    );

    return NextResponse.json({
      success: true,
      review: {
        ...savedReview,
        comments: reviewCommentsData,
        provider: activeProvider
      },
      summary: reviewResult.summary
    });

  } catch (e: any) {
    console.error("API Review processing error:", e);
    return NextResponse.json({ error: e.message || "Failed to process review" }, { status: 500 });
  }
}
