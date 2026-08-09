"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  GripVertical,
  LayoutDashboard,
  Minus,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import {
  AgeTenureHeatmap,
  EmployeeGroupDonut,
  FunctionBarChart,
  LocationBarChart,
} from "@/components/charts";
import { PageHeader } from "@/components/ui";

export type ExecutiveOverviewData = {
  as_of_date: string;
  kpis: {
    employee_records: number;
    function_count: number;
    location_count: number;
    average_age: number;
    average_tenure: number;
    retirement_exposure_5_years: number;
    quality_issue_records: number;
  };
  workforce_by_function: {
    function_name: string;
    employee_count: number;
    percentage: number;
  }[];
  workforce_by_location: {
    location_name: string;
    employee_count: number;
    percentage: number;
  }[];
  employee_group_mix: {
    employee_group: string;
    employee_count: number;
    percentage: number;
  }[];
  age_tenure_matrix: {
    age_band: string;
    tenure_band: string;
    employee_count: number;
    percentage: number;
  }[];
  insights: {
    largest_function: {
      function_name: string;
      employee_count: number;
      percentage: number;
    };
    largest_location: {
      location_name: string;
      employee_count: number;
      percentage: number;
    };
    majority_employee_group: {
      employee_group: string;
      employee_count: number;
      percentage: number;
    };
    experienced_workforce: { employee_count: number; percentage: number };
    trust_qualifier: {
      quality_issue_records: number;
      quality_issue_rate: number;
    };
  };
};

export type ExecutiveSupplementData = {
  as_of_date: string;
  gender_balance: {
    gender_key: string;
    percentage: number;
    employee_count: number;
  }[];
  recent_joiners: { percentage: number; employee_count: number };
  retirement_exposure_10_years: { percentage: number; employee_count: number };
  top_three_function_concentration: {
    percentage: number;
    employee_count: number;
    function_names: string[];
  };
};

type WidgetId =
  | "workforce-snapshot"
  | "experience"
  | "movement"
  | "function"
  | "mix"
  | "location"
  | "age-tenure"
  | "insight";
type WidgetSize = "small" | "medium" | "wide" | "large";
type WidgetLayout = { id: WidgetId; size: WidgetSize; visible: boolean };
type WidgetDefinition = {
  title: string;
  subtitle: string;
  kind: "metric" | "chart" | "story";
  sizes: WidgetSize[];
};

const storageKey = "workforce-overview-layout-v1";
const widgetDefinitions: Record<WidgetId, WidgetDefinition> = {
  "workforce-snapshot": {
    title: "Workforce snapshot",
    subtitle: "Scale and organizational reach",
    kind: "metric",
    sizes: ["small", "medium", "wide"],
  },
  experience: {
    title: "Experience profile",
    subtitle: "Age, tenure and depth",
    kind: "metric",
    sizes: ["small", "medium", "wide"],
  },
  movement: {
    title: "Workforce movement",
    subtitle: "Recent joins and retirement horizon",
    kind: "metric",
    sizes: ["small", "medium", "wide"],
  },
  function: {
    title: "Workforce by function",
    subtitle: "Functions ranked by distinct employee records",
    kind: "chart",
    sizes: ["medium", "wide", "large"],
  },
  mix: {
    title: "Workforce mix",
    subtitle: "Employee group and gender representation",
    kind: "chart",
    sizes: ["small", "medium", "wide"],
  },
  location: {
    title: "Workforce by location",
    subtitle: "Locations ranked by distinct employee records",
    kind: "chart",
    sizes: ["small", "medium", "wide", "large"],
  },
  "age-tenure": {
    title: "Age and tenure profile",
    subtitle: "Employees across completed age and tenure bands",
    kind: "chart",
    sizes: ["wide", "large"],
  },
  insight: {
    title: "Leadership brief",
    subtitle: "The strongest signals in the current data",
    kind: "story",
    sizes: ["medium", "wide", "large"],
  },
};

