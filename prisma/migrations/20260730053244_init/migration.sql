-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_requests" (
    "id" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "hodId" TEXT NOT NULL,
    "courseTitle" TEXT NOT NULL,
    "trainerName" TEXT,
    "proposedStart" TIMESTAMP(3) NOT NULL,
    "proposedEnd" TIMESTAMP(3) NOT NULL,
    "justification" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "decidedById" TEXT,

    CONSTRAINT "training_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_records" (
    "id" TEXT NOT NULL,
    "requestId" TEXT,
    "employeeName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "hodId" TEXT NOT NULL,
    "courseTitle" TEXT NOT NULL,
    "trainerName" TEXT NOT NULL,
    "trainingStart" TIMESTAMP(3) NOT NULL,
    "trainingEnd" TIMESTAMP(3) NOT NULL,
    "trainingDays" INTEGER NOT NULL,
    "ratingToken" TEXT NOT NULL,
    "staffRatingSubmittedAt" TIMESTAMP(3),
    "q1Content" TEXT,
    "q2Related" TEXT,
    "q2Suggestion" TEXT,
    "q3Effective" TEXT,
    "q3Further" TEXT,
    "q4Comment" TEXT,
    "q5Importance" INTEGER,
    "q6Materials" INTEGER,
    "q7Presenter" INTEGER,
    "q8Adequacy" INTEGER,
    "q9Expectation" INTEGER,
    "q10Overall" INTEGER,
    "superiorEvaluated" BOOLEAN NOT NULL DEFAULT false,
    "supQ1" INTEGER,
    "supQ2" INTEGER,
    "supQ3" INTEGER,
    "supQ4" INTEGER,
    "supQ5" INTEGER,
    "supComment" TEXT,
    "supEvaluatedAt" TIMESTAMP(3),
    "supEvaluatedById" TEXT,
    "reminderDueAt" TIMESTAMP(3) NOT NULL,
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "branches_name_key" ON "branches"("name");

-- CreateIndex
CREATE UNIQUE INDEX "courses_title_key" ON "courses"("title");

-- CreateIndex
CREATE UNIQUE INDEX "trainers_name_key" ON "trainers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "training_records_requestId_key" ON "training_records"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "training_records_ratingToken_key" ON "training_records"("ratingToken");

-- AddForeignKey
ALTER TABLE "training_requests" ADD CONSTRAINT "training_requests_hodId_fkey" FOREIGN KEY ("hodId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_requests" ADD CONSTRAINT "training_requests_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "training_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_hodId_fkey" FOREIGN KEY ("hodId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_supEvaluatedById_fkey" FOREIGN KEY ("supEvaluatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
