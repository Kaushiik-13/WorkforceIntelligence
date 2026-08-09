import { connection } from "next/server";

import {
  CustomizableOverview,
  type ExecutiveOverviewData,
  type ExecutiveSupplementData,
} from "@/components/customizable-overview";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export default async function OverviewPage() {
  await connection();

  const supabase = createSupabaseServerClient();
  const [overviewResponse, supplementResponse] = await Promise.all([
    supabase.rpc("get_executive_overview"),
    supabase.rpc("get_executive_home_supplement"),
  ]);

  if (overviewResponse.error || !overviewResponse.data) {
    throw new Error("Unable to load Executive Overview");
  }

  if (supplementResponse.error || !supplementResponse.data) {
    throw new Error("Unable to load Executive supplemental analytics");
  }

  const overview = overviewResponse.data as ExecutiveOverviewData;
  const supplement = supplementResponse.data as ExecutiveSupplementData;

  return <CustomizableOverview overview={overview} supplement={supplement} />;
}
