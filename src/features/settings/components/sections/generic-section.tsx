"use client";

import { qk } from "@/lib/query/keys";
import { settingEntityFormSchema } from "../../schemas";
import { api, unwrap } from "@/lib/api/client";
import { SettingTable } from "../setting-table";

type GenericEntityType = "types" | "priorities" | "severities" | "tags";

interface GenericSectionProps {
  title: string;
  entity: GenericEntityType;
  useDataHook: () => any;
}

export function GenericSection({ title, entity, useDataHook }: GenericSectionProps) {
  const { data, isLoading } = useDataHook();

  const getQueryKey = () => {
    switch (entity) {
      case "types": return qk.settings.types();
      case "priorities": return qk.settings.priorities();
      case "severities": return qk.settings.severities();
      case "tags": return qk.settings.tags();
    }
  };

  const getPath = () => `/api/settings/${entity}/` as any;
  const getDetailPath = () => `/api/settings/${entity}/{id}/` as any;

  return (
    <SettingTable
      title={title}
      data={data?.results}
      isLoading={isLoading}
      queryKey={getQueryKey()}
      schema={settingEntityFormSchema}
      onCreate={async (data) => unwrap(await api.POST(getPath(), { body: data }))}
      onUpdate={async (id, data) => unwrap(await api.PUT(getDetailPath(), { params: { path: { id } }, body: data }))}
      onDelete={async (id) => unwrap(await api.DELETE(getDetailPath(), { params: { path: { id } } }))}
    />
  );
}
