"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/features/users/schemas";

import type { Me } from "@/features/users/queries";

export function EditProfileForm({
  me,
  onSubmit,
  submitting,
}: {
  me: Me;
  onSubmit: (values: ProfileFormValues) => Promise<void> | void;
  submitting: boolean;
}) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: me.first_name ?? "",
      last_name: me.last_name ?? "",
      bio: me.bio ?? "",
    },
  });

  // Keep the form synced when the underlying profile refetches after a save
  // or a user switch.
  useEffect(() => {
    form.reset({
      first_name: me.first_name ?? "",
      last_name: me.last_name ?? "",
      bio: me.bio ?? "",
    });
  }, [me.first_name, me.last_name, me.bio, form]);

  async function handleSubmit(values: ProfileFormValues) {
    try {
      await onSubmit(values);
      toast.success("Profile saved.");
    } catch (err) {
      toast.error(
        `Couldn't save profile: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex max-w-xl flex-col gap-5"
      >
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio (max. 210 chars)</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
