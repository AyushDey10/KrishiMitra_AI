import type { Metadata } from "next";

import { SimulatorClient } from "@/components/simulator/simulator-client";

export const metadata: Metadata = {
  title: "Rainfall Simulator",
  description:
    "Shift seasonal rainfall between -50% and +50% and observe how the trained Random Forest model's ranked output responds.",
};

export default function SimulatorPage() {
  return <SimulatorClient />;
}
