import { describe, expect, it } from "vitest";

import { spreadsheetDate, validateSpreadsheetRows } from "./employee-import";

const headers = [
  "Personnel Number",
  "Employee Group",
  "Function",
  "Location",
  "Gender Key",
  "Birth date",
  "Date of Joinin",
  "Entry for Retirement",
  "Designation Text",
];

describe("employee spreadsheet validation", () => {
  it("maps a complete employee row into the API shape", () => {
    const result = validateSpreadsheetRows([
      headers,
      ["100001", "Direct", "Sales", "Jaipur", "F", "25/03/1990", "2020-08-26", "25-03-2050", "Manager"],
    ]);

    expect(result.missingColumns).toEqual([]);
    expect(result.rows[0].issues).toEqual([]);
    expect(result.rows[0].employee).toMatchObject({
      birth_date: "1990-03-25",
      joining_date: "2020-08-26",
      retirement_date: "2050-03-25",
      personnel_number: "100001",
    });
  });

  it("reports missing columns and duplicate personnel numbers", () => {
    const missing = validateSpreadsheetRows([["Personnel Number"]]);
    expect(missing.missingColumns).toContain("Employee Group");

    const duplicated = validateSpreadsheetRows([
      headers,
      ["100001", "Direct", "Sales", "Jaipur", "F", "1990-03-25", "2020-08-26", "2050-03-25", "Manager"],
      ["100001", "Direct", "Sales", "Jaipur", "F", "1991-03-25", "2021-08-26", "2051-03-25", "Lead"],
    ]);
    expect(duplicated.rows[1].issues).toContain("Personnel Number is duplicated in this file");
  });

  it("accepts Excel date objects and Excel serial dates", () => {
    expect(spreadsheetDate(new Date(1990, 2, 25))).toBe("1990-03-25");
    expect(spreadsheetDate(32957)).toBe("1990-03-25");
  });
});
