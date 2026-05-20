"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { useCreateIssue } from "../queries";
import { issueFormSchema, type IssueFormValues } from "../schemas";
import {
  useTypes,
  useSeverities,
  usePriorities,
  useStatuses,
} from "@/features/settings/queries";
import { useUsers } from "@/features/users/queries";
import { getCurrentUser } from "@/lib/auth/current-user";

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
import { Input } from "@/components/ui/input";
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

export function NewIssueDialog({ open, onOpenChange }: Props) {
  const { mutateAsync: createIssue, isPending } = useCreateIssue();

  const { data: types } = useTypes();
  const { data: severities } = useSeverities();
  const { data: priorities } = usePriorities();
  const { data: statuses } = useStatuses();
  const { data: users } = useUsers();

  const typeList = types && "results" in types ? types.results : (types ?? []);
  const severityList = severities && "results" in severities ? severities.results : (severities ?? []);
  const priorityList = priorities && "results" in priorities ? priorities.results : (priorities ?? []);
  const statusList = statuses && "results" in statuses ? statuses.results : (statuses ?? []);

  const currentUser = getCurrentUser();

  const form = useForm<IssueFormValues, unknown, IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      subject: "",
      description: "",
      assigned_to: null,
      deadline: null,
    },
  });

  const watchedType = useWatch({ control: form.control, name: "type" });
  const watchedSeverity = useWatch({ control: form.control, name: "severity" });
  const watchedPriority = useWatch({ control: form.control, name: "priority" });
  const watchedStatus = useWatch({ control: form.control, name: "status" });
  const statusColor = statusList.find((s) => s.id === watchedStatus)?.color;

  const typeColor = typeList.find((t) => t.id === watchedType)?.color;
  const severityColor = severityList.find((s) => s.id === watchedSeverity)?.color;
  const priorityColor = priorityList.find((p) => p.id === watchedPriority)?.color;

  async function onSubmit(values: IssueFormValues) {
    await createIssue({
      subject: values.subject,
      description: values.description ?? "",
      assigned_to: values.assigned_to ?? null,
      type: values.type!,
      severity: values.severity!,
      priority: values.priority!,
      status: values.status!,
      deadline: values.deadline ?? null,
    });
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
          <DialogTitle>New issue</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="new-issue-form">
            <div className="grid grid-cols-[1fr_15rem] gap-5">

              {/* ── Left column ── */}
              <div className="flex flex-col gap-3">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Subject" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col">
                      <FormControl>
                        <Textarea
                          placeholder="Please add descriptive text to help others better understand this issue"
                          className="min-h-[10rem] flex-1 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

                {/* Assign to */}
                <FormField
                  control={form.control}
                  name="assigned_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                        assign to
                      </FormLabel>
                      <Select
                        value={field.value != null ? String(field.value) : "__none__"}
                        onValueChange={(v) =>
                          field.onChange(v === "__none__" ? null : Number(v))
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">Unassigned</SelectItem>
                          {users.find((u) => u.username === currentUser.username) && (
                            <SelectItem
                              value={String(
                                users.find((u) => u.username === currentUser.username)!.id,
                              )}
                            >
                              Assign to me ({currentUser.username})
                            </SelectItem>
                          )}
                          {users
                            .filter((u) => u.username !== currentUser.username)
                            .map((u) => (
                              <SelectItem key={u.id} value={String(u.id)}>
                                {u.username}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
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
                        type
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
                        severity
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
                        priority
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

                {/* Deadline */}
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="shrink-0 text-muted-foreground"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <FormControl>
                          <Input
                            type="date"
                            className="flex-1"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" className="mt-5 w-full" disabled={isPending}>
              {isPending ? "Creating…" : "Create"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}