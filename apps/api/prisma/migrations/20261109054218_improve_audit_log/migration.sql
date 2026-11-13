-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_ticketId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "ticketId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
