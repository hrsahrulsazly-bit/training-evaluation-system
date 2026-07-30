import { auth } from "@/lib/auth";
import LookupsClient from "./lookups-client";

export default async function LookupsPage() {
  const session = await auth();
  return <LookupsClient currentUserId={session!.user.id} />;
}
