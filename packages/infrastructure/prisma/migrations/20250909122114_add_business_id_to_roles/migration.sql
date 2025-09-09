-- CreateTable
CREATE TABLE "public"."business" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "document" VARCHAR(20) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "whatsapp" VARCHAR(20) NOT NULL,
    "logo_url" VARCHAR(500),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "document" VARCHAR(20) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" UUID NOT NULL,
    "context" VARCHAR(50) NOT NULL,
    "user_id" UUID NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,
    "ip_address" INET,
    "user_agent" TEXT,
    "business_id" UUID NOT NULL,
    "additional_data" JSONB,
    "updated_fields" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "color" VARCHAR(7) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_email_key" ON "public"."business"("email");

-- CreateIndex
CREATE UNIQUE INDEX "business_document_key" ON "public"."business"("document");

-- CreateIndex
CREATE INDEX "business_document_idx" ON "public"."business"("document");

-- CreateIndex
CREATE INDEX "business_email_idx" ON "public"."business"("email");

-- CreateIndex
CREATE INDEX "business_active_idx" ON "public"."business"("active");

-- CreateIndex
CREATE INDEX "users_business_id_idx" ON "public"."users"("business_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_document_idx" ON "public"."users"("document");

-- CreateIndex
CREATE INDEX "users_active_idx" ON "public"."users"("active");

-- CreateIndex
CREATE INDEX "users_business_id_email_idx" ON "public"."users"("business_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "users_business_id_email_key" ON "public"."users"("business_id", "email");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "public"."audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_context_idx" ON "public"."audit_logs"("context");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "public"."audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_ip_address_idx" ON "public"."audit_logs"("ip_address");

-- CreateIndex
CREATE INDEX "audit_logs_user_agent_idx" ON "public"."audit_logs"("user_agent");

-- CreateIndex
CREATE INDEX "audit_logs_business_id_idx" ON "public"."audit_logs"("business_id");

-- CreateIndex
CREATE INDEX "audit_logs_business_id_context_timestamp_idx" ON "public"."audit_logs"("business_id", "context", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "roles_business_id_idx" ON "public"."roles"("business_id");

-- CreateIndex
CREATE INDEX "roles_business_id_name_idx" ON "public"."roles"("business_id", "name");

-- CreateIndex
CREATE INDEX "roles_business_id_active_idx" ON "public"."roles"("business_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "roles_business_id_name_key" ON "public"."roles"("business_id", "name");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."roles" ADD CONSTRAINT "roles_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
