import { NextResponse } from "next/server";

export const noStoreHeaders = {
  "Cache-Control": "no-store",
};

export function apiError(
  route: string,
  message: string,
  error: unknown,
) {
  console.error(`[${route}]`, error);

  return NextResponse.json(
    { error: message },
    {
      status: 500,
      headers: noStoreHeaders,
    },
  );
}
