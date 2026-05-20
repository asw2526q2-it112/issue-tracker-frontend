"use client";

import { GenericSection } from "@/features/settings/components/sections/generic-section";
import { usePriorities } from "@/features/settings/queries";

export default function PrioritiesPage() {
  return (
    <GenericSection
      title="Priorities"
      entity="priorities"
      useDataHook={usePriorities}
    />
  );
}
