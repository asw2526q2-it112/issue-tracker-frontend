"use client";

import { GenericSection } from "@/features/settings/components/sections/generic-section";
import { useTypes } from "@/features/settings/queries";

export default function TypesPage() {
  return (
    <GenericSection
      title="Types"
      entity="types"
      useDataHook={useTypes}
    />
  );
}
