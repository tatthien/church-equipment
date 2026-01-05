/*
  Warnings:

  - You are about to drop the column `brand` on the `equipment` table. All the data in the column will be lost.
  - You are about to alter the column `purchase_date` on the `equipment` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_equipment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "purchase_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'new',
    "department_id" INTEGER,
    "created_by" INTEGER,
    "brand_id" INTEGER,
    CONSTRAINT "equipment_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "equipment_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "equipment_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_equipment" ("brand_id", "created_at", "created_by", "department_id", "id", "name", "purchase_date", "status") SELECT "brand_id", "created_at", "created_by", "department_id", "id", "name", "purchase_date", "status" FROM "equipment";
DROP TABLE "equipment";
ALTER TABLE "new_equipment" RENAME TO "equipment";
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'user'
);
INSERT INTO "new_users" ("created_at", "id", "name", "password", "username") SELECT "created_at", "id", "name", "password", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
