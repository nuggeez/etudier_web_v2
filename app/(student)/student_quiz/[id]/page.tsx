import pocketbase_instance from "@/app/lib/pocketbase";
import ClientComponent from "./page.client";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await pocketbase_instance
    .collection("quiz")
    .getOne(id, { expand: "users" });

  return (
    <main className="flex flex-col gap-4 max-w-3xl min-h-screen mx-auto py-4">
      <ClientComponent data={record} />
    </main>
  );
}
