-- CreateTable
CREATE TABLE "GraphicStandard" (
    "id" SERIAL NOT NULL,
    "cidade" TEXT NOT NULL,
    "tipoProjeto" TEXT NOT NULL,
    "nomeParametro" TEXT NOT NULL,
    "valorEsperado" TEXT NOT NULL,
    "fonte" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GraphicStandard_pkey" PRIMARY KEY ("id")
);
