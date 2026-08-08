import { Download, Plus, Trash2 } from "lucide-react";

import { ActionButton, PageHeader, Panel } from "@/components/ui";

const employees = [
  ["100000", "Sales Executive", "Jaipur", "Direct", "62", "46 yrs"],
  ["100001", "Account Manager", "Chennai", "Direct", "55", "39 yrs"],
  ["100002", "Sales Analyst", "Bengaluru", "Direct", "48", "32 yrs"],
  ["100003", "Regional Lead", "Pune", "Direct", "41", "25 yrs"],
  ["100004", "Sales Executive", "Nashik", "Direct", "34", "18 yrs"],
  ["100005", "Account Manager", "Jaipur", "Direct", "27", "11 yrs"],
  ["100006", "Sales Analyst", "Chennai", "Direct", "57", "41 yrs"],
  ["100007", "Regional Lead", "Bengaluru", "Direct", "50", "33 yrs"],
  ["100008", "Sales Executive", "Pune", "Direct", "42", "26 yrs"],
  ["100009", "Account Manager", "Nashik", "Direct", "35", "19 yrs"],
  ["100010", "Sales Analyst", "Jaipur", "Direct", "28", "12 yrs"],
  ["100011", "Regional Lead", "Chennai", "Direct", "58", "42 yrs"],
];

export default function EmployeesPage() {
  return (
    <>
      <PageHeader
        action={<ActionButton variant="primary"><Plus size={16} />Add employee</ActionButton>}
        description="Search the analytical model, inspect derived metrics, and maintain employee records."
        eyebrow="Employee explorer"
        title="Find and inspect records"
      />

      <Panel className="employee-panel" subtitle="100 filtered records" title="Employee master">
        <div className="panel-floating-action"><ActionButton><Download size={16} />Export</ActionButton></div>
        <div className="table-scroll">
          <table className="data-table employee-table">
            <thead>
              <tr><th>Personnel No.</th><th>Function / Role</th><th>Location</th><th>Group</th><th>Age</th><th>Tenure</th><th>Quality</th><th aria-label="Actions" /></tr>
            </thead>
            <tbody>
              {employees.map(([personnel, role, location, group, age, tenure]) => (
                <tr key={personnel}>
                  <td><strong className="mono">{personnel}</strong><span>NT{personnel}</span></td>
                  <td><strong>Sales</strong><span>{role}</span></td>
                  <td>{location}</td>
                  <td><span className="group-badge">{group}</span></td>
                  <td>{age}</td><td>{tenure}</td>
                  <td><span className="status-badge">1 issue</span></td>
                  <td><button aria-label={`Delete ${personnel}`} className="delete-button" type="button"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination"><span>Page 1 of 9</span><div><button disabled type="button">Previous</button><button type="button">Next</button></div></div>
      </Panel>
    </>
  );
}
