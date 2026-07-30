-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "trainers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "training_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "hodId" TEXT NOT NULL,
    "courseTitle" TEXT NOT NULL,
    "trainerName" TEXT,
    "proposedStart" DATETIME NOT NULL,
    "proposedEnd" DATETIME NOT NULL,
    "justification" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" DATETIME,
    "decidedById" TEXT,
    CONSTRAINT "training_requests_hodId_fkey" FOREIGN KEY ("hodId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "training_requests_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "training_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT,
    "employeeName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "hodId" TEXT NOT NULL,
    "courseTitle" TEXT NOT NULL,
    "trainerName" TEXT NOT NULL,
    "trainingStart" DATETIME NOT NULL,
    "trainingEnd" DATETIME NOT NULL,
    "trainingDays" INTEGER NOT NULL,
    "ratingToken" TEXT NOT NULL,
    "staffRatingSubmittedAt" DATETIME,
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
    "supEvaluatedAt" DATETIME,
    "supEvaluatedById" TEXT,
    "reminderDueAt" DATETIME NOT NULL,
    "reminderSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "training_records_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "training_requests" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "training_records_hodId_fkey" FOREIGN KEY ("hodId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "training_records_supEvaluatedById_fkey" FOREIGN KEY ("supEvaluatedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
