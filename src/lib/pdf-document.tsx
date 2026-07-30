import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type RecordWithHod = {
  employeeName: string;
  position: string;
  branch: string;
  hod: { name: string };
  courseTitle: string;
  trainerName: string;
  trainingStart: Date;
  trainingEnd: Date;
  trainingDays: number;
  q1Content: string | null;
  q2Related: string | null;
  q2Suggestion: string | null;
  q3Effective: string | null;
  q3Further: string | null;
  q4Comment: string | null;
  q5Importance: number | null;
  q6Materials: number | null;
  q7Presenter: number | null;
  q8Adequacy: number | null;
  q9Expectation: number | null;
  q10Overall: number | null;
  staffRatingSubmittedAt: Date | null;
  superiorEvaluated: boolean;
  supQ1: number | null;
  supQ2: number | null;
  supQ3: number | null;
  supQ4: number | null;
  supQ5: number | null;
  supComment: string | null;
  supEvaluatedAt: Date | null;
};

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#111827" },
  title: { fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 18, textDecoration: "underline" },
  sectionTitle: { fontSize: 13, fontWeight: 700, fontStyle: "italic", color: "#1e3a8a", marginTop: 14, marginBottom: 8 },
  subTitle: { fontSize: 11, fontWeight: 700, color: "#1d4ed8", marginBottom: 4, marginTop: 10 },
  infoRow: { flexDirection: "row", marginBottom: 2 },
  infoLabel: { width: 130, fontWeight: 700 },
  infoValue: { flex: 1, fontWeight: 700 },
  dateRow: { marginBottom: 4 },
  dateLabel: { fontWeight: 700 },
  dateValue: { fontWeight: 700, marginTop: 1 },
  qaBlock: { marginBottom: 8 },
  question: { color: "#374151" },
  answer: { fontWeight: 700, marginTop: 1 },
  legendRow: { flexDirection: "row", gap: 10, marginBottom: 6 },
  legendItem: { fontSize: 8, fontWeight: 700 },
  table: { borderWidth: 1, borderColor: "#94a3b8", marginBottom: 8 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#94a3b8" },
  tableRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#cbd5e1" },
  colNo: { width: 28, padding: 4, fontSize: 9, borderRightWidth: 1, borderRightColor: "#cbd5e1" },
  colQuestion: { flex: 1, padding: 4, fontSize: 9, borderRightWidth: 1, borderRightColor: "#cbd5e1" },
  colRating: { width: 60, padding: 4, fontSize: 9, textAlign: "center" },
  tableHeaderText: { fontWeight: 700, color: "#ffffff" },
  commentBox: { borderWidth: 1, borderColor: "#94a3b8", padding: 6, marginTop: 4, marginBottom: 10 },
  footerDates: { marginTop: 8 },
  footerNote: { marginTop: 24, textAlign: "center", fontSize: 8, fontStyle: "italic", color: "#6b7280" },
});

const fmt = (d: Date | null) =>
  d ? new Date(d).toLocaleDateString("en-GB").replace(/\//g, "-") : "-";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>: {value || "-"}</Text>
    </View>
  );
}

function QA({ q, a }: { q: string; a: string }) {
  return (
    <View style={styles.qaBlock} wrap={false}>
      <Text style={styles.question}>{q}</Text>
      <Text style={styles.answer}>{a || "-"}</Text>
    </View>
  );
}

function RatingTable({
  rows,
}: {
  rows: { no: string; question: string; rating: number | null }[];
}) {
  return (
    <View style={styles.table} wrap={false}>
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.colNo, styles.tableHeaderText]}>No</Text>
        <Text style={[styles.colQuestion, styles.tableHeaderText]}>QUESTION</Text>
        <Text style={[styles.colRating, styles.tableHeaderText]}>Rating Scale</Text>
      </View>
      {rows.map((r) => (
        <View style={styles.tableRow} key={r.no} wrap={false}>
          <Text style={styles.colNo}>{r.no}</Text>
          <Text style={styles.colQuestion}>{r.question}</Text>
          <Text style={styles.colRating}>{r.rating ?? "-"}</Text>
        </View>
      ))}
    </View>
  );
}

