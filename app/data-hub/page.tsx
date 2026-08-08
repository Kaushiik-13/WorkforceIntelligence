import { CheckCircle2, Download, RefreshCcw, Upload } from "lucide-react";

import { ActionButton, PageHeader, Panel } from "@/components/ui";

const requirements = ["Personnel Number", "Employee Group", "Function", "Location", "Gender Key", "Birth date", "Date of Joining", "Entry for Retirement", "Designation Text"];

const importTypes = [
  { value: 9, title: "Trusted analytics", text: "Headcount, group, function, location, gender, designation, and lifecycle dates.", tone: "green" },
  { value: 4, title: "Neutral coded views", text: "LP, ESgrp, PS Group, and HRBP IDs remain labelled as source codes.", tone: "yellow" },
  { value: 9, title: "Detail & validation", text: "Identifiers, email, units, area descriptions, and cost centre support search or audit.", tone: "blue" },
  { value: 4, title: "Excluded from model", text: "Duplicate Pers.No., PA, PSubarea code, Range, and exported row indexes are ignored.", tone: "coral" },
];

export default function DataHubPage() {
  return (
    <>
      <PageHeader
        action={<ActionButton><Download size={16} />Export filtered</ActionButton>}
        description="Bring in Excel or CSV data, validate it, and keep the persistent workforce model up to date."
        eyebrow="Data operations"
        title="Import, add & export"
      />

      <section className="import-grid">
        <Panel subtitle="Excel .xlsx, .xls, or .csv · up to 5,000 rows" title="Import employee data">
          <button className="upload-zone" type="button">
            <span className="upload-icon"><Upload size={25} /></span>
            <strong>Choose an Excel or CSV file</strong>
            <p>The first worksheet will be validated before any data is saved.</p>
            <em>Browse files</em>
          </button>
        </Panel>

        <Panel subtitle="Minimum fields needed for useful analytics" title="Import requirements">
          <div className="requirements-grid">
            {requirements.map((item) => <span key={item}><CheckCircle2 size={15} />{item}</span>)}
          </div>
          <button className="wide-outline-button" type="button"><Download size={16} />Download blank template</button>
        </Panel>
      </section>

      <Panel className="treatment-panel" subtitle="Analytical value is separated from mere availability" title="How the import model treats your columns">
        <div className="import-type-grid">
          {importTypes.map((item) => (
            <article className={`import-type-card ${item.tone}`} key={item.title}>
              <strong>{item.value}</strong><div><b>{item.title}</b><p>{item.text}</p></div>
            </article>
          ))}
        </div>
      </Panel>

      <Panel className="demo-panel" subtitle="Useful for presenting the project safely" title="Demo controls">
        <div className="demo-content"><RefreshCcw size={23} /><p>Restore the deterministic 100-record demo with the same analytical patterns and no real personal data.</p></div>
        <button className="restore-button" type="button">Restore demo dataset</button>
      </Panel>
    </>
  );
}