const defaultLayout: WidgetLayout[] = [
  { id: "workforce-snapshot", size: "small", visible: true },
  { id: "experience", size: "small", visible: true },
  { id: "movement", size: "small", visible: true },
  { id: "function", size: "wide", visible: true },
  { id: "mix", size: "small", visible: true },
  { id: "age-tenure", size: "wide", visible: true },
  { id: "location", size: "small", visible: true },
  { id: "insight", size: "large", visible: true },
];

const genderLabels: Record<string, string> = {
  F: "Female",
  M: "Male",
  Unknown: "Unknown",
};

function getGenderTone(genderKey: string) {
  if (genderKey === "F") return "coral";
  if (genderKey === "M") return "navy";
  return "yellow";
}

function restoreLayout(value: string | null) {
  if (!value) return defaultLayout;
  try {
    const parsed = JSON.parse(value) as WidgetLayout[];
    const knownIds = new Set(Object.keys(widgetDefinitions));
    if (!Array.isArray(parsed)) return defaultLayout;
    const restored = parsed.filter(
      (item) =>
        knownIds.has(item.id) &&
        widgetDefinitions[item.id]?.sizes.includes(item.size) &&
        typeof item.visible === "boolean",
    );
    const restoredIds = new Set(restored.map((item) => item.id));
    const missing = defaultLayout
      .filter((item) => !restoredIds.has(item.id))
      .map((item) => ({ ...item, visible: false }));
    return restored.length ? [...restored, ...missing] : defaultLayout;
  } catch {
    return defaultLayout;
  }
}

function DashboardMetric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="dashboard-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </div>
  );
}

function SortableWidget({
  children,
  definition,
  editing,
  layout,
  onRemove,
  onResize,
}: {
  children: ReactNode;
  definition: WidgetDefinition;
  editing: boolean;
  layout: WidgetLayout;
  onRemove: () => void;
  onResize: (direction: -1 | 1) => void;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: layout.id, disabled: !editing });
  const sizeIndex = definition.sizes.indexOf(layout.size);

  return (
    <article
      className={`dashboard-widget widget-${definition.kind}${editing ? " is-editing" : ""}${isDragging ? " is-dragging" : ""}`}
      data-size={layout.size}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <header className="dashboard-widget-header">
        <div>
          <h2>{definition.title}</h2>
          <p>{definition.subtitle}</p>
        </div>
        {editing ? (
          <div className="dashboard-widget-controls">
            <button
              aria-label={`Move ${definition.title}`}
              className="widget-drag-handle"
              type="button"
              {...attributes}
              {...listeners}
            >
              <GripVertical aria-hidden="true" size={15} />
            </button>
            <button
              aria-label={`Make ${definition.title} smaller`}
              disabled={sizeIndex === 0}
              onClick={() => onResize(-1)}
              type="button"
            >
              <Minus aria-hidden="true" size={13} />
            </button>
            <span>{layout.size}</span>
            <button
              aria-label={`Make ${definition.title} larger`}
              disabled={sizeIndex === definition.sizes.length - 1}
              onClick={() => onResize(1)}
              type="button"
            >
              <Plus aria-hidden="true" size={13} />
            </button>
            <button
              aria-label={`Remove ${definition.title}`}
              onClick={onRemove}
              type="button"
            >
              <X aria-hidden="true" size={13} />
            </button>
          </div>
        ) : null}
      </header>
      <div className="dashboard-widget-body">{children}</div>
    </article>
  );
}

