import {
  databaseError,
  employeeColumns,
  toEmployeeDto,
  toEmployeeRow,
  updateEmployeeSchema,
  validationError,
} from "@/lib/employees";
import { createSupabaseAdminClient } from "@/utils/supabase/server";

type EmployeeRouteContext = { params: Promise<{ id: string }> };

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function invalidId() {
  return Response.json({ error: "The employee ID is invalid." }, { status: 400 });
}

export async function GET(_request: Request, context: EmployeeRouteContext) {
  const { id } = await context.params;
  if (!isUuid(id)) return invalidId();

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("employees")
      .select(employeeColumns)
      .eq("id", id)
      .maybeSingle();

    if (error) return databaseError("Unable to load the employee record.", error);
    if (!data) return Response.json({ error: "Employee record not found." }, { status: 404 });

    return Response.json({
      data: toEmployeeDto(data as unknown as Parameters<typeof toEmployeeDto>[0]),
    });
  } catch (error) {
    console.error("Employee read configuration failed", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load the employee record." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: EmployeeRouteContext) {
  const { id } = await context.params;
  if (!isUuid(id)) return invalidId();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  const parsed = updateEmployeeSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const supabase = createSupabaseAdminClient();

    if (parsed.data.personnel_number !== undefined) {
      const { data: duplicate, error: duplicateError } = await supabase
        .from("employees")
        .select("id")
        .eq("Personnel Number", parsed.data.personnel_number)
        .neq("id", id)
        .maybeSingle();

      if (duplicateError) return databaseError("Unable to validate the personnel number.", duplicateError);
      if (duplicate) {
        return Response.json({ error: "That personnel number already exists." }, { status: 409 });
      }
    }

    const { data, error } = await supabase
      .from("employees")
      .update(toEmployeeRow(parsed.data))
      .eq("id", id)
      .select(employeeColumns)
      .maybeSingle();

    if (error) return databaseError("Unable to update the employee record.", error);
    if (!data) return Response.json({ error: "Employee record not found." }, { status: 404 });

    return Response.json({
      data: toEmployeeDto(data as unknown as Parameters<typeof toEmployeeDto>[0]),
    });
  } catch (error) {
    console.error("Employee update configuration failed", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to update the employee record." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: EmployeeRouteContext) {
  const { id } = await context.params;
  if (!isUuid(id)) return invalidId();

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) return databaseError("Unable to delete the employee record.", error);
    if (!data) return Response.json({ error: "Employee record not found." }, { status: 404 });

    return Response.json({ deleted_id: data.id });
  } catch (error) {
    console.error("Employee deletion configuration failed", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to delete the employee record." },
      { status: 500 },
    );
  }
}
