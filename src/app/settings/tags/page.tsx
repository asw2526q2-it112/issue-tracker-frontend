"use client";

import { GenericSection } from "@/features/settings/components/sections/generic-section";
import { useTags } from "@/features/settings/queries";

export default function TagsPage() {
  return (
    <GenericSection
      title="Tags"
      entity="tags"
      useDataHook={useTags}
      disableReplacementOnDelete={true}
    />
  );
}
