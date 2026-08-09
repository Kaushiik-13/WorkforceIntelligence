import {
  createEmployeeSchema,
  databaseError,
  employeeColumns,
  toEmployeeDto,
  toEmployeeRow,
  validationError,
} from "@/lib/employees";
import { createSupabaseAdminClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("employees")
      .select(employeeColumns)
      .order("Personnel Number", { ascending: true })
      .limit(1000);

    if (error) return databaseError("Unable to load employee records.", error);

    const rows = (data ?? []) as unknown as Parameters<typeof toEmployeeDto>[0][];

    return Response.json(
      { data: rows.map(toEmployeeDto), total: rows.length },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Employee directory configuration failed", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load employee records." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  const parsed = createEmployeeSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const supabase = createSupabaseAdminClient();
    const { data: duplicate, error: duplicateError } = await supabase
      .from("employees")
      .select("id")
      .eq("Personnel Number", parsed.data.personnel_number)
      .maybeSingle();

    if (duplicateError) return databaseError("Unable to validate the personnel number.", duplicateError);
    if (duplicate) {
      return Response.json({ error: "That personnel number already exists." }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("employees")
      .insert(toEmployeeRow(parsed.data))
      .select(employeeColumns)
      .single();

    if (error) return databaseError("Unable to create the employee record.", error);

    return Response.json(
      { data: toEmployeeDto(data as unknown as Parameters<typeof toEmployeeDto>[0]) },
      { status: 201 },
    );
  } catch (error) {
    console.error("Employee creation configuration failed", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to create the employee record." },
      { status: 500 },
    );
  }
}
