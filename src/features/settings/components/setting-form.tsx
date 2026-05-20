"use client";

import { useForm, Path, Resolver } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export interface SettingFormValues {
  name: string;
  color: string;
  slug?: string;
  isclosed?: boolean;
  days?: number;
  isBefore?: boolean;
  [key: string]: unknown;
}

interface SettingFormProps {
  schema: z.ZodTypeAny;
  defaultValues: SettingFormValues;
  onSubmit: (data: SettingFormValues) => void;
  onCancel: () => void;
  children?: React.ReactNode;
  serverErrors?: Record<string, unknown> | null;
}

export function SettingForm({
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  children,
  serverErrors,
}: SettingFormProps) {
  const form = useForm<SettingFormValues>({
    resolver: zodResolver(schema as unknown as Parameters<typeof zodResolver>[0]) as unknown as Resolver<SettingFormValues>,
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (!serverErrors) {
      form.clearErrors();
      return;
    }

    // non-field/general errors
    const general = serverErrors.non_field_errors || serverErrors.detail || serverErrors._error;

    // set field errors
    Object.entries(serverErrors).forEach(([key, val]) => {
      if (key === "non_field_errors" || key === "detail" || key === "_error") return;
      const message = Array.isArray(val) ? val.join(" ") : String(val);
      try {
        form.setError(key as Path<SettingFormValues>, { type: "server", message });
      } catch {
        // ignore invalid field names
      }
    });

    if (general) {
      form.setError("_server" as Path<SettingFormValues>, { type: "server", message: Array.isArray(general) ? general.join(" ") : String(general) });
    }
  }, [serverErrors, form]);

  const serverError = (form.formState.errors as Record<string, { message?: string } | undefined>)._server;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md mx-auto">
        {serverError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {String(serverError.message || "")}
          </div>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="E.g. In Progress" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-md border shadow-sm">
                    <input
                      type="color"
                      {...field}
                      className="absolute inset-[-5px] h-[150%] w-[150%] cursor-pointer bg-transparent"
                    />
                  </div>
                  <Input 
                    placeholder="#RRGGBB" 
                    {...field} 
                    className="font-mono uppercase"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {children}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
