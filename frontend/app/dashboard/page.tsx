import type { Metadata } from "next";

import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Run the project's Random Forest model on a soil, climate and season profile and read the ranked historical crop patterns.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
