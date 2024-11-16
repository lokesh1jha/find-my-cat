-- CreateTable
CREATE TABLE "game" (
    "id" SERIAL NOT NULL,
    "creator_address" TEXT,
    "game_title" TEXT,
    "currency" TEXT,
    "wager_amount" DECIMAL,
    "max_attempts" INTEGER,
    "max_time" INTEGER,
    "start_date" BIGINT,
    "end_date" BIGINT,
    "actionId" TEXT,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responses" (
    "id" SERIAL NOT NULL,
    "account" TEXT NOT NULL,
    "game_id" INTEGER,
    "selected_cells" JSONB NOT NULL,
    "attempts_used" INTEGER NOT NULL,
    "completion_time" INTEGER NOT NULL,
    "is_cat_found" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "responses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
