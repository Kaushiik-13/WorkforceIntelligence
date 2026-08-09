export type CountShare = {
  employee_count: number;
  percentage: number;
};

export type WorkforceCompositionData = {
  as_of_date: string;
  record_counts: { filtered_records: number; total_records: number };
  kpis: {
    distinct_designations: number;
    employee_group_mix: (CountShare & { employee_group: string })[];
    functions_represented: number;
    gender_representation: (CountShare & { gender_key: string })[];
    largest_designation: (CountShare & { designation: string }) | null;
    largest_function: (CountShare & { function_name: string }) | null;
    unclassified_records: number;
  };
  function_distribution: (CountShare & { function_name: string })[];
  designation_mix: (CountShare & { designation: string })[];
  gender_by_function: (CountShare & {
    function_name: string;
    function_total: number;
    gender_key: string;
  })[];
  employee_group_by_function: (CountShare & {
    employee_group: string;
    function_name: string;
    function_total: number;
  })[];
  role_breadth_by_function: {
    distinct_designations: number;
    dominant_designation: string;
    dominant_designation_count: number;
    dominant_designation_percentage: number;
    employee_count: number;
    function_name: string;
  }[];
  insights: {
    highest_direct_share: (CountShare & {
      function_name: string;
      function_total: number;
    }) | null;
    highest_role_concentration: {
      dominant_designation: string;
      dominant_designation_count: number;
      dominant_designation_percentage: number;
      function_name: string;
    } | null;
    largest_gender_variance: {
      difference_percentage_points: number;
      f_employee_count: number;
      f_percentage: number;
      function_name: string;
      function_total: number;
      overall_f_percentage: number;
    } | null;
    top_three_function_concentration: CountShare & { function_names: string[] };
    unclassified_records: CountShare;
  };
};

export type OrganizationOverviewData = {
  record_counts: { filtered_records: number; total_records: number };
  kpis: {
    assignment_gaps: number;
    average_primary_hrbp_workload: number | null;
    locations: number;
    multi_function_hrbps: number;
    multi_location_hrbps: number;
    organizational_units: number;
    primary_hrbps: number;
    secondary_hrbps: number;
    unique_hrbp_pairs: number;
  };
  workload_statistics: {
    average: number | null;
    coefficient_of_variation: number | null;
    maximum: number | null;
    median: number | null;
    minimum: number | null;
  };
  location_distribution: {
    employee_count: number;
    location_name: string;
    percentage: number;
  }[];
  function_location_matrix: {
    employee_count: number;
    function_name: string;
    function_percentage: number;
    location_name: string;
    location_percentage: number;
  }[];
  hrbp_workload: { employee_count: number; hrbp_label: string }[];
  hrbp_workload_distribution: {
    display_order: number;
    employee_count: number;
    hrbp_count: number;
    hrbp_percentage: number;
    workload_band: string;
  }[];
  hrbp_breadth: {
    employee_count: number;
    function_count: number;
    hrbp_label: string;
    location_count: number;
  }[];
  organization_fragmentation: {
    distinct_values: number;
    field_name: string;
    fragmentation_percentage: number;
  }[];
  insights: {
    assignment_gaps: number;
    broadest_hrbp: {
      employee_count: number;
      function_count: number;
      hrbp_label: string;
      location_count: number;
    } | null;
    hrbp_workload: {
      average: number | null;
      maximum: number | null;
      median: number | null;
      minimum: number | null;
    };
    largest_location: {
      employee_count: number;
      location_name: string;
      percentage: number;
    } | null;
    strongest_site_specialization: {
      employee_count: number;
      function_name: string;
      location_name: string;
      location_total: number;
      percentage: number;
    } | null;
  };
};

type LifecycleDistributionRow = {
  employee_count: number;
  percentage: number;
};

type LifecycleExposureRow = {
  employee_count: number;
  exposed_count: number;
  exposed_rate: number;
};

type LifecycleEmployeeRow = {
  designation: string | null;
  function_name: string | null;
  location_name: string | null;
  personnel_number: string;
};

export type LifecycleOverviewData = {
  age_distribution: (LifecycleDistributionRow & { age_band: string })[];
  age_tenure_matrix: {
    age_band: string;
    employee_count: number;
    tenure_band: string;
  }[];
  anniversary_summary: { employee_count: number; milestone_years: number }[];
  as_of_date: string;
  employee_lists: {
    lifecycle_anomalies: (LifecycleEmployeeRow & {
      birth_date: string | null;
      issues: string[];
      joining_age_years: number | null;
      joining_date: string | null;
      retirement_date: string | null;
    })[];
    retirement_exposed: (LifecycleEmployeeRow & {
      retirement_date: string;
      tenure_years: number;
    })[];
    service_anniversaries: (LifecycleEmployeeRow & {
      anniversary_date: string;
      milestone_years: number;
    })[];
  };
  insights: {
    highest_exposure_rate_function: (LifecycleExposureRow & {
      function_name: string;
    }) | null;
    largest_exposed_function: (LifecycleExposureRow & {
      function_name: string;
    }) | null;
    largest_joining_cohort: {
      employee_count: number;
      joining_year: number;
    } | null;
  };
  joining_cohorts: { employee_count: number; joining_year: number }[];
  kpis: {
    average_age: number | null;
    average_age_at_joining: number | null;
    average_expected_retirement_age: number | null;
    average_tenure: number | null;
    lifecycle_anomaly_records: number;
    retirement_exposure_1_year: number;
    retirement_exposure_3_years: number;
    retirement_exposure_5_years: number;
    retirement_exposure_10_years: number;
    retirement_exposure_15_years: number;
    service_milestones: number;
    valid_joining_age_records: number;
  };
  record_counts: { filtered_records: number; total_records: number };
  retirement_by_designation: (LifecycleExposureRow & { designation: string })[];
  retirement_by_function: (LifecycleExposureRow & { function_name: string })[];
  retirement_by_location: (LifecycleExposureRow & { location_name: string })[];
  retirement_pipeline: {
    employee_count: number;
    horizon_band: string;
    percentage: number;
  }[];
  selected_retirement_horizon: number;
  selected_year: number;
  tenure_distribution: (LifecycleDistributionRow & { tenure_band: string })[];
};
