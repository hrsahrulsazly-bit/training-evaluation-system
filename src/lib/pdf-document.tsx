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
  q3Effective: string | null;
  q4Comment: string | null;
  q5Importance: number | null;
  q6Materials: number | null;
  q7Presenter: number | null;
  q8Adequacy: number | null;
  q9Expectation: number | null;
  q10Overall: number | null;
  superiorEvaluated: boolean;
  supQ1: number | null;
  supQ2: number | null;
  supQ3: number | null;
  supQ4: number | null;
  supQ5: number | null;
  supComment: string | null;
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 12 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#1d4ed8" },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 140, color: "#475569" },
  value: { flex: 1 },
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "-"}</Text>
    </View>
  );
}

const fmt = (d: Date) => new Date(d).toLocaleDateString("en-MY", { year: "numeric", month: "short", day: "numeric" });

export function TrainingRecordPdf({ record }: { record: RecordWithHod }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Borang Penilaian Latihan</Text>

        <View style={styles.section}>
          <Row label="Nama Pekerja" value={record.employeeName} />
          <Row label="Jawatan" value={record.position} />
          <Row label="Cawangan" value={record.branch} />
          <Row label="Superior / HOD" value={record.hod.name} />
          <Row label="Kursus" value={record.courseTitle} />
          <Row label="Trainer" value={record.trainerName} />
          <Row
            label="Tarikh Latihan"
            value={`${fmt(record.trainingStart)} - ${fmt(record.trainingEnd)} (${record.trainingDays} hari)`}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Penilaian Staf</Text>
          <Row label="Apa yang dipelajari" value={record.q1Content ?? ""} />
          <Row label="Berkaitan tugas?" value={record.q2Related ?? ""} />
          <Row label="Latihan berkesan?" value={record.q3Effective ?? ""} />
          <Row label="Ulasan" value={record.q4Comment ?? ""} />
          <Row label="Kepentingan (1-5)" value={String(record.q5Importance ?? "-")} />
          <Row label="Bahan (1-5)" value={String(record.q6Materials ?? "-")} />
          <Row label="Penyampai (1-5)" value={String(record.q7Presenter ?? "-")} />
          <Row label="Kecukupan (1-5)" value={String(record.q8Adequacy ?? "-")} />
          <Row label="Jangkaan (1-5)" value={String(record.q9Expectation ?? "-")} />
          <Row label="Keseluruhan (1-5)" value={String(record.q10Overall ?? "-")} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Penilaian Superior (3 Bulan) {record.superiorEvaluated ? "" : "- Belum Dinilai"}
          </Text>
          <Row label="Relevan dengan tugas (1-5)" value={String(record.supQ1 ?? "-")} />
          <Row label="Peningkatan kemahiran (1-5)" value={String(record.supQ2 ?? "-")} />
          <Row label="Peningkatan prestasi (1-5)" value={String(record.supQ3 ?? "-")} />
          <Row label="Impak jabatan (1-5)" value={String(record.supQ4 ?? "-")} />
          <Row label="Keseluruhan (1-5)" value={String(record.supQ5 ?? "-")} />
          <Row label="Ulasan Superior" value={record.supComment ?? ""} />
        </View>
      </Page>
    </Document>
  );
}
