"use client";

import { useState, useRef } from "react";
import { type components } from "@/lib/api/schema";
import { Plus, LayoutGrid, List as ListIcon, Trash2, Paperclip, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddIssueAttachment, useDeleteIssueAttachment } from "@/features/issues/queries";
import { getCurrentUser } from "@/lib/auth/current-user";
import { number } from "zod";

type IssueDetail = components["schemas"]["IssueDetail"];
type AttachmentRead = components["schemas"]["AttachmentRead"];

interface IssueAttachmentsProps {
  issue: IssueDetail;
}

export function IssueAttachments({ issue }: IssueAttachmentsProps) {
  const [viewMode, setViewMode] = useState<"list" | "gallery">("list");
  const [isDragging, setIsDragging] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<AttachmentRead | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = getCurrentUser();

  const { mutateAsync: addAttachment, isPending: isAdding } = useAddIssueAttachment();
  const { mutateAsync: deleteAttachment, isPending: isDeleting } = useDeleteIssueAttachment();

  const attachments = (issue.attachments as AttachmentRead[] | undefined) || [];
  const count = attachments.length;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await addAttachment({ id: issue.id as number, file });
      } catch (error) {
        console.error("Error adding attachment:", error);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      try {
        await addAttachment({ id: issue.id as number, file });
      } catch (error) {
        console.error("Error adding attachment:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (!attachmentToDelete) return;
    try {
      await deleteAttachment({ id: issue.id as number, attachmentId: attachmentToDelete.id as number });
      setAttachmentToDelete(null);
    } catch (error) {
      console.error("Error deleting attachment:", error);
    }
  };

  return (
    <div
      className="flex flex-col gap-2 mt-4"
      // Si ja hi ha fitxers, permetem fer el drop a qualsevol lloc d'aquest contenidor
      onDragOver={(e) => {
        if (count > 0) {
          e.preventDefault();
          setIsDragging(true);
        }
      }}
      onDragLeave={() => {
        if (count > 0) setIsDragging(false);
      }}
      onDrop={(e) => {
        if (count > 0) handleDrop(e);
      }}
    >
      {/* Header */}
      <div className={`flex items-center justify-between bg-muted/30 px-3 py-1.5 border border-border transition-colors ${isDragging && count > 0 ? "bg-primary/5 border-primary" : ""}`}>
        <span className="font-semibold text-sm text-foreground">{count} Attachments</span>

        <div className="flex items-center gap-1">
          {count > 0 && (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setViewMode("gallery")}
                className={`h-6 w-6 rounded-none ${viewMode === "gallery" ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"}`}
                title="Gallery view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setViewMode("list")}
                className={`h-6 w-6 rounded-none mr-2 ${viewMode === "list" ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"}`}
                title="List view"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </Button>
            </>
          )}

          <Button
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAdding}
            className="h-6 w-6 text-[#008484] hover:text-primary hover:bg-primary/10 rounded-none bg-[#7de8d4]/30 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* Llista d'Attachments */}
      {count > 0 && (
        <div className={viewMode === "list" ? "flex flex-col mt-1 border border-border divide-y divide-border bg-card" : "flex flex-wrap gap-4 mt-2"}>
          {attachments.map(att => {


            const canDelete = att.uploaded_by === Number(currentUser.id);

            if (viewMode === "list") {
              return (
                <div key={att.id} className="flex items-center justify-between py-2 px-3 hover:bg-muted/30 group transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                    <a href={att.file} target="_blank" rel="noreferrer" className="truncate text-sm text-[#008484] hover:underline cursor-pointer">
                      {att.original_filename}
                    </a>
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => setAttachmentToDelete(att)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1 shrink-0"
                      title="Delete attachment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            }

            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(att.original_filename);
            return (
              <div key={att.id} className="relative group border border-border bg-card w-32 h-32 flex flex-col items-center justify-center rounded-sm hover:border-primary transition-colors">
                {canDelete && (
                  <button
                    onClick={() => setAttachmentToDelete(att)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-background/80 p-1 rounded-sm text-muted-foreground hover:text-destructive transition-opacity z-10"
                    title="Delete attachment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <a href={att.file} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center w-full h-full p-2">
                  <div className="flex-1 flex items-center justify-center w-full bg-muted/30 mb-2 overflow-hidden rounded-sm">
                    {isImage ? (
                      <img src={att.file} alt={att.original_filename} className="w-full h-full object-cover" />
                    ) : (
                      <FileIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-xs text-[#008484] hover:underline truncate w-full text-center px-1">
                    {att.original_filename}
                  </span>
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Caixa Drag & Drop (NOMÉS APAREIX SI NO HI HA CAP ATTACHMENT) */}
      {count === 0 && (
        <div
          className={`border-2 border-dashed p-8 flex items-center justify-center transition-colors mt-2 ${isDragging ? "border-primary bg-primary/5" : "border-border bg-card"}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <span className="text-sm text-muted-foreground">
            {isAdding ? "Uploading..." : "Drop attachments here!"}
          </span>
        </div>
      )}

      {/* OVERLAY DEL MODAL D'ESBORRAR ATTACHMENT */}
      {attachmentToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center bg-transparent p-6 max-w-md w-full text-center">
            <h2 className="text-3xl font-normal mb-6 text-foreground">Delete attachment</h2>
            <p className="text-lg mb-2 font-medium">Are you sure you want to delete?</p>
            <p className="text-base text-muted-foreground mb-10 italic line-clamp-2 px-4">
              &quot;{attachmentToDelete.original_filename}&quot;
            </p>

            <div className="flex items-center gap-6">
              <button
                className="text-[#008484] hover:underline font-medium px-4"
                onClick={() => setAttachmentToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <Button
                variant="destructive"
                className="bg-[#e03a3e] hover:bg-[#c93236] text-white px-6 rounded-sm shadow-md"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "DELETING..." : "DELETE"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}