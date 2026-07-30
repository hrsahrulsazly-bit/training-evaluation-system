import { z } from "zod";

export const trfSchema = z.object({
  employeeName: z.string().min(1, "Nama diperlukan"),
  position: z.string().min(1, "Jawatan diperlukan"),
  branch: z.string().min(1, "Cawangan diperlukan"),
  hodId: z.string().min(1, "Sila pilih HOD"),
  courseTitle: z.string().min(1, "Tajuk kursus diperlukan"),
  trainerName: z.string().optional(),
  proposedStart: z.string().min(1),
  proposedEnd: z.string().min(1),
  justification: z.string().min(1, "Sila nyatakan justifikasi"),
});

export const bulkTrainingSchema = z.object({
  employeeName: z.string().min(1),
  position: z.string().min(1),
  branch: z.string().min(1),
  hodId: z.string().min(1),
  courseTitle: z.string().min(1),
  trainerName: z.string().min(1),
  trainingStart: z.string().min(1),
  trainingEnd: z.string().min(1),
});

const rating1to5 = z.coerce.number().int().min(1).max(5);

export const staffRatingSchema = z.object({
  q1Content: z.string().min(1),
  q2Related: z.enum(["Yes", "No"]),
  q2Suggestion: z.string().optional(),
  q3Effective: z.enum(["Yes", "No"]),
  q3Further: z.string().optional(),
  q4Comment: z.string().optional(),
  q5Importance: rating1to5,
  q6Materials: rating1to5,
  q7Presenter: rating1to5,
  q8Adequacy: rating1to5,
  q9Expectation: rating1to5,
  q10Overall: rating1to5,
});

export const superiorRatingSchema = z.object({
  supQ1: rating1to5,
  supQ2: rating1to5,
  supQ3: rating1to5,
  supQ4: rating1to5,
  supQ5: rating1to5,
  supComment: z.string().optional(),
});
