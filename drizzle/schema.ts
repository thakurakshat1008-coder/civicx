import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar, decimal } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const issues = mysqlTable("issues", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", ["Streetlight", "Garbage", "Road Damage", "Water Leakage", "Drainage", "Traffic", "Pollution", "Public Infrastructure", "Environment", "Other"]).notNull(),
  severity: mysqlEnum("severity", ["Low", "Medium", "High", "Critical"]).notNull(),
  status: mysqlEnum("status", ["REPORTED", "IN_PROGRESS", "RESOLVED"]).default("REPORTED").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  locationLabel: varchar("locationLabel", { length: 255 }).notNull(),
  imageUrl: text("imageUrl"),
  anonymous: int("anonymous").default(0).notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  locationIndex: uniqueIndex("issue_location_lookup").on(table.latitude, table.longitude, table.createdAt),
}));

export const upvotes = mysqlTable("upvotes", {
  id: int("id").autoincrement().primaryKey(),
  issueId: int("issueId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  issueUserUnique: uniqueIndex("upvote_issue_user_unique").on(table.issueId, table.userId),
}));

export const statusHistory = mysqlTable("statusHistory", {
  id: int("id").autoincrement().primaryKey(),
  issueId: int("issueId").notNull(),
  previousStatus: mysqlEnum("previousStatus", ["REPORTED", "IN_PROGRESS", "RESOLVED"]),
  newStatus: mysqlEnum("newStatus", ["REPORTED", "IN_PROGRESS", "RESOLVED"]).notNull(),
  changedBy: int("changedBy").notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const activities = mysqlTable("activities", {
  id: int("id").autoincrement().primaryKey(),
  issueId: int("issueId"),
  actorId: int("actorId"),
  type: mysqlEnum("type", ["REPORT", "UPVOTE", "STATUS_CHANGE", "VERIFICATION", "RESOLUTION"]).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  issueId: int("issueId"),
  type: varchar("type", { length: 64 }).notNull(),
  message: text("message").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Issue = typeof issues.$inferSelect;
export type Upvote = typeof upvotes.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type StatusHistory = typeof statusHistory.$inferSelect;
