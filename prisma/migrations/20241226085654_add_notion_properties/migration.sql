-- CreateTable
CREATE TABLE "NotionDetails" (
    "id" TEXT NOT NULL,
    "class" TEXT,
    "type" TEXT,
    "reviewed" BOOLEAN DEFAULT false,

    CONSTRAINT "NotionDetails_pkey" PRIMARY KEY ("id")
);
