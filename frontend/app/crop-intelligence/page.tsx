import type { Metadata } from "next";

import { CropExplorer } from "@/components/crop-intelligence/explorer";

export const metadata: Metadata = {
  title: "Crop Intelligence",
  description:
    "Observed historical conditions, class-level model reliability and linked indigenous practices for each crop class.",
};

export default function CropIntelligencePage() {
  return <CropExplorer />;
}
