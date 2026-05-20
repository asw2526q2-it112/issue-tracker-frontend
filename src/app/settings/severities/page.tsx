"use client";

import { GenericSection } from "@/features/settings/components/sections/generic-section";
import { useSeverities } from "@/features/settings/queries";

export default function SeveritiesPage() {
  return (
    <GenericSection
      title="Severities"
      entity="severities"
      useDataHook={useSeverities}
    />
  );
}
