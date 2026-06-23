import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Initialize Prisma lazily to prevent build-time initialization errors when database URL is unverified
let _prismaClient: PrismaClient | null = null;
function getPrisma() {
  if (!_prismaClient) {
    const globalForPrisma = global as unknown as { prisma: PrismaClient };
    const connectionString = process.env.DATABASE_URL;
    
    if (connectionString && !connectionString.includes("mock")) {
      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool);
      _prismaClient = globalForPrisma.prisma || new PrismaClient({ adapter });
    } else {
      // Fallback for mock/empty URL during builds or simulations
      const pool = new Pool();
      const adapter = new PrismaPg(pool);
      _prismaClient = globalForPrisma.prisma || new PrismaClient({ adapter });
    }
    
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = _prismaClient;
    }
  }
  return _prismaClient;
}

export const prismaClient = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const prisma = getPrisma();
    const value = Reflect.get(prisma, prop, receiver);
    if (typeof value === "function") {
      return value.bind(prisma);
    }
    return value;
  }
});

// Path to mock database
const MOCK_DB_PATH = path.join(process.cwd(), "prisma", "db-mock-store.json");

// Helper: Ensure mock DB file exists with seed data
function initializeMockDb() {
  if (fs.existsSync(MOCK_DB_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(MOCK_DB_PATH, "utf-8"));
    } catch (e) {
      console.error("Error reading mock DB, re-initializing...", e);
    }
  }

  // Create Seed Data
  const seedData = {
    users: [
      {
        id: "usr-1",
        email: "alex@acme.com",
        name: "Alex Rivera",
        passwordHash: "demo123",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "usr-2",
        email: "sarah@acme.com",
        name: "Sarah Chen",
        passwordHash: "demo123",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    organizations: [
      {
        id: "org-1",
        name: "Acme Engineering",
        slug: "acme-engineering",
        planId: "pro",
        stripeCustomerId: "cus_mock123",
        stripeSubscriptionId: "sub_mock123",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    billingPlans: [
      {
        id: "free",
        name: "Free Starter",
        priceMonthly: 0,
        prLimitMonth: 10,
        features: ["10 reviews/month", "Fast Review mode", "Standard response times"],
      },
      {
        id: "pro",
        name: "Pro Team",
        priceMonthly: 49,
        prLimitMonth: -1, // unlimited
        features: ["Unlimited reviews", "Deep Review mode", "Security Scans", "Team rules doc uploads", "Dashboard analytics"],
      },
      {
        id: "enterprise",
        name: "Enterprise Core",
        priceMonthly: 199,
        prLimitMonth: -1,
        features: ["SSO & SAML", "Self-hosted configurations", "Custom AI models integration", "Advanced Audit Logs", "Dedicated Support SLA"],
      }
    ],
    teams: [
      { id: "team-1", orgId: "org-1", name: "Core Infrastructure", createdAt: new Date().toISOString() },
      { id: "team-2", orgId: "org-1", name: "Frontend Platform", createdAt: new Date().toISOString() }
    ],
    repositories: [
      {
        id: "repo-1",
        orgId: "org-1",
        teamId: "team-1",
        name: "acme-corp/api-gateway",
        provider: "github",
        githubId: BigInt("8273648"),
        oauthToken: "ghp_mocktoken123456789",
        webhookSecret: "whsec_mock12345",
        isActive: "true",
        customRules: "1. Ensure all async operations are wrapped in try-catch blocks.\n2. Do not log sensitive user parameters.\n3. Keep methods below 40 lines of code.\n4. Prefer standard functional syntax over loops.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "repo-2",
        orgId: "org-1",
        teamId: "team-2",
        name: "acme-corp/developer-dashboard",
        provider: "github",
        githubId: BigInt("9812734"),
        oauthToken: "ghp_mocktokenfront987",
        webhookSecret: "whsec_mock67890",
        isActive: "true",
        customRules: "1. All components must be mobile-first responsive.\n2. Prevent raw inline styling, use Tailwind tokens.\n3. Make sure component files are grouped inside page containers.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "repo-3",
        orgId: "org-1",
        teamId: "team-1",
        name: "acme-corp/database-migrator",
        provider: "github",
        githubId: BigInt("4432123"),
        oauthToken: "ghp_mocktokendb123",
        webhookSecret: "whsec_mock5555",
        isActive: "false",
        customRules: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    pullRequests: [
      {
        id: "pr-1",
        repoId: "repo-1",
        number: 142,
        title: "feat: Add JWT session token validation middleware",
        author: "Alex Rivera",
        sourceBranch: "feature/jwt-validation",
        targetBranch: "main",
        status: "OPEN",
        githubUrl: "https://github.com/acme-corp/api-gateway/pull/142",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        updatedAt: new Date().toISOString(),
      },
      {
        id: "pr-2",
        repoId: "repo-2",
        number: 89,
        title: "bugfix: Resolve race condition in analytics dashboard widgets",
        author: "Sarah Chen",
        sourceBranch: "fix/analytics-race",
        targetBranch: "develop",
        status: "OPEN",
        githubUrl: "https://github.com/acme-corp/developer-dashboard/pull/89",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
        updatedAt: new Date().toISOString(),
      },
      {
        id: "pr-3",
        repoId: "repo-1",
        number: 140,
        title: "refactor: Optimize user lookup database query loop",
        author: "Alex Rivera",
        sourceBranch: "refactor/db-lookup",
        targetBranch: "main",
        status: "MERGED",
        githubUrl: "https://github.com/acme-corp/api-gateway/pull/140",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 86400000 * 1.8).toISOString(),
      }
    ],
    reviews: [
      {
        id: "rev-1",
        prId: "pr-1",
        reviewerId: null, // pure AI review
        mode: "SECURITY",
        decision: "CHANGES_REQUESTED",
        healthScore: 68,
        durationMs: 3420,
        tokensUsed: 1824,
        cost: 0.027,
        providerId: "gemini",
        createdAt: new Date(Date.now() - 3600000 * 1.8).toISOString(), // 1.8 hrs ago
      },
      {
        id: "rev-2",
        prId: "pr-2",
        reviewerId: null,
        mode: "DEEP",
        decision: "APPROVED",
        healthScore: 94,
        durationMs: 4100,
        tokensUsed: 2150,
        cost: 0.032,
        providerId: "openai",
        createdAt: new Date(Date.now() - 3600000 * 4.5).toISOString(), // 4.5 hrs ago
      },
      {
        id: "rev-3",
        prId: "pr-3",
        reviewerId: null,
        mode: "DEEP",
        decision: "APPROVED",
        healthScore: 98,
        durationMs: 2900,
        tokensUsed: 1450,
        cost: 0.022,
        providerId: "groq",
        createdAt: new Date(Date.now() - 86400000 * 1.9).toISOString(),
      }
    ],
    reviewComments: [
      {
        id: "cmt-1",
        reviewId: "rev-1",
        filePath: "src/middleware/auth.ts",
        lineNumber: 24,
        severity: "SECURITY",
        category: "SECURITY",
        content: "Potential security threat: The JWT signature validation is using a hardcoded placeholder fallback secret in production if `process.env.JWT_SECRET` is missing. This could allow attackers to forge tokens.",
        codeSnippet: "const tokenSecret = process.env.JWT_SECRET || \"temp_secret_key\";\nconst decoded = jwt.verify(token, tokenSecret);",
        suggestion: "const tokenSecret = process.env.JWT_SECRET;\nif (!tokenSecret) {\n  throw new Error(\"FATAL: JWT_SECRET environment variable is missing\");\n}\nconst decoded = jwt.verify(token, tokenSecret);",
        githubCommentId: BigInt("109283748"),
        createdAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
      },
      {
        id: "cmt-2",
        reviewId: "rev-1",
        filePath: "src/middleware/auth.ts",
        lineNumber: 41,
        severity: "BUG",
        category: "BUG",
        content: "Null pointer risk: The property `req.headers.authorization` is split directly without validating that the header is present, which will cause a server crash (TypeError) if a request is made without Auth headers.",
        codeSnippet: "const token = req.headers.authorization.split(' ')[1];",
        suggestion: "const authHeader = req.headers.authorization;\nif (!authHeader || !authHeader.startsWith('Bearer ')) {\n  return res.status(401).json({ error: 'Unauthorized: Missing bearer token' });\n}\nconst token = authHeader.split(' ')[1];",
        githubCommentId: BigInt("109283749"),
        createdAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
      },
      {
        id: "cmt-3",
        reviewId: "rev-2",
        filePath: "src/components/AnalyticsPanel.tsx",
        lineNumber: 112,
        severity: "PERFORMANCE",
        category: "PERFORMANCE",
        content: "Unnecessary re-render triggers: The heavy analytics computing loop is defined inside the component render function. Moving it to `useMemo` will prevent frame drops during re-renders.",
        codeSnippet: "const sortedMetrics = data.map(d => computeHeavyAggregates(d)).sort((a,b) => b.val - a.val);",
        suggestion: "const sortedMetrics = useMemo(() => {\n  return data.map(d => computeHeavyAggregates(d)).sort((a,b) => b.val - a.val);\n}, [data]);",
        githubCommentId: BigInt("209283750"),
        createdAt: new Date(Date.now() - 3600000 * 4.5).toISOString(),
      }
    ],
    aiProviders: [
      { id: "openai", name: "OpenAI GPT", modelName: "gpt-4o", apiKeySecure: "", isActive: true, isFallback: false },
      { id: "gemini", name: "Google Gemini", modelName: "gemini-2.5-pro", apiKeySecure: "", isActive: false, isFallback: true },
      { id: "groq", name: "Groq Llama", modelName: "llama-3.3-70b-versatile", apiKeySecure: "", isActive: false, isFallback: false },
      { id: "llama", name: "Meta Llama (Self-Hosted)", modelName: "llama-3-8b-instruct", apiKeySecure: "", isActive: false, isFallback: false }
    ],
    usageLogs: [
      // Mock usage data for visual charts
      { id: "ul-1", providerId: "openai", tokensPrompt: 145000, tokensCompletion: 42000, cost: 1.87, createdAt: new Date(Date.now() - 86400000 * 6).toISOString() },
      { id: "ul-2", providerId: "openai", tokensPrompt: 210000, tokensCompletion: 63000, cost: 2.73, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: "ul-3", providerId: "gemini", tokensPrompt: 89000, tokensCompletion: 23000, cost: 0.56, createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
      { id: "ul-4", providerId: "openai", tokensPrompt: 320000, tokensCompletion: 98000, cost: 4.18, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: "ul-5", providerId: "groq", tokensPrompt: 410000, tokensCompletion: 120000, cost: 0.15, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: "ul-6", providerId: "gemini", tokensPrompt: 180000, tokensCompletion: 54000, cost: 1.17, createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
      { id: "ul-7", providerId: "openai", tokensPrompt: 95000, tokensCompletion: 28000, cost: 1.23, createdAt: new Date().toISOString() },
    ],
    auditLogs: [
      { id: "al-1", userId: "usr-1", action: "ORG_CREATED", details: "Organization Acme Engineering initialized", ipAddress: "127.0.0.1", createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
      { id: "al-2", userId: "usr-1", action: "REPO_CONNECTED", details: "Connected GitHub repository acme-corp/api-gateway", ipAddress: "127.0.0.1", createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: "al-3", userId: "usr-1", action: "REPO_CONNECTED", details: "Connected GitHub repository acme-corp/developer-dashboard", ipAddress: "127.0.0.1", createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
      { id: "al-4", userId: "usr-2", action: "USER_INVITED", details: "Invited developer sarah@acme.com", ipAddress: "127.0.0.1", createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    ]
  };

  // Convert BigInts/Dates to strings for JSON save
  const dataToSave = JSON.stringify(seedData, (key, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  }, 2);

  // Write file
  const prismaDir = path.dirname(MOCK_DB_PATH);
  if (!fs.existsSync(prismaDir)) {
    fs.mkdirSync(prismaDir, { recursive: true });
  }
  fs.writeFileSync(MOCK_DB_PATH, dataToSave, "utf-8");
  return seedData;
}

// Global variable holding data in memory for this session (synced to file)
let mockDbInstance = initializeMockDb();

function saveMockDb() {
  const dataToSave = JSON.stringify(mockDbInstance, (key, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  }, 2);
  fs.writeFileSync(MOCK_DB_PATH, dataToSave, "utf-8");
}

// Check database connection state
let useRealDatabase = false;
export async function checkDbConnection(): Promise<boolean> {
  if (process.env.DATABASE_URL?.includes("mock")) {
    useRealDatabase = false;
    return false;
  }
  try {
    // Attempt a quick query
    await prismaClient.billingPlan.findFirst();
    useRealDatabase = true;
    return true;
  } catch (e) {
    useRealDatabase = false;
    return false;
  }
}

// Standardised Database Service APIs
export const dbService = {
  // Test connection and auto-seed if empty
  async init() {
    const connected = await checkDbConnection();
    if (connected) {
      try {
        // Ensure billing plans are seeded in real DB
        const count = await prismaClient.billingPlan.count();
        if (count === 0) {
          console.log("Database is empty. Seeding billing plans and mock data...");
          
          // 1. Seed Billing Plans
          await prismaClient.billingPlan.createMany({
            data: mockDbInstance.billingPlans
          });

          // 2. Seed AI Providers
          await prismaClient.aIProvider.createMany({
            data: mockDbInstance.aiProviders
          });

          // 3. Seed Users
          await prismaClient.user.createMany({
            data: mockDbInstance.users.map((u: any) => ({
              id: u.id,
              email: u.email,
              name: u.name,
              passwordHash: u.passwordHash,
              avatarUrl: u.avatarUrl,
              createdAt: new Date(u.createdAt),
              updatedAt: new Date(u.updatedAt)
            }))
          });

          // 4. Seed Organizations
          await prismaClient.organization.createMany({
            data: mockDbInstance.organizations.map((o: any) => ({
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

          // 5. Seed Org Memberships
          await prismaClient.orgMember.createMany({
            data: [
              { orgId: "org-1", userId: "usr-1", role: "ORG_OWNER" },
              { orgId: "org-1", userId: "usr-2", role: "DEVELOPER" }
            ]
          });

          // 6. Seed Teams
          await prismaClient.team.createMany({
            data: mockDbInstance.teams.map((t: any) => ({
              id: t.id,
              orgId: t.orgId,
              name: t.name,
              createdAt: new Date(t.createdAt)
            }))
          });

          // 7. Seed Repositories
          await prismaClient.repository.createMany({
            data: mockDbInstance.repositories.map((r: any) => ({
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

          // 8. Seed Pull Requests
          await prismaClient.pullRequest.createMany({
            data: mockDbInstance.pullRequests.map((pr: any) => ({
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

          // 9. Seed Reviews
          await prismaClient.review.createMany({
            data: mockDbInstance.reviews.map((rv: any) => ({
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

          // 10. Seed Review Comments
          await prismaClient.reviewComment.createMany({
            data: mockDbInstance.reviewComments.map((rc: any) => ({
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

          // 11. Seed Usage Logs
          await prismaClient.usageLog.createMany({
            data: mockDbInstance.usageLogs.map((ul: any) => ({
              id: ul.id,
              providerId: ul.providerId,
              tokensPrompt: ul.tokensPrompt,
              tokensCompletion: ul.tokensCompletion,
              cost: ul.cost,
              createdAt: new Date(ul.createdAt)
            }))
          });

          // 12. Seed Audit Logs
          await prismaClient.auditLog.createMany({
            data: mockDbInstance.auditLogs.map((al: any) => ({
              id: al.id,
              userId: al.userId,
              action: al.action,
              details: al.details,
              ipAddress: al.ipAddress,
              createdAt: new Date(al.createdAt)
            }))
          });
          
          console.log("Database seeded successfully!");
        }
      } catch (e) {
        console.error("Failed to seed real DB:", e);
      }
    } else {
      mockDbInstance = initializeMockDb();
    }
  },

  // USERS
  users: {
    async findMany() {
      if (useRealDatabase) return await prismaClient.user.findMany();
      return mockDbInstance.users;
    },
    async findUnique(email: string) {
      if (useRealDatabase) {
        return await prismaClient.user.findUnique({ where: { email } });
      }
      return mockDbInstance.users.find((u: any) => u.email === email) || null;
    },
    async create(data: { email: string; name: string; passwordHash: string; avatarUrl?: string }) {
      if (useRealDatabase) {
        return await prismaClient.user.create({ data });
      }
      const newUser = {
        id: `usr-${Date.now()}`,
        avatarUrl: data.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      mockDbInstance.users.push(newUser);
      saveMockDb();
      return newUser;
    }
  },

  // REPOSITORIES
  repositories: {
    async findMany() {
      if (useRealDatabase) {
        return await prismaClient.repository.findMany({
          orderBy: { createdAt: "desc" }
        });
      }
      return [...mockDbInstance.repositories].sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    async update(id: string, data: { isActive?: string; customRules?: string; teamId?: string }) {
      if (useRealDatabase) {
        return await prismaClient.repository.update({
          where: { id },
          data
        });
      }
      const repo = mockDbInstance.repositories.find((r: any) => r.id === id);
      if (repo) {
        Object.assign(repo, data, { updatedAt: new Date().toISOString() });
        saveMockDb();
      }
      return repo;
    },
    async create(data: { name: string; provider: string; orgId?: string }) {
      const orgId = data.orgId || "org-1";
      if (useRealDatabase) {
        return await prismaClient.repository.create({
          data: {
            name: data.name,
            provider: data.provider,
            orgId,
            oauthToken: "ghp_oauth_default_token",
          }
        });
      }
      const newRepo = {
        id: `repo-${Date.now()}`,
        orgId,
        teamId: "team-1",
        name: data.name,
        provider: data.provider,
        githubId: BigInt(Math.floor(Math.random() * 10000000)).toString(),
        oauthToken: "ghp_mock_token_created",
        webhookSecret: `whsec_created_${Math.floor(Math.random() * 100000)}`,
        isActive: "true",
        customRules: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockDbInstance.repositories.push(newRepo);
      saveMockDb();
      return newRepo;
    }
  },

  // PULL REQUESTS
  pullRequests: {
    async findMany() {
      if (useRealDatabase) {
        return await prismaClient.pullRequest.findMany({
          include: { repository: true, reviews: true },
          orderBy: { createdAt: "desc" }
        });
      }
      return mockDbInstance.pullRequests.map((pr: any) => {
        const repo = mockDbInstance.repositories.find((r: any) => r.id === pr.repoId);
        const reviews = mockDbInstance.reviews.filter((rv: any) => rv.prId === pr.id);
        return { ...pr, repository: repo, reviews };
      }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    async findUnique(id: string) {
      if (useRealDatabase) {
        return await prismaClient.pullRequest.findUnique({
          where: { id },
          include: {
            repository: true,
            reviews: {
              include: { comments: true }
            }
          }
        });
      }
      const pr = mockDbInstance.pullRequests.find((p: any) => p.id === id);
      if (!pr) return null;
      const repo = mockDbInstance.repositories.find((r: any) => r.id === pr.repoId);
      const reviews = mockDbInstance.reviews.filter((rv: any) => rv.prId === pr.id).map((rv: any) => {
        const comments = mockDbInstance.reviewComments.filter((c: any) => c.reviewId === rv.id);
        const provider = mockDbInstance.aiProviders.find((p: any) => p.id === rv.providerId);
        return { ...rv, comments, provider };
      });
      return { ...pr, repository: repo, reviews };
    },
    async create(data: { repoId: string; number: number; title: string; author: string; sourceBranch: string; targetBranch: string; githubUrl: string }) {
      if (useRealDatabase) {
        return await prismaClient.pullRequest.create({
          data: { ...data, status: "OPEN" }
        });
      }
      const newPR = {
        id: `pr-${Date.now()}`,
        status: "OPEN",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      mockDbInstance.pullRequests.push(newPR);
      saveMockDb();
      return newPR;
    }
  },

  // REVIEWS
  reviews: {
    async findMany() {
      if (useRealDatabase) {
        return await prismaClient.review.findMany({
          include: { pullRequest: { include: { repository: true } }, comments: true },
          orderBy: { createdAt: "desc" }
        });
      }
      return mockDbInstance.reviews.map((rv: any) => {
        const pr = mockDbInstance.pullRequests.find((p: any) => p.id === rv.prId);
        const repo = pr ? mockDbInstance.repositories.find((r: any) => r.id === pr.repoId) : null;
        const comments = mockDbInstance.reviewComments.filter((c: any) => c.reviewId === rv.id);
        const prWithRepo = pr ? { ...pr, repository: repo } : null;
        return { ...rv, pullRequest: prWithRepo, comments };
      }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    async create(data: { prId: string; mode: string; decision: string; healthScore: number; durationMs: number; tokensUsed: number; cost: number; providerId: string }) {
      if (useRealDatabase) {
        return await prismaClient.review.create({
          data: {
            prId: data.prId,
            mode: data.mode as any,
            decision: data.decision as any,
            healthScore: data.healthScore,
            durationMs: data.durationMs,
            tokensUsed: data.tokensUsed,
            cost: data.cost,
            providerId: data.providerId,
          }
        });
      }
      const newReview = {
        id: `rev-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...data,
      };
      mockDbInstance.reviews.push(newReview);
      saveMockDb();
      return newReview;
    }
  },

  // REVIEW COMMENTS
  reviewComments: {
    async createMany(comments: Array<{ reviewId: string; filePath: string; lineNumber: number; severity: string; category: string; content: string; codeSnippet?: string; suggestion?: string }>) {
      if (useRealDatabase) {
        return await prismaClient.reviewComment.createMany({
          data: comments.map(c => ({
            ...c,
            severity: c.severity as any,
            githubCommentId: BigInt(Math.floor(Math.random() * 100000000))
          }))
        });
      }
      const created = comments.map(c => {
        const comment = {
          id: `cmt-${Math.floor(Math.random() * 1000000)}`,
          githubCommentId: Math.floor(Math.random() * 100000000).toString(),
          createdAt: new Date().toISOString(),
          ...c,
        };
        mockDbInstance.reviewComments.push(comment);
        return comment;
      });
      saveMockDb();
      return created;
    }
  },

  // AI PROVIDERS
  aiProviders: {
    async findMany() {
      if (useRealDatabase) return await prismaClient.aIProvider.findMany();
      return mockDbInstance.aiProviders;
    },
    async update(id: string, data: { isActive?: boolean; isFallback?: boolean; modelName?: string; apiKeySecure?: string }) {
      if (useRealDatabase) {
        return await prismaClient.aIProvider.update({
          where: { id },
          data
        });
      }
      const provider = mockDbInstance.aiProviders.find((p: any) => p.id === id);
      if (provider) {
        // If setting active, deactivate others
        if (data.isActive) {
          mockDbInstance.aiProviders.forEach((p: any) => { p.isActive = false; });
        }
        Object.assign(provider, data);
        saveMockDb();
      }
      return provider;
    }
  },

  // USAGE LOGS & ANALYTICS
  usageLogs: {
    async findMany() {
      if (useRealDatabase) return await prismaClient.usageLog.findMany();
      return mockDbInstance.usageLogs;
    },
    async create(data: { providerId: string; tokensPrompt: number; tokensCompletion: number; cost: number }) {
      if (useRealDatabase) {
        return await prismaClient.usageLog.create({ data });
      }
      const newLog = {
        id: `ul-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...data,
      };
      mockDbInstance.usageLogs.push(newLog);
      saveMockDb();
      return newLog;
    }
  },

  // TEAMS
  teams: {
    async findMany() {
      if (useRealDatabase) return await prismaClient.team.findMany();
      return mockDbInstance.teams;
    },
    async create(name: string) {
      if (useRealDatabase) {
        return await prismaClient.team.create({
          data: { name, orgId: "org-1" }
        });
      }
      const newTeam = {
        id: `team-${Date.now()}`,
        orgId: "org-1",
        name,
        createdAt: new Date().toISOString()
      };
      mockDbInstance.teams.push(newTeam);
      saveMockDb();
      return newTeam;
    }
  },

  // AUDIT LOGS
  auditLogs: {
    async findMany() {
      if (useRealDatabase) return await prismaClient.auditLog.findMany({ orderBy: { createdAt: "desc" } });
      return [...mockDbInstance.auditLogs].sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    async create(action: string, details: string) {
      if (useRealDatabase) {
        return await prismaClient.auditLog.create({
          data: { action, details, userId: "usr-1", ipAddress: "127.0.0.1" }
        });
      }
      const newLog = {
        id: `al-${Date.now()}`,
        userId: "usr-1",
        action,
        details,
        ipAddress: "127.0.0.1",
        createdAt: new Date().toISOString()
      };
      mockDbInstance.auditLogs.push(newLog);
      saveMockDb();
      return newLog;
    }
  }
};
