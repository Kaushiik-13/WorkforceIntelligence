"use client";

import {
  LoaderCircle,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Employee = {
  birth_date: string | null;
  designation: string | null;
  employee_group: string | null;
  function_name: string | null;
  gender_key: string | null;
  id: string;
  joining_date: string | null;
  location_name: string | null;
  personnel_number: string | null;
  retirement_date: string | null;
};

type EmployeeForm = {
  birth_date: string;
  designation: string;
  employee_group: string;
  function_name: string;
  gender_key: string;
  joining_date: string;
  location_name: string;
  personnel_number: string;
  retirement_date: string;
};

type EmployeeResponse = { data: Employee[]; total: number };
type EmployeeMutationResponse = { data: Employee };

type DirectoryFilters = {
  employeeGroup: string;
  functionName: string;
  gender: string;
  location: string;
};

const pageSize = 10;

const emptyDirectoryFilters: DirectoryFilters = {
  employeeGroup: "",
  functionName: "",
  gender: "",
  location: "",
};

const emptyEmployeeForm: EmployeeForm = {
  birth_date: "",
  designation: "",
  employee_group: "",
  function_name: "",
  gender_key: "",
  joining_date: "",
  location_name: "",
  personnel_number: "",
  retirement_date: "",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

function uniqueValues(values: (string | null)[]) {
  return [...new Set(values
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.trim()))]
    .sort((first, second) => first.localeCompare(second));
}

function employeeToForm(employee: Employee): EmployeeForm {
  return {
    birth_date: employee.birth_date ?? "",
    designation: employee.designation ?? "",
    employee_group: employee.employee_group ?? "",
    function_name: employee.function_name ?? "",
    gender_key: employee.gender_key ?? "",
    joining_date: employee.joining_date ?? "",
    location_name: employee.location_name ?? "",
    personnel_number: employee.personnel_number ?? "",
    retirement_date: employee.retirement_date ?? "",
  };
}

function sortEmployees(rows: Employee[]) {
  return [...rows].sort((first, second) =>
    (first.personnel_number ?? "").localeCompare(second.personnel_number ?? "", undefined, {
      numeric: true,
    }));
}

async function responsePayload<T extends object>(response: Response) {
  const payload = await response.json().catch(() => null) as T | { error?: string } | null;
  if (!response.ok) {
    throw new Error(payload && typeof payload === "object" && "error" in payload && payload.error
      ? payload.error
      : "The employee request could not be completed.");
  }
  return payload as T;
}

function FormField({
  label,
  name,
  type = "text",
  value,
  required = false,
  onChange,
}: {
  label: string;
  name: keyof EmployeeForm;
  type?: "date" | "text";
  value: string;
  required?: boolean;
  onChange: (name: keyof EmployeeForm, value: string) => void;
}) {
  return (
    <label className="employee-form-field">
      <span>{label}{required ? " *" : ""}</span>
      <input
        autoComplete="off"
        maxLength={type === "text" ? 160 : undefined}
        name={name}
        onChange={(event) => onChange(name, event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function FormSelect({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string;
  name: keyof EmployeeForm;
  options: string[];
  value: string;
  onChange: (name: keyof EmployeeForm, value: string) => void;
}) {
  const visibleOptions = value && !options.includes(value)
    ? [...options, value].sort((first, second) => first.localeCompare(second))
    : options;

  return (
    <label className="employee-form-field">
      <span>{label}</span>
      <select name={name} onChange={(event) => onChange(name, event.target.value)} value={value}>
        <option value="">Not specified</option>
        {visibleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function DirectoryFilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="workforce-filter-control employee-directory-filter">
      <span>{label}</span>
      <select onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">All</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

export function EmployeeExplorer() {
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [directoryFilters, setDirectoryFilters] = useState<DirectoryFilters>(emptyDirectoryFilters);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<EmployeeForm>(emptyEmployeeForm);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEmployees() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/employees", {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = await responsePayload<EmployeeResponse>(response);
        setEmployees(sortEmployees(payload.data));
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load employees.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadEmployees();
    return () => controller.abort();
  }, []);

  const filterOptions = useMemo(() => ({
    designations: uniqueValues(employees.map((employee) => employee.designation)),
    employee_groups: uniqueValues(employees.map((employee) => employee.employee_group)),
    functions: uniqueValues(employees.map((employee) => employee.function_name)),
    genders: uniqueValues(employees.map((employee) => employee.gender_key)),
    locations: uniqueValues(employees.map((employee) => employee.location_name)),
  }), [employees]);

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return employees.filter((employee) => {
      const matchesSearch = !normalizedSearch
        || employee.personnel_number?.toLocaleLowerCase().includes(normalizedSearch)
        || employee.designation?.toLocaleLowerCase().includes(normalizedSearch);
      return matchesSearch
        && (!directoryFilters.functionName || employee.function_name === directoryFilters.functionName)
        && (!directoryFilters.location || employee.location_name === directoryFilters.location)
        && (!directoryFilters.employeeGroup || employee.employee_group === directoryFilters.employeeGroup)
        && (!directoryFilters.gender || employee.gender_key === directoryFilters.gender);
    });
  }, [directoryFilters, employees, search]);

  const activeFilterCount = Object.values(directoryFilters).filter(Boolean).length;

  const pageCount = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstRecord = filteredEmployees.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastRecord = Math.min(currentPage * pageSize, filteredEmployees.length);

  function openCreate() {
    setEditingEmployee(null);
    setFormValues(emptyEmployeeForm);
    setFormError(null);
    setShowEditor(true);
  }

  function openEdit(employee: Employee) {
    setEditingEmployee(employee);
    setFormValues(employeeToForm(employee));
    setFormError(null);
    setShowEditor(true);
  }

  function updateFormValue(name: keyof EmployeeForm, value: string) {
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function updateDirectoryFilter(name: keyof DirectoryFilters, value: string) {
    setDirectoryFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  }

  async function saveEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    setNotice(null);

    try {
      const isEditing = Boolean(editingEmployee);
      const response = await fetch(
        isEditing ? `/api/employees/${editingEmployee?.id}` : "/api/employees",
        {
          body: JSON.stringify(formValues),
          headers: { "Content-Type": "application/json" },
          method: isEditing ? "PATCH" : "POST",
        },
      );
      const payload = await responsePayload<EmployeeMutationResponse>(response);

      setEmployees((current) => sortEmployees(isEditing
        ? current.map((employee) => employee.id === payload.data.id ? payload.data : employee)
        : [...current, payload.data]));
      setShowEditor(false);
      setNotice(isEditing ? "Employee record updated." : "Employee record created.");
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : "Unable to save the employee record.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEmployee() {
    if (!deleteTarget) return;
    setSaving(true);
    setFormError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/employees/${deleteTarget.id}`, { method: "DELETE" });
      await responsePayload<{ deleted_id: string }>(response);
      setEmployees((current) => current.filter((employee) => employee.id !== deleteTarget.id));
      setDeleteTarget(null);
      setNotice("Employee record deleted.");
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : "Unable to delete the employee record.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="workforce-filter-form employee-filter-form">
        <div className="workforce-filter-heading">
          <div>
            <strong>Find employee records</strong>
            <span>Search by personnel number or designation.</span>
          </div>
          <p><strong>{filteredEmployees.length}</strong> records found</p>
        </div>
        <div className="employee-filter-grid">
          <label className="employee-search-control">
            <span>Search</span>
            <div><Search aria-hidden="true" size={14} /><input onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Personnel number or designation" value={search} /></div>
          </label>
          <div className="employee-search-actions">
            {search ? <button className="action-button" onClick={() => { setSearch(""); setPage(1); }} type="button"><RotateCcw aria-hidden="true" size={13} />Clear search</button> : null}
            <button className={`action-button employee-filter-toggle${showFilters ? " active" : ""}`} onClick={() => setShowFilters((current) => !current)} type="button">
              <SlidersHorizontal aria-hidden="true" size={14} />Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
            </button>
          </div>
        </div>
        {showFilters ? (
          <div className="employee-filter-drawer">
            <DirectoryFilterSelect label="Function" onChange={(value) => updateDirectoryFilter("functionName", value)} options={filterOptions.functions} value={directoryFilters.functionName} />
            <DirectoryFilterSelect label="Location" onChange={(value) => updateDirectoryFilter("location", value)} options={filterOptions.locations} value={directoryFilters.location} />
            <DirectoryFilterSelect label="Employee group" onChange={(value) => updateDirectoryFilter("employeeGroup", value)} options={filterOptions.employee_groups} value={directoryFilters.employeeGroup} />
            <DirectoryFilterSelect label="Gender" onChange={(value) => updateDirectoryFilter("gender", value)} options={filterOptions.genders} value={directoryFilters.gender} />
            <button className="action-button" disabled={!activeFilterCount} onClick={() => { setDirectoryFilters(emptyDirectoryFilters); setPage(1); }} type="button"><RotateCcw aria-hidden="true" size={13} />Reset filters</button>
          </div>
        ) : null}
      </section>

      <section className="panel employee-panel">
        <div className="panel-header employee-panel-header">
          <div><h2>Employee master</h2><p>{loading ? "Loading employee records…" : `Showing ${firstRecord}–${lastRecord} of ${filteredEmployees.length} records`}</p></div>
          <div className="employee-header-actions">
            <span className="panel-badge">Page {currentPage} of {pageCount}</span>
            <button className="action-button primary" onClick={openCreate} type="button"><Plus aria-hidden="true" size={15} />Add employee</button>
          </div>
        </div>
        {notice ? <div className="employee-notice" role="status">{notice}</div> : null}
        {error ? <div className="employee-error" role="alert"><strong>Employee records could not be loaded.</strong><span>{error}</span></div> : null}
        <div className="table-scroll">
          <table className="data-table employee-table employee-directory-table">
            <thead>
              <tr>
                <th>Personnel number</th><th>Employee group</th><th>Function</th><th>Location</th><th>Gender</th><th>Birth date</th><th>Date of joining</th><th>Retirement date</th><th>Designation</th><th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td className="employee-table-message" colSpan={10}>Loading employee records…</td></tr> : null}
              {!loading && !error && filteredEmployees.length === 0 ? <tr><td className="employee-table-message" colSpan={10}>No employees match the selected search and filters.</td></tr> : null}
              {!loading && !error ? pageEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td><strong className="mono">{employee.personnel_number ?? "—"}</strong></td>
                  <td><span className="group-badge">{employee.employee_group ?? "—"}</span></td>
                  <td>{employee.function_name ?? "—"}</td>
                  <td>{employee.location_name ?? "—"}</td>
                  <td>{employee.gender_key ?? "—"}</td>
                  <td>{formatDate(employee.birth_date)}</td>
                  <td>{formatDate(employee.joining_date)}</td>
                  <td>{formatDate(employee.retirement_date)}</td>
                  <td><strong>{employee.designation ?? "—"}</strong></td>
                  <td>
                    <div className="employee-row-actions">
                      <button aria-label={`Edit employee ${employee.personnel_number ?? "record"}`} onClick={() => openEdit(employee)} type="button"><Pencil aria-hidden="true" size={14} /></button>
                      <button aria-label={`Delete employee ${employee.personnel_number ?? "record"}`} className="danger" onClick={() => { setFormError(null); setDeleteTarget(employee); }} type="button"><Trash2 aria-hidden="true" size={14} /></button>
                    </div>
                  </td>
                </tr>
              )) : null}
            </tbody>
          </table>
        </div>
        <div className="pagination employee-pagination">
          <span>{filteredEmployees.length ? `${firstRecord}–${lastRecord} of ${filteredEmployees.length}` : "No records"}</span>
          <div>
            <button disabled={loading || currentPage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">Previous</button>
            <button disabled={loading || currentPage >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} type="button">Next</button>
          </div>
        </div>
      </section>

      {showEditor ? (
        <div className="employee-modal-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target && !saving) setShowEditor(false); }}>
          <section aria-labelledby="employee-editor-title" aria-modal="true" className="employee-modal" role="dialog">
            <header>
              <div>
                <span>{editingEmployee ? "Update record" : "New employee"}</span>
                <h2 id="employee-editor-title">{editingEmployee ? `Edit ${editingEmployee.personnel_number}` : "Add an employee"}</h2>
                <p>Maintain the fields used throughout the workforce dashboards.</p>
              </div>
              <button aria-label="Close employee form" disabled={saving} onClick={() => setShowEditor(false)} type="button"><X aria-hidden="true" size={18} /></button>
            </header>
            <form onSubmit={saveEmployee}>
              <div className="employee-form-grid">
                <FormField label="Personnel number" name="personnel_number" onChange={updateFormValue} required value={formValues.personnel_number} />
                <FormSelect label="Employee group" name="employee_group" onChange={updateFormValue} options={filterOptions.employee_groups} value={formValues.employee_group} />
                <FormSelect label="Function" name="function_name" onChange={updateFormValue} options={filterOptions.functions} value={formValues.function_name} />
                <FormSelect label="Location" name="location_name" onChange={updateFormValue} options={filterOptions.locations} value={formValues.location_name} />
                <FormSelect label="Gender key" name="gender_key" onChange={updateFormValue} options={filterOptions.genders} value={formValues.gender_key} />
                <FormSelect label="Designation" name="designation" onChange={updateFormValue} options={filterOptions.designations} value={formValues.designation} />
                <FormField label="Birth date" name="birth_date" onChange={updateFormValue} type="date" value={formValues.birth_date} />
                <FormField label="Date of joining" name="joining_date" onChange={updateFormValue} type="date" value={formValues.joining_date} />
                <FormField label="Entry for retirement" name="retirement_date" onChange={updateFormValue} type="date" value={formValues.retirement_date} />
              </div>
              {formError ? <div className="employee-form-error" role="alert">{formError}</div> : null}
              <footer>
                <button className="action-button" disabled={saving} onClick={() => setShowEditor(false)} type="button">Cancel</button>
                <button className="action-button primary" disabled={saving} type="submit">
                  {saving ? <LoaderCircle aria-hidden="true" className="spin" size={15} /> : null}
                  {editingEmployee ? "Save changes" : "Create employee"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="employee-modal-backdrop employee-delete-backdrop">
          <section aria-labelledby="employee-delete-title" aria-modal="true" className="employee-modal employee-delete-modal" role="alertdialog">
            <header>
              <div>
                <span>Delete record</span>
                <h2 id="employee-delete-title">Remove employee {deleteTarget.personnel_number}?</h2>
                <p>This permanently removes the employee from Supabase and changes dashboard totals.</p>
              </div>
            </header>
            {formError ? <div className="employee-form-error" role="alert">{formError}</div> : null}
            <footer>
              <button className="action-button" disabled={saving} onClick={() => setDeleteTarget(null)} type="button">Keep record</button>
              <button className="action-button destructive" disabled={saving} onClick={() => void deleteEmployee()} type="button">
                {saving ? <LoaderCircle aria-hidden="true" className="spin" size={15} /> : <Trash2 aria-hidden="true" size={15} />}
                Delete employee
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  );
}
