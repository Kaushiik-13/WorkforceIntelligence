export type ImportEmployee = {
  personnel_number: string;
  employee_group: string;
  function_name: string;
  location_name: string;
  gender_key: string;
  birth_date: string;
  joining_date: string;
  retirement_date: string;
  designation: string;
};

export type SpreadsheetCell = string | number | boolean | Date | null | undefined;

export type ValidatedImportRow = {
  employee: ImportEmployee;
  issues: string[];
  rowNumber: number;
};

export type ImportValidation = {
  missingColumns: string[];
  rows: ValidatedImportRow[];
};

type EmployeeKey = keyof ImportEmployee;

const columns: Array<{
  aliases: string[];
  header: string;
  key: EmployeeKey;
  type: "date" | "text";
}> = [
  { aliases: ["personnelnumber", "persno"], header: "Personnel Number", key: "personnel_number", type: "text" },
  { aliases: ["employeegroup"], header: "Employee Group", key: "employee_group", type: "text" },
  { aliases: ["function", "functionname"], header: "Function", key: "function_name", type: "text" },
  { aliases: ["location", "locationname"], header: "Location", key: "location_name", type: "text" },
  { aliases: ["genderkey", "gender"], header: "Gender Key", key: "gender_key", type: "text" },
  { aliases: ["birthdate", "dateofbirth"], header: "Birth date", key: "birth_date", type: "date" },
  { aliases: ["dateofjoinin", "dateofjoining", "joiningdate"], header: "Date of Joining", key: "joining_date", type: "date" },
  { aliases: ["entryforretirement", "retirementdate"], header: "Entry for Retirement", key: "retirement_date", type: "date" },
  { aliases: ["designationtext", "designation"], header: "Designation Text", key: "designation", type: "text" },
];

function normalizeHeader(value: SpreadsheetCell) {
  return String(value ?? "").trim().toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}

function textValue(value: SpreadsheetCell) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return "";
  return String(value).trim();
}

function isoDate(year: number, month: number, day: number) {
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year
    || candidate.getUTCMonth() !== month - 1
    || candidate.getUTCDate() !== day
  ) return null;

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function excelSerialDate(value: number) {
  if (!Number.isFinite(value) || value < 1 || value > 2958465) return null;
  const date = new Date(Date.UTC(1899, 11, 30) + Math.round(value) * 86_400_000);
  return isoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function spreadsheetDate(value: SpreadsheetCell) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return isoDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }
  if (typeof value === "number") return excelSerialDate(value);

  const text = String(value ?? "").trim();
  if (!text) return null;
  if (/^\d{5}(?:\.0+)?$/.test(text)) return excelSerialDate(Number(text));

  const parts = text.split(/[\-/.]/).map((part) => Number(part.trim()));
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) return null;

  if (/^\d{4}[\-/.]/.test(text)) return isoDate(parts[0], parts[1], parts[2]);

  const [first, second, year] = parts;
  if (year < 1000) return null;

  if (first > 12) return isoDate(year, second, first);
  if (second > 12) return isoDate(year, first, second);
  return isoDate(year, second, first);
}

function emptyEmployee(): ImportEmployee {
  return {
    personnel_number: "",
    employee_group: "",
    function_name: "",
    location_name: "",
    gender_key: "",
    birth_date: "",
    joining_date: "",
    retirement_date: "",
    designation: "",
  };
}

export function validateSpreadsheetRows(inputRows: SpreadsheetCell[][]): ImportValidation {
  if (!inputRows.length) return { missingColumns: columns.map((column) => column.header), rows: [] };

  const normalizedHeaders = inputRows[0].map(normalizeHeader);
  const columnIndexes = new Map<EmployeeKey, number>();
  const missingColumns: string[] = [];

  for (const column of columns) {
    const index = normalizedHeaders.findIndex((header) => column.aliases.includes(header));
    if (index === -1) missingColumns.push(column.header);
    else columnIndexes.set(column.key, index);
  }

  if (missingColumns.length) return { missingColumns, rows: [] };

  const seenPersonnelNumbers = new Set<string>();
  const rows: ValidatedImportRow[] = [];

  inputRows.slice(1).forEach((sourceRow, index) => {
    if (sourceRow.every((cell) => String(cell ?? "").trim() === "")) return;

    const employee = emptyEmployee();
    const issues: string[] = [];

    for (const column of columns) {
      const cell = sourceRow[columnIndexes.get(column.key) ?? -1];
      if (column.type === "date") {
        const date = spreadsheetDate(cell);
        if (!date) issues.push(`${column.header} is missing or invalid`);
        else employee[column.key] = date;
      } else {
        const value = textValue(cell);
        if (!value) issues.push(`${column.header} is missing`);
        else employee[column.key] = value;
      }
    }

    if (employee.personnel_number) {
      if (seenPersonnelNumbers.has(employee.personnel_number)) {
        issues.push("Personnel Number is duplicated in this file");
      }
      seenPersonnelNumbers.add(employee.personnel_number);
    }

    rows.push({ employee, issues, rowNumber: index + 2 });
  });

  return { missingColumns, rows };
}
