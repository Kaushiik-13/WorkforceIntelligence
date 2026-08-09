"use client";

import { RotateCcw, Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

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

type Filters = {
  employeeGroup: string;
  functionName: string;
  gender: string;
  location: string;
  search: string;
};

type EmployeeResponse = {
  data: Employee[];
  filters: {
    employee_groups: string[];
    functions: string[];
    genders: string[];
    locations: string[];
  };
  pagination: {
    page: number;
    page_count: number;
    page_size: number;
    total: number;
  };
};

const emptyFilters: Filters = {
  employeeGroup: "",
  functionName: "",
  gender: "",
  location: "",
  search: "",
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

function FilterSelect({
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
    <label className="workforce-filter-control">
      <span>{label}</span>
      <select onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">All</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

export function EmployeeExplorer() {
  const [appliedFilters, setAppliedFilters] = useState<Filters>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<EmployeeResponse["filters"]>({
    employee_groups: [],
    functions: [],
    genders: [],
    locations: [],
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<EmployeeResponse["pagination"]>({
    page: 1,
    page_count: 1,
    page_size: 10,
    total: 0,
  });

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), page_size: "10" });
    if (appliedFilters.search) params.set("search", appliedFilters.search);
    if (appliedFilters.functionName) params.set("function", appliedFilters.functionName);
    if (appliedFilters.location) params.set("location", appliedFilters.location);
    if (appliedFilters.employeeGroup) params.set("employee_group", appliedFilters.employeeGroup);
    if (appliedFilters.gender) params.set("gender", appliedFilters.gender);

    async function loadEmployees() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/employees?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = await response.json() as EmployeeResponse | { error?: string };
        if (!response.ok || !("data" in payload)) {
          throw new Error("error" in payload && payload.error ? payload.error : "Unable to load employees.");
        }
        setEmployees(payload.data);
        setFilterOptions(payload.filters);
        setPagination(payload.pagination);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load employees.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadEmployees();
    return () => controller.abort();
  }, [appliedFilters, page]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(draftFilters);
  }

  function resetFilters() {
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  }

  const firstRecord = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.page_size + 1;
  const lastRecord = Math.min(pagination.page * pagination.page_size, pagination.total);

  return (
    <>
      <form className="workforce-filter-form employee-filter-form" onSubmit={applyFilters}>
        <div className="workforce-filter-heading">
          <div>
            <strong>Find employee records</strong>
            <span>Search by personnel number or designation, then narrow the results.</span>
          </div>
          <p><strong>{pagination.total}</strong> records found</p>
        </div>
        <div className="employee-filter-grid">
          <label className="employee-search-control">
            <span>Search</span>
            <div><Search aria-hidden="true" size={14} /><input onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Personnel number or designation" value={draftFilters.search} /></div>
          </label>
          <FilterSelect label="Function" onChange={(value) => setDraftFilters((current) => ({ ...current, functionName: value }))} options={filterOptions.functions} value={draftFilters.functionName} />
          <FilterSelect label="Location" onChange={(value) => setDraftFilters((current) => ({ ...current, location: value }))} options={filterOptions.locations} value={draftFilters.location} />
          <FilterSelect label="Employee group" onChange={(value) => setDraftFilters((current) => ({ ...current, employeeGroup: value }))} options={filterOptions.employee_groups} value={draftFilters.employeeGroup} />
          <FilterSelect label="Gender" onChange={(value) => setDraftFilters((current) => ({ ...current, gender: value }))} options={filterOptions.genders} value={draftFilters.gender} />
          <div className="workforce-filter-actions">
            <button className="action-button primary" type="submit">Apply</button>
            <button className="action-button" onClick={resetFilters} type="button"><RotateCcw aria-hidden="true" size={13} />Reset</button>
          </div>
        </div>
      </form>

      <section className="panel employee-panel">
        <div className="panel-header">
          <div><h2>Employee master</h2><p>{loading ? "Loading employee records…" : `Showing ${firstRecord}–${lastRecord} of ${pagination.total} records`}</p></div>
          <span className="panel-badge">Page {pagination.page} of {pagination.page_count}</span>
        </div>
        {error ? <div className="employee-error" role="alert"><strong>Employee records could not be loaded.</strong><span>{error}</span></div> : null}
        <div className="table-scroll">
          <table className="data-table employee-table employee-directory-table">
            <thead>
              <tr>
                <th>Personnel number</th><th>Employee group</th><th>Function</th><th>Location</th><th>Gender</th><th>Birth date</th><th>Date of joining</th><th>Retirement date</th><th>Designation</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td className="employee-table-message" colSpan={9}>Loading employee records…</td></tr> : null}
              {!loading && !error && employees.length === 0 ? <tr><td className="employee-table-message" colSpan={9}>No employees match the selected search and filters.</td></tr> : null}
              {!loading && !error ? employees.map((employee) => (
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
                </tr>
              )) : null}
            </tbody>
          </table>
        </div>
        <div className="pagination employee-pagination">
          <span>{pagination.total ? `${firstRecord}–${lastRecord} of ${pagination.total}` : "No records"}</span>
          <div>
            <button disabled={loading || pagination.page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">Previous</button>
            <button disabled={loading || pagination.page >= pagination.page_count} onClick={() => setPage((current) => Math.min(pagination.page_count, current + 1))} type="button">Next</button>
          </div>
        </div>
      </section>
    </>
  );
}
