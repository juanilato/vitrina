-- CreateTable
CREATE TABLE "public"."Notificacion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leidaAt" TIMESTAMP(3),

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notificacion_userId_userType_idx" ON "public"."Notificacion"("userId", "userType");

-- CreateIndex
CREATE INDEX "Notificacion_leida_createdAt_idx" ON "public"."Notificacion"("leida", "createdAt");

-- CreateIndex
CREATE INDEX "Notificacion_tipo_createdAt_idx" ON "public"."Notificacion"("tipo", "createdAt");
