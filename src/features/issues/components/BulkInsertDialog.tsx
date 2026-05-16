"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useBulkCreateIssues } from "../queries";
import { bulkIssueSchema, type BulkIssueFormValues } from "../schemas";
import {
  useTypes,
  useSeverities,
  usePriorities,
  useStatuses,
} from "@/features/settings/queries";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ColorDot({ color }: { color?: string }) {
  return (
    <span
      className="mt-0.5 h-3 w-3 shrink-0 rounded-full border border-border"
      style={{ background: color ?? "#6b7280" }}
    />
  );
}

export function BulkInsertDialog({ open, onOpenChange }: Props) {
  const { mutateAsync: bulkCreate, isPending } = useBulkCreateIssues();

  const { data: types } = useTypes();
  const { data: severities } = useSeverities();
  const { data: priorities } = usePriorities();
  const { data: statuses } = useStatuses();

  const typeList     = types      && "results" in types      ? types.results      : (types      ?? []);
  const severityList = severities && "results" in severities ? severities.results : (severities ?? []);
  const priorityList = priorities && "results" in priorities ? priorities.results : (priorities ?? []);
  const statusList   = statuses   && "results" in statuses   ? statuses.results   : (statuses   ?? []);

  const form = useForm<BulkIssueFormValues, unknown, BulkIssueFormValues>({
    resolver: zodResolver(bulkIssueSchema),
    defaultValues: { subjects: "" },
  });

  const watchedType     = form.watch("type");
  const watchedSeverity = form.watch("severity");
  const watchedPriority = form.watch("priority");
const watchedStatus   = form.watch("status");
const statusColor     = statusList.find((s) => s.id === watchedStatus)?.color;

  const typeColor     = typeList.find((t) => t.id === watchedType)?.color;
  const severityColor = severityList.find((s) => s.id === watchedSeverity)?.color;
  const priorityColor = priorityList.find((p) => p.id === watchedPriority)?.color;

  const subjectsValue = form.watch("subjects");
  const lineCount = subjectsValue
    ? subjectsValue.split("\n").filter((l) => l.trim().length > 0).length
    : 0;

  async function onSubmit(values: BulkIssueFormValues) {
    await bulkCreate(values);
    form.reset();
    onOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) form.reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk insert issues</DialogTitle>
          <p className="text-sm text-muted-foreground">
            One issue per line. All issues will be created with the selected
            attributes.
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-[1fr_15rem] gap-5">

              {/* ── Left column: textarea ── */}
              <FormField
                control={form.control}
                name="subjects"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormControl>
                      <Textarea
                        placeholder={"Issue name\nAnother issue\nYet another issue"}
                        className="min-h-[14rem] flex-1 resize-none font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    {lineCount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {lineCount} issue{lineCount !== 1 ? "s" : ""} will be
                        created
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ── Right column ── */}
              <div className="flex flex-col gap-3">

                {/* Status — prominent, no label */}
<FormField
  control={form.control}
  name="status"
  render={({ field }) => (
    <FormItem>
        <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                        Status
                      </FormLabel>
      <div className="flex items-center gap-2">
        <Select
          value={field.value != null ? String(field.value) : ""}
          onValueChange={(v) => field.onChange(Number(v))}
        >
          <FormControl>
            <SelectTrigger className="flex-1 font-medium">
              <SelectValue placeholder="Select status…" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {statusList.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ColorDot color={statusColor} />
      </div>
      <FormMessage />
    </FormItem>
  )}
/>

                {/* Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                        Type
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <Select
                          value={field.value != null ? String(field.value) : ""}
                          onValueChange={(v) => field.onChange(Number(v))}
                        >
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {typeList.map((t) => (
                              <SelectItem key={t.id} value={String(t.id)}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <ColorDot color={typeColor} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Severity */}
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                        Severity
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <Select
                          value={field.value != null ? String(field.value) : ""}
                          onValueChange={(v) => field.onChange(Number(v))}
                        >
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {severityList.map((s) => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <ColorDot color={severityColor} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Priority */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                        Priority
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <Select
                          value={field.value != null ? String(field.value) : ""}
                          onValueChange={(v) => field.onChange(Number(v))}
                        >
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {priorityList.map((p) => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <ColorDot color={priorityColor} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            {/* Submit pinned to bottom of right col */}
                <Button
                  type="submit"
                  className="mt-5 w-full"
                  disabled={isPending || lineCount === 0}
                >
                  {isPending
                    ? "Creating…"
                    : `Create issue${lineCount !== 1 ? "s" : ""}`}
                </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}