import type { NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/utils/supabase/server";

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  const page = positiveInteger(request.nextUrl.searchParams.get("page"), 1);
  const requestedPageSize = positiveInteger(request.nextUrl.searchParams.get("page_size"), 10);
  const pageSize = Math.min(requestedPageSize, 50);
  const search = (request.nextUrl.searchParams.get("search") ?? "").trim().slice(0, 100) || null;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_employee_directory", {
    p_employee_group: request.nextUrl.searchParams.get("employee_group")?.trim() || null,
    p_function: request.nextUrl.searchParams.get("function")?.trim() || null,
    p_gender: request.nextUrl.searchParams.get("gender")?.trim() || null,
    p_location: request.nextUrl.searchParams.get("location")?.trim() || null,
    p_page: page,
    p_page_size: pageSize,
    p_search: search,
  });

  if (error || !data) {
    console.error("Employee directory RPC failed", error);
    return Response.json({ error: "Unable to load employee records." }, { status: 500 });
  }

  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
