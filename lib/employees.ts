import "server-only";

import { z } from "zod";

export const employeeColumns = [
  "id",
  '"Personnel Number"',
  '"Employee Group"',
  '"Function"',
  '"Location"',
  '"Gender Key"',
  '"Birth date"',
  '"Date of Joinin"',
  '"Entry for Retirement"',
  '"Designation Text"',
].join(",");

const nullableText = z
  .union([z.string().trim().max(160), z.null()])
  .optional()
  .transform((value) => value === "" || value === undefined ? null : value);

const nullableDate = z
  .union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD date format."),
    z.literal(""),
    z.null(),
  ])
  .optional()
  .transform((value) => value === "" || value === undefined ? null : value)
  .refine(
    (value) => value === null || !Number.isNaN(Date.parse(`${value}T00:00:00Z`)),
    "Enter a valid date.",
  );

const employeeShape = {
  personnel_number: z.string().trim().min(1, "Personnel number is required.").max(50),
  employee_group: nullableText,
  function_name: nullableText,
  location_name: nullableText,
  gender_key: nullableText,
  birth_date: nullableDate,
  joining_date: nullableDate,
  retirement_date: nullableDate,
  designation: nullableText,
};

export const createEmployeeSchema = z.object(employeeShape).strict();
export const updateEmployeeSchema = z
  .object(employeeShape)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update.");

export type EmployeeMutation = z.infer<typeof createEmployeeSchema>;

type RawEmployee = {
  id: string;
  "Personnel Number": string | null;
  "Employee Group": string | null;
  Function: string | null;
  Location: string | null;
  "Gender Key": string | null;
  "Birth date": string | null;
  "Date of Joinin": string | null;
  "Entry for Retirement": string | null;
  "Designation Text": string | null;
};

export function toEmployeeDto(row: RawEmployee) {
  return {
    id: row.id,
    personnel_number: row["Personnel Number"],
    employee_group: row["Employee Group"],
    function_name: row.Function,
    location_name: row.Location,
    gender_key: row["Gender Key"],
    birth_date: row["Birth date"],
    joining_date: row["Date of Joinin"],
    retirement_date: row["Entry for Retirement"],
    designation: row["Designation Text"],
  };
}

export function toEmployeeRow(input: Partial<EmployeeMutation>) {
  const row: Record<string, string | null> = {};

  if (input.personnel_number !== undefined) {
    row["Pers.No."] = input.personnel_number;
    row["Personnel Number"] = input.personnel_number;
  }
  if (input.employee_group !== undefined) row["Employee Group"] = input.employee_group;
  if (input.function_name !== undefined) row.Function = input.function_name;
  if (input.location_name !== undefined) row.Location = input.location_name;
  if (input.gender_key !== undefined) row["Gender Key"] = input.gender_key;
  if (input.birth_date !== undefined) row["Birth date"] = input.birth_date;
  if (input.joining_date !== undefined) row["Date of Joinin"] = input.joining_date;
  if (input.retirement_date !== undefined) row["Entry for Retirement"] = input.retirement_date;
  if (input.designation !== undefined) row["Designation Text"] = input.designation;

  return row;
}

export function validationError(error: z.ZodError) {
  return Response.json(
    {
      error: "Please correct the employee details.",
      fields: error.flatten().fieldErrors,
    },
    { status: 400 },
  );
}

export function databaseError(message: string, error: { code?: string; message: string }) {
  console.error(message, error);

  if (error.code === "23505") {
    return Response.json({ error: "That personnel number already exists." }, { status: 409 });
  }

  return Response.json({ error: message }, { status: 500 });
}
