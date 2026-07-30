import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const branch = searchParams.get("branch")?.trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const records = await prisma.trainingRecord.findMany({
    where: {
      ...(q ? { employeeName: { contains: q, mode: "insensitive" as const } } : {}),
      ...(branch ? { branch } : {}),
      ...(from || to
        ? {
            trainingStart: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: { hod: { select: { name: true } } },
    orderBy: { trainingStart: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Training Records");
  sheet.columns = [
    { header: "Employee Name", key: "employeeName", width: 28 },
    { header: "Position", key: "position", width: 22 },
    { header: "Branch", key: "branch", width: 12 },
    { header: "HOD", key: "hod", width: 24 },
    { header: "Course Title", key: "courseTitle", width: 36 },
    { header: "Trainer", key: "trainerName", width: 22 },
    { header: "Start", key: "trainingStart", width: 12 },
    { header: "End", key: "trainingEnd", width: 12 },
    { header: "Days", key: "trainingDays", width: 8 },
    { header: "Staff: Content Learned", key: "q1Content", width: 30 },
    { header: "Staff: Q5 Importance", key: "q5Importance", width: 10 },
    { header: "Staff: Q6 Materials", key: "q6Materials", width: 10 },
    { header: "Staff: Q7 Presenter", key: "q7Presenter", width: 10 },
    { header: "Staff: Q8 Adequacy", key: "q8Adequacy", width: 10 },
    { header: "Staff: Q9 Expectation", key: "q9Expectation", width: 10 },
    { header: "Staff: Q10 Overall", key: "q10Overall", width: 10 },
    { header: "Superior Evaluated", key: "superiorEvaluated", width: 12 },
    { header: "Sup Q1", key: "supQ1", width: 8 },
    { header: "Sup Q2", key: "supQ2", width: 8 },
    { header: "Sup Q3", key: "supQ3", width: 8 },
    { header: "Sup Q4", key: "supQ4", width: 8 },
    { header: "Sup Q5", key: "supQ5", width: 8 },
    { header: "Sup Comment", key: "supComment", width: 30 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const r of records) {
    sheet.addRow({
      employeeName: r.employeeName,
      position: r.position,
      branch: r.branch,
      hod: r.hod.name,
      courseTitle: r.courseTitle,
      trainerName: r.trainerName,
      trainingStart: r.trainingStart.toISOString().slice(0, 10),
      trainingEnd: r.trainingEnd.toISOString().slice(0, 10),
      trainingDays: r.trainingDays,
      q1Content: r.q1Content ?? "",
      q5Importance: r.q5Importance ?? "",
      q6Materials: r.q6Materials ?? "",
      q7Presenter: r.q7Presenter ?? "",
      q8Adequacy: r.q8Adequacy ?? "",
      q9Expectation: r.q9Expectation ?? "",
      q10Overall: r.q10Overall ?? "",
      superiorEvaluated: r.superiorEvaluated ? "Yes" : "No",
      supQ1: r.supQ1 ?? "",
      supQ2: r.supQ2 ?? "",
      supQ3: r.supQ3 ?? "",
      supQ4: r.supQ4 ?? "",
      supQ5: r.supQ5 ?? "",
      supComment: r.supComment ?? "",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="training-records-${Date.now()}.xlsx"`,
    },
  });
}
