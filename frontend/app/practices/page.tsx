import type { Metadata } from "next";

import { PracticeLibrary } from "@/components/practices/library";

export const metadata: Metadata = {
  title: "Indigenous Practices",
  description:
    "Documented indigenous farming practices from Northeast India, with regions, associated crops, conditions, limitations and cited sources.",
};

export default function PracticesPage() {
  return <PracticeLibrary />;
}
