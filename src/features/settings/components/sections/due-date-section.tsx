"use client";

import { useDueDates } from "../../queries";
import { qk } from "@/lib/query/keys";
import { dueDateSettingFormSchema } from "../../schemas";
import { api, unwrap } from "@/lib/api/client";
import { SettingTable } from "../setting-table";
import { TableHead, TableCell } from "@/components/ui/table";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormContext } from "react-hook-form";

function DueDateExtraFields() {
  const { control } = useFormContext();
  return (
    <>
      <FormField
        control={control}
        name="days"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Days Offset</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="isBefore"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Is Before</FormLabel>
              <p className="text-sm text-muted-foreground">
                If checked, calculates days before instead of after.
              </p>
            </div>
          </FormItem>
        )}
      />
    </>
  );
}

export function DueDateSection() {
  const { data, isLoading } = useDueDates();

  return (
    <SettingTable
      title="Due Dates"
      data={data?.results}
      isLoading={isLoading}
      queryKey={qk.settings.dueDates()}
      schema={dueDateSettingFormSchema}
      onCreate={async (data) => unwrap(await api.POST("/api/settings/due-dates/", { body: data }))}
      onUpdate={async (id, data) => unwrap(await api.PUT("/api/settings/due-dates/{id}/", { params: { path: { id } }, body: data }))}
      onDelete={async (id) => unwrap(await api.DELETE("/api/settings/due-dates/{id}/", { params: { path: { id } } }))}
      renderExtraHeader={() => (
        <>
          <TableHead>Days to due date</TableHead>
          <TableHead>Before/After</TableHead>
        </>
      )}
      renderExtraColumns={(item) => (
        <>
          <TableCell className="font-medium">
            {item.days === null ? "" : item.days}
          </TableCell>
          <TableCell>{item.days ? (item.isBefore ? "Before" : "After") : ""}</TableCell>
        </>
      )}
      renderExtraFormFields={() => <DueDateExtraFields />}
      getDefaultValues={(item) => ({
        name: item?.name || "",
        color: item?.color || "#25c2a0",
        days: item?.days || 0,
        isBefore: item?.isBefore || false,
      })}
      transformSubmitData={(data) => ({
        ...data,
        isBefore: data.isBefore ? "true" : "false",
      })}
    />
  );
}
