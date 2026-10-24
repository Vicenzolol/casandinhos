-- AlterTable: links de produtos de inspiração
ALTER TABLE "enxoval_items" ADD COLUMN "links" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Antes de remover duplicatas, junta os comentários delas na reserva mais antiga
WITH dup AS (
  SELECT "userId", "itemId",
         (array_agg("id" ORDER BY "dataReserva", "id"))[1] AS manter,
         string_agg(NULLIF(btrim("comentario"), ''), ' | ' ORDER BY "dataReserva", "id") AS comentarios
  FROM "reservas"
  GROUP BY "userId", "itemId"
  HAVING count(*) > 1
)
UPDATE "reservas" r
SET "comentario" = dup.comentarios
FROM dup
WHERE r."id" = dup.manter;

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
