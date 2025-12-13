CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(100) NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`name` varchar(100),
	`role` varchar(20) NOT NULL,
	`department_id` varchar(50),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `waiting_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`citizen_id` int NOT NULL,
	`department_id` varchar(50) NOT NULL,
	`ticket_number` int NOT NULL,
	`status` varchar(20) NOT NULL,
	`staff_id` int,
	`room_id` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waiting_queue_id` PRIMARY KEY(`id`)
);
