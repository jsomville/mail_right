/*
  Warnings:

  - You are about to drop the column `tokens` on the `mails` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_mails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "mail_input" TEXT NOT NULL,
    "mail_output" TEXT NOT NULL,
    "prompt_tokens" INTEGER NOT NULL DEFAULT 0,
    "completion_tokens" INTEGER NOT NULL DEFAULT 0,
    "cost" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_mails" ("cost", "createdAt", "id", "mail_input", "mail_output", "user_id") SELECT "cost", "createdAt", "id", "mail_input", "mail_output", "user_id" FROM "mails";
DROP TABLE "mails";
ALTER TABLE "new_mails" RENAME TO "mails";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
