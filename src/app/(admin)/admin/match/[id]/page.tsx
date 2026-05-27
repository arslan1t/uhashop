import type { Metadata } from "next";
import { MatchScorerClient } from "./MatchScorerClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Match ${id} — UHA Scorer` };
}

export default async function MatchScorerPage({ params }: Props) {
  const { id } = await params;
  return <MatchScorerClient matchId={id} />;
}
