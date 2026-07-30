/**
 * One-off migration script: imports the legacy Google Sheet ("Training
 * Evaluation Data 3.0") into the new schema.
 *
 * Usage:
 *   1. In Google Sheets: File > Download > Comma Separated Values (.csv),
 *      save it as legacy-export.csv in the project root.
 *   2. npm run db:seed:legacy
 *
 * Expected header row (exact legacy column names):
 * Employee_Name,Position,Branch,HOD,Training_Start,Training_End,
 * Course_Title,Trainer_Name,Training_Days,Q1_Content,Q2_Related,
 * Q2_Suggestion,Q3_Effective,Q3_Further,Q4_Comment,Q5_Importance,
 * Q6_Materials,Q7_Presenter,Q8_Adequacy,Q9_Expectation,Q10_Overall,
 * Submitted_At,Superior_Evaluated,Sup_Q1,Sup_Q2,Sup_Q3,Sup_Q4,Sup_Q5,
 * Sup_Comment,Sup_Evaluated_At,Sup_Name,Id_PDF
 *
 * Every distinct HOD name becomes a SUPERIOR account with a placeholder
 * email (name.slug@ghcl.local) and a random temporary password — an admin
 * must update each superior's real email + password afterwards via
 * Admin > Urus Senarai before the 3-month reminder emails will reach them.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync, existsSync } from "fs";
import { randomBytes } from "crypto";
import { addDays, daysBetween } from "../src/lib/dates";

const prisma = new PrismaClient();

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // skip
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function slugEmail(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return `${slug}@ghcl.local`;
}

async function getOrCreateSuperior(name: string, cache: Map<string, string>) {
  if (cache.has(name)) return cache.get(name)!;
  const email = slugEmail(name);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    cache.set(name, existing.id);
    return existing.id;
  }
  const tempPassword = randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "SUPERIOR" },
  });
  cache.set(name, user.id);
  console.log(`Created superior "${name}" <${email}> temp password: ${tempPassword}`);
  return user.id;
}

function toInt(v: string): number | null {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function toDate(v: string): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function main() {
  const path = process.argv[2] ?? "legacy-export.csv";
  if (!existsSync(path)) {
    console.error(`File not found: ${path}`);
    console.error("Export the legacy Google Sheet as CSV and save it as legacy-export.csv first.");
    process.exit(1);
  }

  const rows = parseCsv(readFileSync(path, "utf-8"));
  const [header, ...dataRows] = rows;
  const col = (name: string) => header.indexOf(name);

  const superiorCache = new Map<string, string>();
  let imported = 0;
  let skipped = 0;

  for (const r of dataRows) {
    const get = (name: string) => r[col(name)]?.trim() ?? "";

    const employeeName = get("Employee_Name");
    const hodName = get("HOD");
    const trainingStart = toDate(get("Training_Start"));
    const trainingEnd = toDate(get("Training_End"));

    if (!employeeName || !hodName || !trainingStart || !trainingEnd) {
      skipped++;
      continue;
    }

    const branchName = get("Branch") || "UNKNOWN";
    await prisma.branch.upsert({
      where: { name: branchName },
      update: {},
      create: { name: branchName },
    });

    const hodId = await getOrCreateSuperior(hodName, superiorCache);

    const superiorEvaluated = /^(true|1|yes)$/i.test(get("Superior_Evaluated"));
    const supEvaluatedByName = get("Sup_Name");
    const supEvaluatedById = superiorEvaluated && supEvaluatedByName
      ? await getOrCreateSuperior(supEvaluatedByName, superiorCache)
      : undefined;

    await prisma.trainingRecord.create({
      data: {
        employeeName,
        position: get("Position") || "-",
        branch: branchName,
        hodId,
        courseTitle: get("Course_Title") || "-",
        trainerName: get("Trainer_Name") || "-",
        trainingStart,
        trainingEnd,
        trainingDays: toInt(get("Training_Days")) ?? daysBetween(trainingStart, trainingEnd),
        staffRatingSubmittedAt: toDate(get("Submitted_At")),
        q1Content: get("Q1_Content") || null,
        q2Related: get("Q2_Related") || null,
        q2Suggestion: get("Q2_Suggestion") || null,
        q3Effective: get("Q3_Effective") || null,
        q3Further: get("Q3_Further") || null,
        q4Comment: get("Q4_Comment") || null,
        q5Importance: toInt(get("Q5_Importance")),
        q6Materials: toInt(get("Q6_Materials")),
        q7Presenter: toInt(get("Q7_Presenter")),
        q8Adequacy: toInt(get("Q8_Adequacy")),
        q9Expectation: toInt(get("Q9_Expectation")),
        q10Overall: toInt(get("Q10_Overall")),
        superiorEvaluated,
        supQ1: toInt(get("Sup_Q1")),
        supQ2: toInt(get("Sup_Q2")),
        supQ3: toInt(get("Sup_Q3")),
        supQ4: toInt(get("Sup_Q4")),
        supQ5: toInt(get("Sup_Q5")),
        supComment: get("Sup_Comment") || null,
        supEvaluatedAt: toDate(get("Sup_Evaluated_At")),
        supEvaluatedById,
        reminderDueAt: addDays(trainingEnd, 90),
        reminderSentAt: superiorEvaluated ? new Date() : null,
      },
    });
    imported++;
  }

  console.log(`Imported ${imported} training records, skipped ${skipped} incomplete rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
