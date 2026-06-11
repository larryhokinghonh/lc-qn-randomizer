import { NextResponse } from "next/server";

import { apiError, noStoreHeaders } from "@/lib/api-response";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type QuestionRow = {
  question_number: string;
  name: string;
  topics: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  url: string;
  needs_premium: boolean;
  special_topics: string[];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const updatedAfterValues = searchParams.getAll("updated_after");
  const updatedAfter = updatedAfterValues[0];
  const queryParams: string[] = [];
  let updatedFilter = "";

  if (updatedAfterValues.length > 1) {
    return NextResponse.json(
      { error: "updated_after must be provided at most once." },
      { status: 400, headers: noStoreHeaders },
    );
  }

  if (updatedAfter !== undefined) {
    const updatedAfterDate = new Date(updatedAfter);
    const isCanonicalIsoTimestamp =
      updatedAfter.length <= 64 &&
      !Number.isNaN(updatedAfterDate.getTime()) &&
      updatedAfterDate.toISOString() === updatedAfter;

    if (!isCanonicalIsoTimestamp) {
      return NextResponse.json(
        { error: "updated_after must be a valid ISO timestamp." },
        { status: 400, headers: noStoreHeaders },
      );
    }

    queryParams.push(updatedAfter);
    updatedFilter = "WHERE q.updated_at > $1::timestamptz";
  }

  try {
    const syncedAtResult = await pool.query<{ synced_at: Date }>(
      "SELECT NOW() AS synced_at;",
    );
    const syncedAt = syncedAtResult.rows[0].synced_at.toISOString();
    const { rows } = await pool.query<QuestionRow>(
      `
      SELECT
        q.question_number::text AS question_number,
        q.name,
        COALESCE(
          ARRAY_AGG(DISTINCT t.name ORDER BY t.name)
            FILTER (WHERE t.name IS NOT NULL),
          ARRAY[]::text[]
        ) AS topics,
        q.difficulty,
        q.url,
        q.premium_required AS needs_premium,
        COALESCE(
          ARRAY_AGG(DISTINCT st.name ORDER BY st.name)
            FILTER (WHERE st.name IS NOT NULL),
          ARRAY[]::text[]
        ) AS special_topics
      FROM leetcode_questions q
      LEFT JOIN leetcode_question_topics qt
        ON qt.question_id = q.id
      LEFT JOIN topics t
        ON t.id = qt.topic_id
      LEFT JOIN leetcode_question_special_topics qst
        ON qst.question_id = q.id
      LEFT JOIN special_topics st
        ON st.id = qst.special_topic_id
      ${updatedFilter}
      GROUP BY q.id
      ORDER BY q.question_number;
      `,
      queryParams,
    );

    return NextResponse.json(
      {
        questions: rows,
        synced_at: syncedAt,
      },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    return apiError(
      "/api/questions",
      "Unable to load questions.",
      error,
    );
  }
}
