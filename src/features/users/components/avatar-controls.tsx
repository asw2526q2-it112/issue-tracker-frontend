"use client";

import { useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  useRemoveAvatar,
  useUploadAvatar,
  type Me,
} from "@/features/users/queries";

export function AvatarControls({ me }: { me: Me }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useUploadAvatar();
  const remove = useRemoveAvatar();
  const busy = upload.isPending || remove.isPending;

  function pick() {
    fileRef.current?.click();
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await upload.mutateAsync(file);
      toast.success("Avatar updated.");
    } catch (err) {
      toast.error(
        `Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  }

  async function onRemove() {
    try {
      await remove.mutateAsync();
      toast.success("Avatar removed.");
    } catch (err) {
      toast.error(
        `Couldn't remove avatar: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={pick}
        disabled={busy}
      >
        {upload.isPending ? "Uploading…" : "Change photo"}
      </Button>
      {me.avatar ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onRemove}
          disabled={busy}
          className="text-muted-foreground"
        >
          {remove.isPending ? "Removing…" : "Use default image"}
        </Button>
      ) : null}
    </div>
  );
}
