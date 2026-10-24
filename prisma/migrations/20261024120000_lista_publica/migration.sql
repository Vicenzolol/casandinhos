-- AlterTable: links de produtos de inspiração
ALTER TABLE "enxoval_items" ADD COLUMN "links" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Remove reservas duplicadas (mesmo usuário + mesmo item), mantendo a mais antiga
DELETE FROM "reservas" r
USING "reservas" r2
WHERE r."userId" = r2."userId"
  AND r."itemId" = r2."itemId"
  AND (r."dataReserva", r."id") > (r2."dataReserva", r2."id");

-- CreateIndex
CREATE UNIQUE INDEX "reservas_userId_itemId_key" ON "reservas"("userId", "itemId");

-- CreateIndex
CREATE INDEX "reservas_itemId_idx" ON "reservas"("itemId");
