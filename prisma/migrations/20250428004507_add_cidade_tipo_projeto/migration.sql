/*
  Warnings:

  - Added the required column `cidade` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoProjeto` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "cidade" TEXT NOT NULL,
ADD COLUMN     "tipoProjeto" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;
