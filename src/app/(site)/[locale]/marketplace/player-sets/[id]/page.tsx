import { SetDetailClient } from "./SetDetailClient";

export default async function PlayerSetPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  return <SetDetailClient id={id} />;
}
