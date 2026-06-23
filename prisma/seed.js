const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Manually load environment variables from .env
try {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index > 0) {
        const key = trimmed.substring(0, index).trim();
        let val = trimmed.substring(index + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
} catch (e) {
  console.warn("Failed to load .env file in seed script:", e);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const MOCK_DB_PATH = path.join(__dirname, "db-mock-store.json");
  if (!fs.existsSync(MOCK_DB_PATH)) {
    console.error("Mock data file not found at " + MOCK_DB_PATH);
    return;
  }
  const mockDbInstance = JSON.parse(fs.readFileSync(MOCK_DB_PATH, "utf-8"));

  // Check if already seeded
  const count = await prisma.billingPlan.count();
  if (count > 0) {
    console.log("Database already has data. Skipping seed.");
    return;
  }

  console.log("Seeding billing plans...");
  await prisma.billingPlan.createMany({
    data: mockDbInstance.billingPlans
  });

  console.log("Seeding AI providers...");
  await prisma.aIProvider.createMany({
    data: mockDbInstance.aiProviders
  });

  console.log("Seeding users...");
  await prisma.user.createMany({
    data: mockDbInstance.users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      passwordHash: u.passwordHash,
      avatarUrl: u.avatarUrl,
      createdAt: new Date(u.createdAt),
      updatedAt: new Date(u.updatedAt)
    }))
  });

  console.log("Seeding organizations...");
  await prisma.organization.createMany({
    data: mockDbInstance.organizations.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      planId: o.planId,
      stripeCustomerId: o.stripeCustomerId,
      stripeSubscriptionId: o.stripeSubscriptionId,
      createdAt: new Date(o.createdAt),
      updatedAt: new Date(o.updatedAt)
    }))
  });

  console.log("Seeding memberships...");
  await prisma.orgMember.createMany({
    data: [
      { orgId: "org-1", userId: "usr-1", role: "ORG_OWNER" },
      { orgId: "org-1", userId: "usr-2", role: "DEVELOPER" }
    ]
  });

  console.log("Seeding teams...");
  await prisma.team.createMany({
    data: mockDbInstance.teams.map((t) => ({
      id: t.id,
      orgId: t.orgId,
      name: t.name,
      createdAt: new Date(t.createdAt)
    }))
  });

  console.log("Seeding repositories...");
  await prisma.repository.createMany({
    data: mockDbInstance.repositories.map((r) => ({
      id: r.id,
      orgId: r.orgId,
      teamId: r.teamId,
      name: r.name,
      provider: r.provider,
      githubId: r.githubId ? BigInt(r.githubId) : null,
      oauthToken: r.oauthToken,
      webhookSecret: r.webhookSecret,
      isActive: r.isActive,
      customRules: r.customRules,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt)
    }))
  });

  console.log("Seeding pull requests...");
  await prisma.pullRequest.createMany({
    data: mockDbInstance.pullRequests.map((pr) => ({
      id: pr.id,
      repoId: pr.repoId,
      number: pr.number,
      title: pr.title,
      author: pr.author,
      sourceBranch: pr.sourceBranch,
      targetBranch: pr.targetBranch,
      status: pr.status,
      githubUrl: pr.githubUrl,
      createdAt: new Date(pr.createdAt),
      updatedAt: new Date(pr.updatedAt)
    }))
  });

  console.log("Seeding reviews...");
  await prisma.review.createMany({
    data: mockDbInstance.reviews.map((rv) => ({
      id: rv.id,
      prId: rv.prId,
      reviewerId: rv.reviewerId,
      mode: rv.mode,
      decision: rv.decision,
      healthScore: rv.healthScore,
      durationMs: rv.durationMs,
      tokensUsed: rv.tokensUsed,
      cost: rv.cost,
      providerId: rv.providerId,
      createdAt: new Date(rv.createdAt)
    }))
  });

  console.log("Seeding comments...");
  await prisma.reviewComment.createMany({
    data: mockDbInstance.reviewComments.map((rc) => ({
      id: rc.id,
      reviewId: rc.reviewId,
      filePath: rc.filePath,
      lineNumber: rc.lineNumber,
      severity: rc.severity,
      category: rc.category,
      content: rc.content,
      codeSnippet: rc.codeSnippet,
      suggestion: rc.suggestion,
      githubCommentId: rc.githubCommentId ? BigInt(rc.githubCommentId) : null,
      createdAt: new Date(rc.createdAt)
    }))
  });

  console.log("Seeding usage logs...");
  await prisma.usageLog.createMany({
    data: mockDbInstance.usageLogs.map((ul) => ({
      id: ul.id,
      providerId: ul.providerId,
      tokensPrompt: ul.tokensPrompt,
      tokensCompletion: ul.tokensCompletion,
      cost: ul.cost,
      createdAt: new Date(ul.createdAt)
    }))
  });

  console.log("Seeding audit logs...");
  await prisma.auditLog.createMany({
    data: mockDbInstance.auditLogs.map((al) => ({
      id: al.id,
      userId: al.userId,
      action: al.action,
      details: al.details,
      ipAddress: al.ipAddress,
      createdAt: new Date(al.createdAt)
    }))
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
