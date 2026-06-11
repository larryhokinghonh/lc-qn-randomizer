import { NextResponse } from "next/server";

import { apiError, noStoreHeaders } from "@/lib/api-response";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CounterRow = {
  spin_count: string;
};

export async function GET() {
  try {
    const { rows } = await pool.query<CounterRow>(`
      SELECT COALESCE(
        (SELECT spin_count FROM counters WHERE id = 1),
        0
      )::text AS spin_count;
    `);

    return NextResponse.json(
      { spin_count: Number(rows[0].spin_count) },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    return apiError("/api/counter", "Unable to load counter.", error);
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json(
      { error: "Cross-origin requests are not allowed." },
      { status: 403, headers: noStoreHeaders },
    );
  }

  try {
    const { rows } = await pool.query<CounterRow>(`
      INSERT INTO counters (id, spin_count)
      VALUES (1, 1)
      ON CONFLICT (id) DO UPDATE
        SET spin_count = counters.spin_count + 1,
            updated_at = NOW()
      RETURNING spin_count;
    `);

    return NextResponse.json(
      { spin_count: Number(rows[0].spin_count) },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    return apiError("/api/counter", "Unable to update counter.", error);
  }
}
