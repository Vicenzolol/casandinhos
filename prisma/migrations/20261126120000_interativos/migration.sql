-- CreateTable
CREATE TABLE "cotas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "valorParte" INTEGER NOT NULL,
    "totalPartes" INTEGER NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contribuicoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "partes" INTEGER NOT NULL,
    "mensagem" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "txid" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cotaId" TEXT NOT NULL,

    CONSTRAINT "contribuicoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recados" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "autorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "musicas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "artista" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "tocada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "musicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votos_musica" (
    "id" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "musicaId" TEXT NOT NULL,

    CONSTRAINT "votos_musica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "miniaturaChave" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "miniaturaUrl" TEXT NOT NULL,
    "largura" INTEGER NOT NULL,
    "altura" INTEGER NOT NULL,
    "oculta" BOOLEAN NOT NULL DEFAULT false,
    "autorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fotos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_perguntas" (
    "id" TEXT NOT NULL,
    "pergunta" TEXT NOT NULL,
    "opcoes" TEXT[],
    "correta" INTEGER NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_perguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_respostas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "respostas" JSONB NOT NULL,
    "acertos" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "tempoMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_respostas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contribuicoes_cotaId_idx" ON "contribuicoes"("cotaId");

-- CreateIndex
CREATE INDEX "recados_status_idx" ON "recados"("status");

-- CreateIndex
CREATE UNIQUE INDEX "votos_musica_musicaId_autorId_key" ON "votos_musica"("musicaId", "autorId");

-- CreateIndex
CREATE INDEX "fotos_oculta_createdAt_idx" ON "fotos"("oculta", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_respostas_autorId_key" ON "quiz_respostas"("autorId");

-- AddForeignKey
ALTER TABLE "contribuicoes" ADD CONSTRAINT "contribuicoes_cotaId_fkey" FOREIGN KEY ("cotaId") REFERENCES "cotas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votos_musica" ADD CONSTRAINT "votos_musica_musicaId_fkey" FOREIGN KEY ("musicaId") REFERENCES "musicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

