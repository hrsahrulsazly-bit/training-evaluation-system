import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const adminHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ghcl.local" },
    update: {},
    create: {
      name: "HR Admin",
      email: "admin@ghcl.local",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const superiorHash = await bcrypt.hash("ChangeMe123!", 10);
  const superior = await prisma.user.upsert({
    where: { email: "ahmad.ridha@ghcl.local" },
    update: {},
    create: {
      name: "AHMAD RIDHA BIN OMAR",
      email: "ahmad.ridha@ghcl.local",
      passwordHash: superiorHash,
      role: "SUPERIOR",
    },
  });

  for (const name of ["GHCL", "OKLG", "OSJ", "OSBN", "OTN", "OPJ", "OHDD"]) {
    await prisma.branch.upsert({ where: { name }, update: {}, create: { name } });
  }

  for (const title of [
    "GRID CONTRACTOR QUALIFIED PERSON REFRESHER (GCQPR)",
    "MICROSOFT EXCEL FOUNDATION TO INTERMEDIATE",
    "HAZARD IDENTIFICATION, RISK ASSESSMENT & RISK CONTROL",
  ]) {
    await prisma.course.upsert({ where: { title }, update: {}, create: { title } });
  }

  for (const name of ["TNB ILSAS", "MIK TEGUH RESOURCES", "IR MOHD FAIRUZ ABD RAZAK"]) {
    await prisma.trainer.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log("Seeded admin:", admin.email, "(password:", adminPassword, ")");
  console.log("Seeded superior:", superior.email, "(password: ChangeMe123!)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
