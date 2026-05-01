-- DropForeignKey
ALTER TABLE "user_store_assignments" DROP CONSTRAINT "user_store_assignments_store_id_fkey";

-- DropIndex
DROP INDEX "user_store_assignments_user_id_store_id_key";

-- AlterTable
ALTER TABLE "user_store_assignments" ALTER COLUMN "store_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user_store_assignments" ADD CONSTRAINT "user_store_assignments_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
