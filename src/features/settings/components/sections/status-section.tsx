"use client";

import { Check } from "lucide-react";

import { useStatuses } from "../../queries";
import { qk } from "@/lib/query/keys";
import { statusSettingFormSchema } from "../../schemas";
import { api, unwrap } from "@/lib/api/client";
import { SettingTable } from "../setting-table";
import { TableHead, TableCell } from "@/components/ui/table";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormContext } from "react-hook-form";

function StatusExtraFields() {
  const { control } = useFormContext();
  return (
    <>
      <FormField
        control={control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <Input placeholder="in-progress" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="isclosed"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Is Closed</FormLabel>
              <p className="text-sm text-muted-foreground">
                Mark if this status represents a finished task.
              </p>
            </div>
          </FormItem>
        )}
      />
    </>
  );
}

export function StatusSection() {
  const { data, isLoading } = useStatuses();

  return (
    <SettingTable
      title="Statuses"
      data={data?.results}
      isLoading={isLoading}
      queryKey={qk.settings.statuses()}
      schema={statusSettingFormSchema}
      onCreate={async (data) => unwrap(await api.POST("/api/settings/statuses/", { body: data }))}
      onUpdate={async (id, data) => unwrap(await api.PUT("/api/settings/statuses/{id}/", { params: { path: { id } }, body: data }))}
      onDelete={async (id) => unwrap(await api.DELETE("/api/settings/statuses/{id}/", { params: { path: { id } } }))}
      renderExtraHeader={() => (
        <>
          <TableHead>Slug</TableHead>
          <TableHead>Closed</TableHead>
        </>
      )}
      renderExtraColumns={(item) => (
        <>
          <TableCell>
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded-md font-mono">
              {item.slug}
            </code>
          </TableCell>
          <TableCell>
            {item.is_closed && <Check className="h-4 w-4 text-primary" />}
          </TableCell>
        </>
      )}
      renderExtraFormFields={() => <StatusExtraFields />}
      getDefaultValues={(item) => ({
        name: item?.name || "",
        color: item?.color || "#25c2a0",
        slug: item?.slug || "",
        isclosed: item?.is_closed || false,
      })}
      transformSubmitData={(data) => ({
        ...data,
        isclosed: data.isclosed ? "true" : "false",
      })}
    />
  );
}
