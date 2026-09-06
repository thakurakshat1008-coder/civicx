import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { activities, getActivities, getCategoryBreakdown, getDashboardStats, getDb, getIssue, getIssueHistory, getIssueSupport, getNotifications, getStatusBreakdown, issues, notifications, statusHistory, upvotes } from "./db";
import { storagePut } from "./storage";
import { and, desc, eq, sql } from "drizzle-orm";

const category = z.enum(["Streetlight", "Garbage", "Road Damage", "Water Leakage", "Drainage", "Traffic", "Pollution", "Public Infrastructure", "Environment", "Other"]);
const severity = z.enum(["Low", "Medium", "High", "Critical"]);
const status = z.enum(["REPORTED", "IN_PROGRESS", "RESOLVED"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  media: router({
    upload: protectedProcedure.input(z.object({ dataUrl: z.string().max(7_000_000), fileName: z.string().max(160), mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]) })).mutation(async ({ input, ctx }) => {
      const match = input.dataUrl.match(/^data:[^;]+;base64,(.+)$/);
      if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid image payload" });
      const bytes = Buffer.from(match[1], "base64");
      if (bytes.byteLength > 5_000_000) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Image must be under 5 MB" });
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
      return storagePut(`${ctx.user.id}-issues/${safeName}`, bytes, input.mimeType);
    }),
  }),
  issues: router({
    list: publicProcedure.input(z.object({ search: z.string().optional(), status: status.optional(), category: category.optional() }).optional()).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const filters = [];
      if (input?.status) filters.push(eq(issues.status, input.status));
      if (input?.category) filters.push(eq(issues.category, input.category));
      if (input?.search) filters.push(sql`(${issues.title} like ${`%${input.search}%`} or ${issues.description} like ${`%${input.search}%`} or ${issues.locationLabel} like ${`%${input.search}%`})`);
      return db.select().from(issues).where(filters.length ? and(...filters) : undefined).orderBy(desc(issues.createdAt)).limit(100);
    }),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
      const issue = await getIssue(input.id);
      if (!issue) throw new TRPCError({ code: "NOT_FOUND", message: "Issue not found" });
      const [history, support] = await Promise.all([getIssueHistory(input.id), getIssueSupport(input.id, ctx.user?.id)]);
      return { issue, history, support };
    }),
    create: protectedProcedure.input(z.object({ title: z.string().min(4).max(180), description: z.string().min(12), category, severity, latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180), locationLabel: z.string().min(2).max(255), imageUrl: z.string().startsWith("/manus-storage/").optional(), anonymous: z.boolean().default(false) })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Database unavailable" });
      const inserted = await db.insert(issues).values({ ...input, anonymous: input.anonymous ? 1 : 0, createdBy: ctx.user.id, latitude: input.latitude.toString(), longitude: input.longitude.toString() });
      const issueId = Number(inserted[0].insertId);
      await db.insert(activities).values({ issueId, actorId: ctx.user.id, type: "REPORT", message: input.anonymous ? "A new anonymous civic issue was reported." : `${ctx.user.name ?? "A resident"} reported a civic issue.` });
      await db.insert(notifications).values({ userId: ctx.user.id, issueId, type: "REPORT_SUBMITTED", message: "Your civic issue was submitted and is now visible to the community." });
      return { id: issueId };
    }),
    support: protectedProcedure.input(z.object({ issueId: z.number(), supported: z.boolean() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Database unavailable" });
      const existing = await db.select({ id: upvotes.id }).from(upvotes).where(and(eq(upvotes.issueId, input.issueId), eq(upvotes.userId, ctx.user.id))).limit(1);
      if (input.supported && existing.length === 0) {
        await db.insert(upvotes).values({ issueId: input.issueId, userId: ctx.user.id });
        await db.insert(activities).values({ issueId: input.issueId, actorId: ctx.user.id, type: "UPVOTE", message: `${ctx.user.name ?? "A resident"} supported a civic issue.` });
      } else if (!input.supported && existing.length) await db.delete(upvotes).where(eq(upvotes.id, existing[0].id));
      return getIssueSupport(input.issueId, ctx.user.id);
    }),
    updateStatus: adminProcedure.input(z.object({ issueId: z.number(), newStatus: status, note: z.string().max(500).optional() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Database unavailable" });
      const current = await getIssue(input.issueId);
      if (!current) throw new TRPCError({ code: "NOT_FOUND", message: "Issue not found" });
      if (current.status === input.newStatus) return current;
      await db.update(issues).set({ status: input.newStatus }).where(eq(issues.id, input.issueId));
      await db.insert(statusHistory).values({ issueId: input.issueId, previousStatus: current.status, newStatus: input.newStatus, changedBy: ctx.user.id, note: input.note });
      await db.insert(activities).values({ issueId: input.issueId, actorId: ctx.user.id, type: input.newStatus === "RESOLVED" ? "RESOLUTION" : "STATUS_CHANGE", message: `Issue status moved to ${input.newStatus.replace("_", " ").toLowerCase()}.` });
      if (current.createdBy) await db.insert(notifications).values({ userId: current.createdBy, issueId: input.issueId, type: "STATUS_UPDATE", message: `Your issue is now ${input.newStatus.replace("_", " ").toLowerCase()}.` });
      return getIssue(input.issueId);
    }),
  }),
  publicData: router({
    stats: publicProcedure.query(() => getDashboardStats()),
    categories: publicProcedure.query(() => getCategoryBreakdown()),
    statuses: publicProcedure.query(() => getStatusBreakdown()),
    activity: publicProcedure.query(() => getActivities()),
  }),
  profile: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { reports: [], upvotes: [], notifications: [] };
      const reports = await db.select().from(issues).where(eq(issues.createdBy, ctx.user.id)).orderBy(desc(issues.createdAt));
      const supported = await db.select().from(upvotes).where(eq(upvotes.userId, ctx.user.id)).orderBy(desc(upvotes.createdAt));
      const userNotifications = await getNotifications(ctx.user.id);
      return { reports, upvotes: supported, notifications: userNotifications };
    }),
  }),
  notifications: router({ mine: protectedProcedure.query(({ ctx }) => getNotifications(ctx.user.id)) }),
});

export type AppRouter = typeof appRouter;
