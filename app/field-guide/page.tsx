import { BadgeCheck, ChevronRight, CircleHelp, Search, X } from "lucide-react";

import { PageHeader } from "@/components/ui";

const guideGroups = [
  {
    title: "Use for insights", subtitle: "Reliable dimensions and measures", tone: "green", icon: BadgeCheck,
    items: [
      ["Personnel Number", "The employee key. Use DISTINCTCOUNT so duplicate rows do not inflate headcount."],
      ["Employee Group", "Direct or Indirect source classification. Compare the mix, but confirm company rules before calling Direct ‘production’."],
      ["Function & Location", "Where an employee works in the business and at which site. Strong chart dimensions."],
      ["Gender & Designation", "Aggregated representation and job-role mix. Do not expose person-level gender publicly."],
      ["Lifecycle dates", "Birth, joining, and retirement dates power age, tenure, cohort, and retirement metrics."],
    ],
  },
  {
    title: "Use with neutral labels", subtitle: "Meaning likely; code values unmapped", tone: "yellow", icon: CircleHelp,
    items: [
      ["LP", "Likely Legal Person: the registered employing company. LP1–LP5 cannot be decoded without a mapping."],
      ["ESgrp", "Employee Subgroup code within a broad Employee Group. ES1–ES9 need descriptions."],
      ["PS Group", "Likely pay-scale category. It does not contain salary and does not prove which group is senior."],
      ["HRBP IDs", "IDs of HR Business Partners connected to employees. Primary/secondary roles are not confirmed."],
    ],
  },
  {
    title: "Keep for detail or checks", subtitle: "Useful, but poor chart dimensions", tone: "blue", icon: Search,
    items: [
      ["NT_ID & Global ID", "Identifiers for search, matching, and duplicate checks—not workforce characteristics."],
      ["Official Email", "Contact and validation only. Do not visualize or expose it on public pages."],
      ["Organizational Unit", "A team code. With 96 codes for 100 people, it is too fragmented for reliable structure analysis."],
      ["Cost Centre", "The account where employment costs may be charged. It contains no actual money value."],
      ["Personnel Area / Subarea", "Broad and smaller HR administrative areas. Constant Plant/Main values only describe this extract."],
    ],
  },
  {
    title: "Exclude from analytics", subtitle: "Redundant or meaning not defensible", tone: "coral", icon: X,
    items: [
      ["Pers.No.", "Exact duplicate of Personnel Number. Keep one employee key only."],
      ["PA", "Almost unique numeric code with no definition. It cannot support a trustworthy insight."],
      ["PSubarea code", "PSA1–PSA9 have no mapping; the separate Personnel Subarea description is already constant."],
      ["Range", "R1–R3 may be grade or pay bands, but there is not enough evidence to interpret them."],
      ["Unnamed index", "Excel/Pandas row number. It is not employee data."],
    ],
  },
];

const relationship = [
  ["01", "Personnel Number", "One stable employee key"],
  ["02", "Work assignment", "Function, location, role"],
  ["03", "Lifecycle dates", "Age, tenure, retirement"],
  ["04", "HR support", "HRBP code assignment"],
];

const derivations = [
  ["Birth date", "+ dashboard date", "Age & age band"],
  ["Joining date", "+ dashboard date", "Tenure & cohort"],
  ["Birth + joining", "compare dates", "Age at joining check"],
  ["Retirement date", "− dashboard date", "Retirement horizon"],
];

export default function FieldGuidePage() {
  return (
    <>
      <PageHeader
        description="A plain-language guide to trusted dimensions, conditional codes, detail fields, and excluded columns."
        eyebrow="Metric dictionary"
        title="What each field can tell you"
      />

      <section aria-label="Workforce data relationship model" className="relationship-strip">
        {relationship.map(([number, title, text], index) => (
          <div className="relationship-item" key={number}>
            <div><span>{number}</span><strong>{title}</strong><p>{text}</p></div>
            {index < relationship.length - 1 ? <ChevronRight aria-hidden="true" size={22} /> : null}
          </div>
        ))}
      </section>

      <section className="guide-grid">
        {guideGroups.map((group) => {
          const Icon = group.icon;
          return (
            <article className={`guide-card ${group.tone}`} key={group.title}>
              <header><span><Icon size={20} /></span><div><h2>{group.title}</h2><p>{group.subtitle}</p></div></header>
              <div className="guide-list">
                {group.items.map(([title, text]) => <div key={title}><strong>{title}</strong><p>{text}</p></div>)}
              </div>
            </article>
          );
        })}
      </section>

      <section className="panel derived-panel">
        <div className="panel-header"><div><h2>How new dashboard metrics are derived</h2><p>These calculations combine fields; they are not extra source columns</p></div></div>
        <div className="derivation-grid">
          {derivations.map(([source, operation, result]) => (
            <article key={source}><span>{source}</span><p>{operation}</p><strong>{result}</strong></article>
          ))}
        </div>
      </section>
    </>
  );
}
