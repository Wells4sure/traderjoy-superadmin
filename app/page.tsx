import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Root() {
  const jar = await cookies();
  if (jar.get("sa_session")?.value === "1") {
    redirect("/dashboard");
  }
  redirect("/login");
}