export function CustomizableOverview({
  overview,
  supplement,
}: {
  overview: ExecutiveOverviewData;
  supplement: ExecutiveSupplementData;
}) {
  const [editing, setEditing] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [layout, setLayout] = useState<WidgetLayout[]>(defaultLayout);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const savedLayout = restoreLayout(window.localStorage.getItem(storageKey));
    const frame = window.requestAnimationFrame(() => {
      setLayout(savedLayout);
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(storageKey, JSON.stringify(layout));
  }, [hydrated, layout]);

  const visibleWidgets = layout.filter((item) => item.visible);
  const hiddenWidgets = layout.filter((item) => !item.visible);
  const { insights, kpis } = overview;
  const asOfLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${overview.as_of_date}T00:00:00Z`));
  const topThreeFunctionNames = new Intl.ListFormat("en", {
    style: "long",
    type: "conjunction",
  }).format(supplement.top_three_function_concentration.function_names);
  const genderSummary = supplement.gender_balance
    .map(
      (item) =>
        `${genderLabels[item.gender_key] ?? item.gender_key} ${item.percentage}%`,
    )
    .join(", ");

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLayout((current) =>
      arrayMove(
        current,
        current.findIndex((item) => item.id === active.id),
        current.findIndex((item) => item.id === over.id),
      ),
    );
  }

  function resizeWidget(id: WidgetId, direction: -1 | 1) {
    setLayout((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const sizes = widgetDefinitions[id].sizes;
        const nextIndex = Math.min(
          Math.max(sizes.indexOf(item.size) + direction, 0),
          sizes.length - 1,
        );
        return { ...item, size: sizes[nextIndex] };
      }),
    );
  }

  function setWidgetVisible(id: WidgetId, visible: boolean) {
    setLayout((current) =>
      current.map((item) => (item.id === id ? { ...item, visible } : item)),
    );
  }

  function renderWidget(id: WidgetId) {
    switch (id) {
      case "workforce-snapshot":
        return (
          <div className="dashboard-metric-group">
            <DashboardMetric
              label="Employee records"
              note="Distinct personnel numbers"
              value={String(kpis.employee_records)}
            />
            <div className="dashboard-mini-metrics">
              <DashboardMetric
                label="Functions"
                note="Represented"
                value={String(kpis.function_count)}
              />
              <DashboardMetric
                label="Locations"
                note="Represented"
                value={String(kpis.location_count)}
              />
            </div>
          </div>
        );
      case "experience":
        return (
          <div className="dashboard-metric-group">
            <DashboardMetric
              label="Average tenure"
              note={`Completed service as of ${overview.as_of_date}`}
              value={`${kpis.average_tenure} yrs`}
            />
            <div className="dashboard-mini-metrics">
              <DashboardMetric
                label="Average age"
                note="Completed years"
                value={`${kpis.average_age}`}
              />
              <DashboardMetric
                label="10+ years"
                note="Experienced workforce"
                value={`${insights.experienced_workforce.percentage}%`}
              />
            </div>
          </div>
        );
      case "movement":
        return (
          <div className="dashboard-metric-group movement-metrics">
            <DashboardMetric
              label="Recent joiners"
              note={`${supplement.recent_joiners.percentage}% joined in the last two years`}
              value={String(supplement.recent_joiners.employee_count)}
            />
            <DashboardMetric
              label="Retirement in 10 yrs"
              note={`${supplement.retirement_exposure_10_years.percentage}% of employees`}
              value={String(
                supplement.retirement_exposure_10_years.employee_count,
              )}
            />
          </div>
        );
      case "function":
        return <FunctionBarChart data={overview.workforce_by_function} />;
      case "location":
        return <LocationBarChart data={overview.workforce_by_location} />;
      case "age-tenure":
        return <AgeTenureHeatmap data={overview.age_tenure_matrix} />;
      case "mix":
        return (
          <div className="dashboard-mix-layout">
            <EmployeeGroupDonut data={overview.employee_group_mix} />
            <div className="dashboard-mix-copy">
              <div className="compact-legend">
                {overview.employee_group_mix.map((item, index) => (
                  <div key={item.employee_group}>
                    <span
                      className={`legend-dot ${index === 0 ? "coral" : "navy"}`}
                    />
                    {item.employee_group}
                    <strong>{item.percentage}%</strong>
                  </div>
                ))}
              </div>
              <div className="gender-balance">
                <div className="gender-balance-heading">
                  <strong>Gender representation</strong>
                  <span>{genderSummary}</span>
                </div>
                <div
                  aria-label={`Gender representation: ${genderSummary}`}
                  className="gender-balance-bar"
                  role="img"
                >
                  {supplement.gender_balance.map((item) => (
                    <span
                      className={getGenderTone(item.gender_key)}
                      key={item.gender_key}
                      style={{ width: `${item.percentage}%` }}
                      title={`${genderLabels[item.gender_key] ?? item.gender_key}: ${item.employee_count} employees`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case "insight":
        return (
          <div className="dashboard-insight">
            <div className="dashboard-insight-date">As of {asOfLabel}</div>
            <h3>
              {insights.largest_function.function_name} is the largest function
            </h3>
            <p>
              <strong>
                {insights.largest_function.employee_count} employees
              </strong>{" "}
              represent <strong>{insights.largest_function.percentage}%</strong>{" "}
              of the workforce. {insights.largest_location.location_name} is the
              largest location at{" "}
              <strong>{insights.largest_location.percentage}%</strong>.
            </p>
            <p>
              {topThreeFunctionNames} together account for{" "}
              <strong>
                {supplement.top_three_function_concentration.percentage}%
              </strong>
              .{" "}
              <strong>
                {insights.trust_qualifier.quality_issue_records} records
              </strong>{" "}
              need data-quality review.
            </p>
          </div>
        );
    }
  }

  return (
    <>
      <PageHeader
        action={
          <div className="dashboard-header-actions">
            <div className="live-pill">
              <span />
              Live dataset / {kpis.employee_records} records
            </div>
            <button
              className={`dashboard-customize-button${editing ? " active" : ""}`}
              onClick={() => {
                setEditing((current) => !current);
                setLibraryOpen(false);
              }}
              type="button"
            >
              {editing ? (
                <Check aria-hidden="true" size={15} />
              ) : (
                <SlidersHorizontal aria-hidden="true" size={15} />
              )}
              {editing ? "Done" : "Customize"}
            </button>
          </div>
        }
        description="Choose the workforce signals you want to see, then arrange them around the decisions you make most often."
        eyebrow="Executive workspace"
        title="Your workforce dashboard"
      />

      {editing ? (
        <section
          className="dashboard-edit-bar"
          aria-label="Dashboard editing tools"
        >
          <div>
            <LayoutDashboard aria-hidden="true" size={18} />
            <p>
              <strong>Editing your dashboard</strong>
              <span>
                Drag widgets to reorder. Use minus and plus to resize.
              </span>
            </p>
          </div>
          <div>
            <span className="dashboard-save-state">Saved on this device</span>
            <button
              onClick={() => setLibraryOpen((current) => !current)}
              type="button"
            >
              <Plus aria-hidden="true" size={14} />
              Add widget
            </button>
            <button
              onClick={() =>
                setLayout(defaultLayout.map((item) => ({ ...item })))
              }
              type="button"
            >
              <RotateCcw aria-hidden="true" size={14} />
              Reset
            </button>
          </div>
        </section>
      ) : null}

      {editing && libraryOpen ? (
        <section
          className="dashboard-widget-library"
          aria-label="Available dashboard widgets"
        >
          <header>
            <div>
              <p>Widget library</p>
              <h2>Add another view</h2>
            </div>
            <button
              aria-label="Close widget library"
              onClick={() => setLibraryOpen(false)}
              type="button"
            >
              <X size={15} />
            </button>
          </header>
          {hiddenWidgets.length ? (
            <div>
              {hiddenWidgets.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setWidgetVisible(item.id, true)}
                  type="button"
                >
                  <span>
                    <strong>{widgetDefinitions[item.id].title}</strong>
                    <small>{widgetDefinitions[item.id].subtitle}</small>
                  </span>
                  <Plus aria-hidden="true" size={15} />
                </button>
              ))}
            </div>
          ) : (
            <p className="dashboard-library-empty">
              Every available widget is already on your dashboard.
            </p>
          )}
        </section>
      ) : null}

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={visibleWidgets.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          <section
            className={`custom-dashboard-grid${hydrated ? " is-ready" : ""}${editing ? " is-editing" : ""}`}
          >
            {visibleWidgets.map((item) => (
              <SortableWidget
                definition={widgetDefinitions[item.id]}
                editing={editing}
                key={item.id}
                layout={item}
                onRemove={() => setWidgetVisible(item.id, false)}
                onResize={(direction) => resizeWidget(item.id, direction)}
              >
                {renderWidget(item.id)}
              </SortableWidget>
            ))}
          </section>
        </SortableContext>
      </DndContext>
    </>
  );
}
