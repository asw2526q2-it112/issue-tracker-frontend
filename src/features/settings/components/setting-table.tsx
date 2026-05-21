"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingForm, SettingFormValues } from "./setting-form";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/query/keys";

interface BaseItem {
  id: number;
  name: string;
  color: string;
}

interface SettingTableProps<
  TSubmit = SettingFormValues,
  TItem extends BaseItem = BaseItem,
> {
  title: string;
  data: TItem[] | undefined;
  isLoading: boolean;
  queryKey: readonly unknown[];
  schema: z.ZodTypeAny;
  onCreate: (data: TSubmit) => Promise<unknown>;
  onUpdate: (id: number, data: TSubmit) => Promise<unknown>;
  onDelete: (id: number, replacement?: number) => Promise<unknown>;
  renderExtraColumns?: (item: TItem) => React.ReactNode;
  renderExtraHeader?: () => React.ReactNode;
  renderExtraFormFields?: () => React.ReactNode;
  getDefaultValues?: (item?: TItem) => SettingFormValues;
  transformSubmitData?: (data: SettingFormValues) => TSubmit;
  disableReplacementOnDelete?: boolean;
}

export function SettingTable<
  TSubmit = SettingFormValues,
  TItem extends BaseItem = BaseItem,
>({
  title,
  data,
  isLoading,
  queryKey,
  schema,
  onCreate,
  onUpdate,
  onDelete,
  renderExtraColumns,
  renderExtraHeader,
  renderExtraFormFields,
  getDefaultValues,
  transformSubmitData,
  disableReplacementOnDelete,
}: SettingTableProps<TSubmit, TItem>) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<TItem | null>(null);
  const [replacementId, setReplacementId] = useState<string>("");
  const [serverErrors, setServerErrors] = useState<Record<string, unknown> | null>(null);

  const createMutation = useMutation({
    mutationFn: onCreate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: qk.issues.all });
      setIsDialogOpen(false);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setServerErrors(err.data as Record<string, unknown>);
      } else {
        setServerErrors({ _error: String((err as Error)?.message || "An error occurred") });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TSubmit }) => onUpdate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: qk.issues.all });
      setIsDialogOpen(false);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setServerErrors(err.data as Record<string, unknown>);
      } else {
        setServerErrors({ _error: String((err as Error)?.message || "An error occurred") });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, replacement }: { id: number; replacement?: number }) => onDelete(id, replacement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: qk.issues.all });
      setDeletingItem(null);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setServerErrors(err.data as Record<string, unknown>);
      } else {
        setServerErrors({ _error: String((err as Error)?.message || "An error occurred") });
      }
    },
  });

  const handleSubmit = (formData: SettingFormValues) => {
    const payload = transformSubmitData ? transformSubmitData(formData) : (formData as unknown as TSubmit);
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setServerErrors(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: TItem) => {
    setEditingItem(item);
    setServerErrors(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between px-6 py-4 bg-sidebar-secondary/40 text-foreground rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit" : "Create"} {title.slice(0, -1)}
              </DialogTitle>
              <DialogDescription>
                Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <SettingForm
              schema={schema}
              defaultValues={getDefaultValues ? getDefaultValues(editingItem || undefined) : ((editingItem || { name: "", color: "#25c2a0" }) as unknown as SettingFormValues)}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              serverErrors={serverErrors}
            >
              {renderExtraFormFields?.()}
            </SettingForm>
          </DialogContent>
        </Dialog>
      </div>

      <div className="px-0">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : (
          <div className="bg-transparent overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/50">
                  <TableHead className="w-[80px] pl-6">Color</TableHead>
                  <TableHead>Name</TableHead>
                  {renderExtraHeader?.()}
                  <TableHead className="w-[120px] text-right pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((item) => (
                  <TableRow key={item.id} className="group transition-colors hover:bg-muted/30">
                    <TableCell className="pl-6">
                      <div
                        className="h-5 w-5 rounded-md shadow-sm border border-black/10"
                        style={{ backgroundColor: item.color }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.name}
                    </TableCell>
                    {renderExtraColumns?.(item)}
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(item)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setDeletingItem(item);
                            setReplacementId("");
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.length && (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent className="max-w-md flex flex-col items-center">
          <DialogHeader className="w-full flex flex-col items-center mt-2">
            <DialogTitle className="text-2xl font-normal tracking-wide text-foreground mb-4">Delete value</DialogTitle>
            <DialogDescription className="text-center font-medium text-foreground text-base uppercase">
              {deletingItem?.name}
            </DialogDescription>
          </DialogHeader>
          {disableReplacementOnDelete ? (
            <div className="py-2 w-full text-center px-4">
              <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            </div>
          ) : (
            <div className="py-2 w-full text-center px-4">
              <p className="mb-3 text-sm text-foreground">All items with this value will be changed to</p>
              <Select value={replacementId} onValueChange={setReplacementId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a replacement..." />
                </SelectTrigger>
                <SelectContent>
                  {data?.filter(i => i.id !== deletingItem?.id).map(i => (
                    <SelectItem key={i.id} value={i.id.toString()}>{i.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex flex-row justify-between w-full items-center mt-6">
            <Button variant="ghost" onClick={() => setDeletingItem(null)} className="text-[#008484] hover:text-[#008484] hover:underline font-medium px-2 bg-transparent">
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={(!disableReplacementOnDelete && !replacementId) || deleteMutation.isPending}
              onClick={() => {
                if (deletingItem) {
                  const repl = disableReplacementOnDelete ? undefined : parseInt(replacementId, 10);
                  if (disableReplacementOnDelete || repl) {
                    deleteMutation.mutate({ id: deletingItem.id, replacement: repl });
                  }
                }
              }}
              className="bg-[#e03a3e] hover:bg-[#c93236] text-white px-6 shadow-sm rounded-sm uppercase tracking-wide font-medium"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

  );
}
