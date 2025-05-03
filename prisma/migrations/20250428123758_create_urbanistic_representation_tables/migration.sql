/*
  Warnings:

  - You are about to drop the `Legislation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Parameter` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Parameter" DROP CONSTRAINT "Parameter_legislationId_fkey";

-- DropTable
DROP TABLE "Legislation";

-- DropTable
DROP TABLE "Parameter";

-- CreateTable
CREATE TABLE "UrbanisticParameter" (
    "id" SERIAL NOT NULL,
    "cidade" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "tipoProjeto" TEXT NOT NULL,
    "usoPermitido" TEXT NOT NULL,
    "taxaOcupacaoMaxima" DOUBLE PRECISION NOT NULL,
    "coeficienteAproveitamentoMaximo" DOUBLE PRECISION NOT NULL,
    "recuoFrontalMinimo" DOUBLE PRECISION NOT NULL,
    "recuoLateralMinimo" DOUBLE PRECISION NOT NULL,
    "recuoFundoMinimo" DOUBLE PRECISION NOT NULL,
    "alturaMaxima" INTEGER NOT NULL,
    "numeroMaximoPavimentos" INTEGER NOT NULL,
    "permeabilidadeMinima" DOUBLE PRECISION NOT NULL,
    "observacoes" TEXT,

    CONSTRAINT "UrbanisticParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepresentationRule" (
    "id" SERIAL NOT NULL,
    "cidade" TEXT NOT NULL,
    "tipoProjeto" TEXT NOT NULL,
    "itemObrigatorio" TEXT NOT NULL,
    "descricaoExigencia" TEXT NOT NULL,
    "formatoCarimbo" TEXT,
    "obrigatoriedadeCotas" BOOLEAN NOT NULL,
    "obrigatoriedadeEscala" BOOLEAN NOT NULL,
    "observacoes" TEXT,

    CONSTRAINT "RepresentationRule_pkey" PRIMARY KEY ("id")
);
