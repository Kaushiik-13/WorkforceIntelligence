import { EmployeeExplorer } from "@/components/employee-explorer";
import { PageHeader } from "@/components/ui";

export default function EmployeesPage() {
  return (
    <>
      <PageHeader
        description="Search and inspect the employee master using live records from Supabase."
        eyebrow="Employee explorer"
        title="Find and inspect records"
      />
      <EmployeeExplorer />
    </>
  );
}
