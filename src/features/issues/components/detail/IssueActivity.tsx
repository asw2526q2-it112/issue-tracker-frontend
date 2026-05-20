"use client";

import { useState } from "react";
import { type components } from "@/lib/api/schema";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/current-user";
import { useAddComment, useEditComment, useDeleteComment } from "@/features/issues/queries";
import {
  Bold, Italic, Strikethrough, Link as LinkIcon, List, ListOrdered,
  AlignLeft, Image as ImageIcon, Quote, Table, Code, Minus, Undo, Redo,
  Pencil, Trash2
} from "lucide-react";

type IssueDetail = components["schemas"]["IssueDetail"];
type CommentRead = components["schemas"]["CommentRead"];

interface IssueActivityProps {
  issue: IssueDetail;
}

function initials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// --- SUB-COMPONENT: L'EDITOR DE TEXT ENRIQUIT ---
function CommentEditor({
  initialText = "",
  onSave,
  onCancel,
  isSaving
}: {
  initialText?: string;
  onSave: (text: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [text, setText] = useState(initialText);

  return (
    <div className="w-full border border-border rounded-sm bg-card shadow-sm flex flex-col mt-2">
      <div className="flex items-center gap-1 border-b border-border p-1.5 text-muted-foreground overflow-x-auto">
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-muted rounded text-sm font-medium text-foreground">
          Paragraph <ChevronDownIcon className="w-3 h-3" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button className="p-1.5 hover:bg-muted rounded text-foreground"><Bold className="w-4 h-4" /></button>
        <button className="p-1.5 hover:bg-muted rounded text-foreground"><Italic className="w-4 h-4" /></button>
        <button className="p-1.5 hover:bg-muted rounded text-foreground"><Strikethrough className="w-4 h-4" /></button>
        <button className="p-1.5 hover:bg-muted rounded text-foreground"><LinkIcon className="w-4 h-4" /></button>
        <div className="w-px h-4 bg-border mx-1" />
        <button className="p-1.5 hover:bg-muted rounded text-foreground"><List className="w-4 h-4" /></button>
        <button className="p-1.5 hover:bg-muted rounded text-foreground"><ListOrdered className="w-4 h-4" /></button>
        <button className="p-1.5 hover:bg-muted rounded text-foreground"><AlignLeft className="w-4 h-4" /></button>
        <div className="w-px h-4 bg-border mx-1" />
        <button className="p-1.5 hover:bg-muted rounded text-foreground"><ImageIcon className="w-4 h-4" /></button>
        <button className="p-1.5 hover:bg-muted rounded text-foreground"><Quote className="w-4 h-4" /></button>
        <button className="p-1.5 hover:bg-muted rounded text-foreground"><Table className="w-4 h-4" /></button>
        <button className="p-1.5 hover:bg-muted rounded text-foreground"><Code className="w-4 h-4" /></button>
        <button className="p-1.5 hover:bg-muted rounded text-foreground"><Minus className="w-4 h-4" /></button>
        <div className="w-px h-4 bg-border mx-1" />
        <button className="p-1.5 hover:bg-muted rounded text-foreground"><Undo className="w-4 h-4" /></button>
        <button className="p-1.5 hover:bg-muted rounded text-foreground"><Redo className="w-4 h-4" /></button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full min-h-[120px] p-4 focus:outline-none bg-transparent resize-y text-sm text-foreground"
        autoFocus
      />

      <div className="flex items-center justify-between p-2 bg-muted/30 border-t border-border">
        <span className="text-xs font-semibold px-2 text-muted-foreground bg-muted py-1 rounded">Markdown</span>
        <div className="flex gap-2">
          <button
            onClick={() => onSave(text)}
            disabled={isSaving || !text.trim()}
            className="bg-[#7de8d4] hover:bg-[#5bcbb7] disabled:opacity-50 text-[#0a1715] px-4 py-1.5 rounded-sm text-sm font-medium transition-colors"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onCancel}
            className="bg-muted hover:bg-muted/80 text-foreground px-4 py-1.5 rounded-sm text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function IssueActivity({ issue }: IssueActivityProps) {
  const comments = (issue.comments as CommentRead[] | undefined) || [];
  const activities = (issue.activity as components["schemas"]["ActivityRead"][] | undefined) || [];

  const currentUser = getCurrentUser();

  // Mutacions
  const { mutateAsync: addComment, isPending: isAdding } = useAddComment();
  const { mutateAsync: editComment, isPending: isEditing } = useEditComment();
  const { mutateAsync: deleteComment, isPending: isDeleting } = useDeleteComment();

  // Estats
  const [activeTab, setActiveTab] = useState<"comments" | "activities">("comments");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<CommentRead | null>(null);

  // estat per l'ordre dels comentaris i activitats (default Newest first)
  const [isOlderFirst, setIsOlderFirst] = useState(false);

  // Ordenem els comentaris just abans de pintar-los
  const sortedComments = [...comments].sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return isOlderFirst ? timeA - timeB : timeB - timeA;
  });

  // Ordenem les activitats (haurien d'estar ordenades)
  const sortedActivities = [...activities].sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return isOlderFirst ? timeA - timeB : timeB - timeA;
  });

  const handleAddComment = async (text: string) => {
    try {
      await addComment({ id: issue.id as number, data: { text } });
      setIsAddingComment(false);
    } catch (e) {
      console.error("Error adding comment", e);
    }
  };

  const handleEditComment = async (commentId: number, text: string) => {
    try {
      await editComment({ id: issue.id as number, commentId, data: { text } });
      setEditingCommentId(null);
    } catch (e) {
      console.error("Error editing comment", e);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      await deleteComment({ id: issue.id as number, commentId: commentToDelete.id as number });
      setCommentToDelete(null);
    } catch (e) {
      console.error("Error deleting comment", e);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-6">
      {/* Tabs / Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("comments")}
            className={`text-sm font-semibold pb-2 -mb-[9px] transition-colors border-b-2 ${
              activeTab === "comments"
                ? "text-foreground border-primary"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            {comments.length} Comments
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`text-sm font-semibold pb-2 -mb-[9px] transition-colors border-b-2 ${
              activeTab === "activities"
                ? "text-foreground border-primary"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            {activities.length} Activities
          </button>
        </div>

        {/* BOTÓ D'ORDENACIÓ AMB INTERACTIVITAT */}
        <button
          onClick={() => setIsOlderFirst(!isOlderFirst)}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center transition-colors"
        >
          {isOlderFirst ? "Older first" : "Newest first"}
          <span className="ml-1 text-[10px]">{isOlderFirst ? "▲" : "▼"}</span>
        </button>
      </div>

      {activeTab === "comments" ? (
        <>
          {/* Caixa principal per escriure un comentari nou */}
          {isAddingComment ? (
            <CommentEditor
              onSave={handleAddComment}
              onCancel={() => setIsAddingComment(false)}
              isSaving={isAdding}
            />
          ) : (
            <div
              onClick={() => setIsAddingComment(true)}
              className="border border-border p-3 bg-card rounded-sm text-muted-foreground text-sm cursor-text hover:bg-muted/30 transition-colors h-[60px]"
            >
              Type a new comment here
            </div>
          )}

          {/* Llista de comentaris ORDENADA */}
          <div className="flex flex-col gap-8 mt-6">
            {sortedComments.map((comment) => {
              const user = comment.creator as components["schemas"]["UserMini"] | null | undefined;
              const isCreator = currentUser?.username === user?.username;
              const isCurrentlyEditing = editingCommentId === comment.id;

              return (
                <div key={comment.id} className="flex gap-4 group">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={user?.avatar ?? undefined} />
                    <AvatarFallback className="bg-muted text-sm">
                      {user ? initials(user.username) : "??"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col flex-1 gap-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-primary">{user?.username ?? "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), "dd MMM yyyy HH:mm")}
                        </span>
                      </div>

                      {/* Botons d'Editar i Esborrar (només per al creador) */}
                      {isCreator && !isCurrentlyEditing && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingCommentId(comment.id as number)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                            title="Edit comment"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCommentToDelete(comment)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            title="Delete comment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Contingut del comentari o Editor si l'estem editant */}
                    {isCurrentlyEditing ? (
                      <CommentEditor
                        initialText={comment.text}
                        onSave={(newText) => handleEditComment(comment.id as number, newText)}
                        onCancel={() => setEditingCommentId(null)}
                        isSaving={isEditing}
                      />
                    ) : (
                      <div className="text-sm text-foreground whitespace-pre-wrap mt-1">
                        {comment.text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Llista d'activitats */
        <div className="flex flex-col gap-6 mt-6">
          {sortedActivities.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No activity history found.
            </div>
          ) : (
            sortedActivities.map((act) => {
              const user = act.user as components["schemas"]["UserMini"] | null | undefined;
              return (
                <div key={act.id} className="flex gap-4 items-start">
                  <Avatar className="size-8 shrink-0 mt-0.5">
                    <AvatarImage src={user?.avatar ?? undefined} />
                    <AvatarFallback className="bg-muted text-xs">
                      {user ? initials(user.username) : "??"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col flex-1 gap-1 min-w-0">
                    <div className="text-sm text-foreground">
                      <span className="font-semibold text-primary mr-2">
                        {user?.username ?? "Unknown"}
                      </span>
                      <span className="text-muted-foreground">{act.action}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(act.created_at), "dd MMM yyyy HH:mm")}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* OVERLAY DEL MODAL D'ESBORRAR COMENTARI */}
      {commentToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center bg-transparent p-6 max-w-md w-full text-center">
            <h2 className="text-3xl font-normal mb-6 text-foreground">Delete comment</h2>
            <p className="text-lg mb-2 font-medium">Are you sure you want to delete?</p>
            <p className="text-base text-muted-foreground mb-10 italic line-clamp-2 px-4">
              &quot;{commentToDelete.text}&quot;
            </p>

            <div className="flex items-center gap-6">
              <button
                className="text-[#008484] hover:underline font-medium px-4"
                onClick={() => setCommentToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <Button
                variant="destructive"
                className="bg-[#e03a3e] hover:bg-[#c93236] text-white px-6 rounded-sm shadow-md"
                onClick={handleDeleteComment}
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