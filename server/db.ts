import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { activities, issues, notifications, statusHistory, InsertUser, users, upvotes } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listIssues(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(issues).orderBy(desc(issues.createdAt)).limit(limit);
}

export async function getIssue(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(issues).where(eq(issues.id, id)).limit(1);
  return result[0];
}

export async function getIssueHistory(issueId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(statusHistory).where(eq(statusHistory.issueId, issueId)).orderBy(statusHistory.createdAt);
}

export async function getIssueSupport(issueId: number, userId?: number) {
  const db = await getDb();
  if (!db) return { count: 0, supported: false };
  const countRows = await db.select({ count: sql<number>`count(*)` }).from(upvotes).where(eq(upvotes.issueId, issueId));
  const own = userId ? await db.select({ id: upvotes.id }).from(upvotes).where(and(eq(upvotes.issueId, issueId), eq(upvotes.userId, userId))).limit(1) : [];
  return { count: Number(countRows[0]?.count ?? 0), supported: own.length > 0 };
}

export async function getActivities(limit = 40) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activities).orderBy(desc(activities.createdAt)).limit(limit);
}

export async function getNotifications(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit);
}

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { total: 0, reported: 0, inProgress: 0, resolved: 0, critical: 0, communitySupport: 0 };
  const [total, reported, inProgress, resolved, critical, support] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(issues),
    db.select({ count: sql<number>`count(*)` }).from(issues).where(eq(issues.status, "REPORTED")),
    db.select({ count: sql<number>`count(*)` }).from(issues).where(eq(issues.status, "IN_PROGRESS")),
    db.select({ count: sql<number>`count(*)` }).from(issues).where(eq(issues.status, "RESOLVED")),
    db.select({ count: sql<number>`count(*)` }).from(issues).where(eq(issues.severity, "Critical")),
    db.select({ count: sql<number>`count(*)` }).from(upvotes),
  ]);
  return {
    total: Number(total[0]?.count ?? 0),
    reported: Number(reported[0]?.count ?? 0),
    inProgress: Number(inProgress[0]?.count ?? 0),
    resolved: Number(resolved[0]?.count ?? 0),
    critical: Number(critical[0]?.count ?? 0),
    communitySupport: Number(support[0]?.count ?? 0),
  };
}

export async function getCategoryBreakdown() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ category: issues.category, count: sql<number>`count(*)` }).from(issues).groupBy(issues.category).orderBy(desc(sql`count(*)`));
}

export async function getStatusBreakdown() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ status: issues.status, count: sql<number>`count(*)` }).from(issues).groupBy(issues.status);
}

export { activities, issues, notifications, statusHistory, upvotes, users };
