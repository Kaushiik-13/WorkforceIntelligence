import { connection } from "next/server";

import {
  CustomizableOverview,
  type ExecutiveOverviewData,
  type ExecutiveSupplementData,
} from "@/components/customizable-overview";
import type {
  LifecycleOverviewData,
  OrganizationOverviewData,
  WorkforceCompositionData,
} from "@/lib/dashboard-types";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export default async function OverviewPage() {
  await connection();

  const supabase = createSupabaseServerClient();
  const [
    overviewResponse,
    supplementResponse,
    workforceResponse,
    organizationResponse,
    lifecycleResponse,
  ] = await Promise.all([
    supabase.rpc("get_executive_overview"),
    supabase.rpc("get_executive_home_supplement"),
    supabase.rpc("get_workforce_composition", {
      p_designation: null,
      p_employee_group: null,
      p_function: null,
      p_gender: null,
      p_location: null,
    }),
    supabase.rpc("get_organization_overview", {
      p_function: null,
      p_location: null,
    }),
    supabase.rpc("get_lifecycle_overview", {
      p_as_of_date: "2026-08-08",
      p_designation: null,
      p_employee_group: null,
      p_function: null,
      p_gender: null,
      p_location: null,
      p_retirement_horizon: 15,
      p_selected_year: 2026,
    }),
  ]);

  if (overviewResponse.error || !overviewResponse.data) {
    throw new Error("Unable to load Executive Overview");
  }

  if (supplementResponse.error || !supplementResponse.data) {
    throw new Error("Unable to load Executive supplemental analytics");
  }

  if (workforceResponse.error || !workforceResponse.data) {
    throw new Error("Unable to load Workforce widget data");
  }

  if (organizationResponse.error || !organizationResponse.data) {
    throw new Error("Unable to load Organization widget data");
  }

  if (lifecycleResponse.error || !lifecycleResponse.data) {
    throw new Error("Unable to load Lifecycle widget data");
  }

  const overview = overviewResponse.data as ExecutiveOverviewData;
  const supplement = supplementResponse.data as ExecutiveSupplementData;
  const workforce = workforceResponse.data as WorkforceCompositionData;
  const organization = organizationResponse.data as OrganizationOverviewData;
  const lifecycle = lifecycleResponse.data as LifecycleOverviewData;

  return (
    <CustomizableOverview
      lifecycle={lifecycle}
      organization={organization}
      overview={overview}
      supplement={supplement}
      workforce={workforce}
    />
  );
}
