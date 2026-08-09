import { z } from "zod";

import {
  createEmployeeSchema,
  databaseError,
  toEmployeeRow,
  validationError,
} from "@/lib/employees";
import { createSupabaseAdminClient } from "@/utils/supabase/server";

const requiredImportFields = [
  "employee_group",
  "function_name",
  "location_name",
  "gender_key",
  "birth_date",
  "joining_date",
  "retirement_date",
  "designation",
] as const;

const importEmployeeSchema = createEmployeeSchema.superRefine((employee, context) => {
  for (const field of requiredImportFields) {
    if (!employee[field]) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${field} is required for spreadsheet imports.`,
        path: [field],
      });
    }
  }
});

const importRequestSchema = z.object({
  employees: z.array(importEmployeeSchema).min(1).max(5000),
}).strict();

function chunks<T>(values: T[], size: number) {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  const parsed = importRequestSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const personnelNumbers = parsed.data.employees.map((employee) => employee.personnel_number);
  const seen = new Set<string>();
  const duplicatedInRequest = [...new Set(personnelNumbers.filter((number) => {
    if (seen.has(number)) return true;
    seen.add(number);
    return false;
  }))];

  if (duplicatedInRequest.length) {
    return Response.json(
      { error: `Duplicate personnel numbers in the file: ${duplicatedInRequest.slice(0, 10).join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const supabase = createSupabaseAdminClient();
    const existingChecks = await Promise.all(chunks(personnelNumbers, 200).map((batch) =>
      supabase
        .from("employees")
        .select('"Personnel Number"')
        .in("Personnel Number", batch),
    ));

    const failedCheck = existingChecks.find((result) => result.error);
    if (failedCheck?.error) {
      return databaseError("Unable to check existing personnel numbers.", failedCheck.error);
    }

    const existingNumbers = existingChecks.flatMap((result) =>
      (result.data ?? []).map((row) => (row as unknown as { "Personnel Number": string })["Personnel Number"]),
    ).filter(Boolean);

    if (existingNumbers.length) {
      return Response.json(
        {
          error: `${existingNumbers.length} personnel number${existingNumbers.length === 1 ? " already exists" : "s already exist"} in Supabase: ${existingNumbers.slice(0, 10).join(", ")}${existingNumbers.length > 10 ? "…" : ""}`,
          duplicate_count: existingNumbers.length,
        },
        { status: 409 },
      );
    }

    const { error } = await supabase
      .from("employees")
      .insert(parsed.data.employees.map((employee) => toEmployeeRow(employee)));

    if (error) return databaseError("Unable to import employee records.", error);

    return Response.json(
      { inserted_count: parsed.data.employees.length },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Employee import configuration failed", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to import employee records." },
      { status: 500 },
    );
  }
}