export function TrainingRecordPdf({ record }: { record: RecordWithHod }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>TRAINING EVALUATION FORM 3.0</Text>

        <Text style={styles.sectionTitle}>Employee Information</Text>
        <InfoRow label="Employee Name" value={record.employeeName} />
        <InfoRow label="Position" value={record.position} />
        <InfoRow label="Branch / Department" value={record.branch} />
        <InfoRow label="HOD / HOBU" value={record.hod.name} />

        <Text style={styles.sectionTitle}>Training Details</Text>
        <InfoRow label="Training Start" value={fmt(record.trainingStart)} />
        <InfoRow label="Training End" value={fmt(record.trainingEnd)} />
        <InfoRow label="Training Days" value={String(record.trainingDays)} />
        <InfoRow label="Course Title" value={record.courseTitle} />
        <InfoRow label="Trainer Name" value={record.trainerName} />

        <Text style={styles.sectionTitle}>Trainee Evaluation</Text>
        <Text style={styles.subTitle}>Part A: Learning Outcome</Text>
        <QA q="Q1: Training content (What have you learned from this course)?" a={record.q1Content ?? ""} />
        <QA
          q="Q2: Related to current job?"
          a={`${record.q2Related ?? "-"}${record.q2Suggestion ? `, ${record.q2Suggestion}` : ""}`}
        />
        <QA
          q="Q3: Training Effectiveness?"
          a={`${record.q3Effective ?? "-"}${record.q3Further ? `, ${record.q3Further}` : ""}`}
        />
        <QA q="Q4: Comment" a={record.q4Comment ?? ""} />

        <Text style={styles.subTitle}>Part B: Rating Scale</Text>
        <View style={styles.legendRow}>
          <Text style={[styles.legendItem, { color: "#dc2626" }]}>1: Irrelevant</Text>
          <Text style={[styles.legendItem, { color: "#ea580c" }]}>2: Somewhat Irrelevant</Text>
          <Text style={[styles.legendItem, { color: "#16a34a" }]}>3: Relevant</Text>
          <Text style={[styles.legendItem, { color: "#16a34a" }]}>4: Important</Text>
          <Text style={[styles.legendItem, { color: "#16a34a" }]}>5: Very Important</Text>
        </View>
        <RatingTable
          rows={[
            { no: "Q5", question: "The importance of this training to you in carrying out your role and responsibilities.", rating: record.q5Importance },
            { no: "Q6", question: "Effectiveness of the materials presented in this training session", rating: record.q6Materials },
            { no: "Q7", question: "Effectiveness of the presenter/s in this training session.", rating: record.q7Presenter },
            { no: "Q8", question: "The adequacy of the materials that were presented during the session.", rating: record.q8Adequacy },
            { no: "Q9", question: "The training session meets my expectations.", rating: record.q9Expectation },
            { no: "Q10", question: "The overall rating of the training session.", rating: record.q10Overall },
          ]}
        />

        <Text style={styles.sectionTitle}>Superior Evaluation</Text>
        <Text style={styles.subTitle}>
          Post-Training Effectiveness Evaluation{" "}
          {record.superiorEvaluated ? "" : "(Not yet completed)"}
        </Text>
        <RatingTable
          rows={[
            { no: "1", question: "The employee is able to apply the acquired knowledge in their work", rating: record.supQ1 },
            { no: "2", question: "Improvement in work performance", rating: record.supQ2 },
            { no: "3", question: "Improvement in skills", rating: record.supQ3 },
            { no: "4", question: "Improvement in productivity", rating: record.supQ4 },
            { no: "5", question: "Overall evaluation", rating: record.supQ5 },
          ]}
        />

        <View wrap={false}>
          <Text style={{ fontWeight: 700 }}>Additional Comments:</Text>
          <View style={styles.commentBox}>
            <Text>{record.supComment || "-"}</Text>
          </View>

          <View style={styles.footerDates}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Employee Evaluation Submission Date</Text>
              <Text style={styles.dateValue}>: {fmt(record.staffRatingSubmittedAt)}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Superior Evaluation Completion Date</Text>
              <Text style={styles.dateValue}>: {fmt(record.supEvaluatedAt)}</Text>
            </View>
          </View>

          <Text style={styles.footerNote}>
            This document is generated by the Training Evaluation System.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
