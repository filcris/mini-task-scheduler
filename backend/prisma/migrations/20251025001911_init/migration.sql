/*
  Warnings:

  - You are about to drop the column `description` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `Task` table. All the data in the column will be lost.
  - The `priority` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'doing', 'done');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('low', 'medium', 'high');

-- DropIndex
DROP INDEX "Task_ownerId_idx";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "description",
DROP COLUMN "dueDate",
ADD COLUMN     "dueAt" TIMESTAMP(3),
DROP COLUMN "priority",
ADD COLUMN     "priority" "TaskPriority" NOT NULL DEFAULT 'medium',
DROP COLUMN "status",
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'todo';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
DROP COLUMN "role",
DROP COLUMN "updatedAt";

-- DropEnum
DROP TYPE "Priority";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "Status";

-- CreateIndex
CREATE INDEX "Task_ownerId_status_priority_idx" ON "Task"("ownerId", "status", "priority");

-- CreateIndex
CREATE INDEX "Task_ownerId_dueAt_idx" ON "Task"("ownerId", "dueAt");
