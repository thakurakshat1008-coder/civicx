CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`issueId` int,
	`actorId` int,
	`type` enum('REPORT','UPVOTE','STATUS_CHANGE','VERIFICATION','RESOLUTION') NOT NULL,
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `issues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`category` enum('Streetlight','Garbage','Road Damage','Water Leakage','Drainage','Traffic','Pollution','Public Infrastructure','Environment','Other') NOT NULL,
	`severity` enum('Low','Medium','High','Critical') NOT NULL,
	`status` enum('REPORTED','IN_PROGRESS','RESOLVED') NOT NULL DEFAULT 'REPORTED',
	`latitude` decimal(10,7) NOT NULL,
	`longitude` decimal(10,7) NOT NULL,
	`locationLabel` varchar(255) NOT NULL,
	`imageUrl` text,
	`anonymous` int NOT NULL DEFAULT 0,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `issues_id` PRIMARY KEY(`id`),
	CONSTRAINT `issue_location_lookup` UNIQUE(`latitude`,`longitude`,`createdAt`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`issueId` int,
	`type` varchar(64) NOT NULL,
	`message` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `statusHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`issueId` int NOT NULL,
	`previousStatus` enum('REPORTED','IN_PROGRESS','RESOLVED'),
	`newStatus` enum('REPORTED','IN_PROGRESS','RESOLVED') NOT NULL,
	`changedBy` int NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `statusHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `upvotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`issueId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `upvotes_id` PRIMARY KEY(`id`),
	CONSTRAINT `upvote_issue_user_unique` UNIQUE(`issueId`,`userId`)
);
