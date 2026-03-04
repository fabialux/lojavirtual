-- CreateTable
CREATE TABLE "Promocao" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "botao" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Promocao_pkey" PRIMARY KEY ("id")
);
