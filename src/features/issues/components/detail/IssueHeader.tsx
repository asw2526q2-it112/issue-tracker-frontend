"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type components } from "@/lib/api/schema";
// ARREGLAT: Hem afegit el 'Clock' a les icones importades
import { ChevronLeft, Plus, X, Pencil, Save, Clock } from "lucide-react";
import { useUpdateIssue, useAddIssueTag, useRemoveIssueTag } from "@/features/issues/queries";

type IssueDetail = components["schemas"]["IssueDetail"];

interface IssueHeaderProps {
  issue: IssueDetail;
  canEdit: boolean;
  allTags: { id: number; name: string; color: string }[];
}

const PRESET_COLORS = [
  "#cc0000", "#e32474", "#9b59b6", "#6c5ce7", "#3b5998", "#1abc9c",
  "#2ecc71", "#27ae60", "#16a085", "#3498db", "#2980b9", "#8e44ad",
  "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#34495e", "#2c3e50",
  "#95a5a6", "#7f8c8d"
];

function initials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

export function IssueHeader({ issue, canEdit, allTags }: IssueHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(issue.subject);

  // Estats pel nou Tag
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagName, setTagName] = useState("");
  const [activeTagColor, setActiveTagColor] = useState("#95a5a6");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const pickerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { mutateAsync: updateIssue, isPending } = useUpdateIssue();
  const { mutateAsync: addTag, isPending: isAdding } = useAddIssueTag();
  const { mutateAsync: removeTag } = useRemoveIssueTag();

  const creator = issue.creator as components["schemas"]["UserMini"] | null | undefined;

  const issueTags = (issue.tags as unknown as { id: number; name: string; color: string }[]) || [];

  // Tanquem els desplegables si es clica fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveTitle = async () => {
    if (!title.trim() || title === issue.subject) {
      setIsEditingTitle(false);
      setTitle(issue.subject);
      return;
    }
    try {
      await updateIssue({ id: issue.id as number, data: { subject: title } });
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Error updating title:", error);
    }
  };

  const handleSaveTag = async () => {
    if (!tagName.trim()) {
      setIsAddingTag(false);
      return;
    }
    try {
      await addTag({ id: issue.id as number, data: { name: tagName.trim(), color: activeTagColor } });
      setTagName("");
      setActiveTagColor("#95a5a6");
      setIsAddingTag(false);
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    try {
      await removeTag({ id: issue.id as number, tagId });
    } catch (error) {
      console.error("Error removing tag:", error);
    }
  };

  const filteredTags = allTags.filter(
    t => t.name.toLowerCase().includes(tagName.toLowerCase()) && !issueTags.some(it => it.id === t.id)
  );


  const currentDueDate = (issue as Record<string, unknown>).deadline || (issue as Record<string, unknown>).due_date;
  let clockColor = "";

  if (currentDueDate) {
    const [year, month, day] = String(currentDueDate).substring(0, 10).split('-');
    const dueDateObj = new Date(Number(year), Number(month) - 1, Number(day));
    dueDateObj.setHours(0, 0, 0, 0);

    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    const diffDays = Math.round((dueDateObj.getTime() - todayObj.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      clockColor = "#e03a3e"; // Vermell (avui o passat)
    } else if (diffDays <= 14) {
      clockColor = "#f39c12"; // Taronja (fins a 2 setmanes)
    } else {
      clockColor = "#2ecc71"; // Verd (més de 2 setmanes)
    }
  }

  return (
    <div className="flex flex-col border-b border-border pb-4">
      <div className="flex items-start justify-between">

        {isEditingTitle && canEdit ? (
          <div className="flex items-center gap-2 w-full max-w-3xl flex-1 mr-4">
            <span className="font-semibold text-primary/80 text-2xl">#{issue.id}</span>
            <div className="flex items-center gap-1 flex-1 border border-border bg-card rounded-sm px-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 px-2 py-1.5 focus:outline-none bg-transparent text-xl text-foreground"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
              />
              <button onClick={handleSaveTitle} disabled={isPending} className="p-1.5 hover:bg-muted rounded text-foreground">
                <Save className="w-5 h-5" />
              </button>
              <button onClick={() => { setIsEditingTitle(false); setTitle(issue.subject); }} className="p-1.5 hover:bg-muted rounded text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <h1
            className={`text-2xl font-normal text-foreground flex items-center gap-2 flex-wrap w-fit ${canEdit ? 'group cursor-text' : ''}`}
            onClick={() => canEdit && setIsEditingTitle(true)}
          >
            <span className="font-semibold text-primary/80">#{issue.id}</span>
            <span>{issue.subject}</span>


            {Boolean(currentDueDate) && (
              <span title={`Due date: ${String(currentDueDate).substring(0, 10)}`} className="flex items-center">
                <Clock
                  className="w-[18px] h-[18px] shrink-0 mt-1"
                  color={clockColor}
                  strokeWidth={2.5}
                />
              </span>
            )}

            {canEdit && <Pencil className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ml-1" />}
          </h1>
        )}

        <Link href="/" className="shrink-0 text-muted-foreground hover:text-foreground flex items-center pt-2 ml-auto">
          <ChevronLeft className="w-4 h-4 mr-1" />
        </Link>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">

        {/* LLISTA DE TAGS */}
        <div className="flex items-center flex-wrap gap-2">
          {issueTags.map(tag => (
            <span
              key={tag.id}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded text-white text-xs font-medium shadow-sm"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              {canEdit && (
                <button onClick={() => handleDeleteTag(tag.id)} className="hover:bg-black/20 rounded-full p-0.5 -mr-1 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}

          {/* FORMULARI AFEGIR TAG */}
          {canEdit && (
            isAddingTag ? (
              <div className="flex items-center gap-1.5 bg-card rounded-sm border border-border p-1 shadow-sm h-8">

                {/* Input Text amb Autocomplete */}
                <div className="relative flex items-center h-full" ref={suggestionsRef}>
                  <input
                    type="text"
                    placeholder="Enter tag"
                    value={tagName}
                    onChange={(e) => { setTagName(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-32 px-1 py-0.5 text-sm focus:outline-none bg-transparent text-foreground h-full"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleSaveTag()}
                  />

                  {/* Desplegable de recomanacions */}
                  {showSuggestions && filteredTags.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-card border border-border rounded shadow-lg z-50 max-h-48 overflow-y-auto">
                      {filteredTags.map(t => (
                        <button
                          key={t.id}
                          className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-muted text-sm text-foreground text-left"
                          onClick={async () => {
                            setShowSuggestions(false);
                            try {
                              await addTag({ id: issue.id as number, data: { name: t.name, color: t.color } });
                              setTagName("");
                              setActiveTagColor("#95a5a6");
                              setIsAddingTag(false);
                            } catch (error) {
                              console.error("Error adding preset tag:", error);
                            }
                          }}
                        >
                          <span>{t.name}</span>
                          <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: t.color }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Color Picker Box */}
                <div className="relative flex items-center h-full" ref={pickerRef}>
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-5 h-5 rounded-sm border border-border shrink-0 shadow-inner block"
                    style={{ backgroundColor: activeTagColor }}
                    type="button"
                  />

                  {/* Desplegable Color Picker */}
                  {showColorPicker && (
                    <div className="absolute top-full left-0 mt-3 p-3 bg-card border border-border rounded-sm shadow-xl z-50 w-48 flex flex-col gap-3">
                      <div className="grid grid-cols-6 gap-1.5">
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => { setActiveTagColor(c); setShowColorPicker(false); }}
                            className={`w-5 h-5 rounded-sm hover:scale-110 transition-transform ${activeTagColor === c ? 'ring-2 ring-primary ring-offset-1 ring-offset-card' : ''}`}
                            style={{ backgroundColor: c }}
                            type="button"
                          />
                        ))}
                      </div>
                      <input
                        type="text"
                        value={activeTagColor}
                        onChange={(e) => setActiveTagColor(e.target.value)}
                        className="w-full text-xs p-1.5 border border-border rounded-sm bg-background"
                        placeholder="Type hex code"
                      />
                    </div>
                  )}
                </div>

                {/* Save / Cancel Buttons */}
                <div className="flex items-center h-full gap-0.5 ml-1">
                  <button onClick={handleSaveTag} disabled={isAdding} className="p-1 hover:bg-muted rounded text-primary flex items-center justify-center">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setIsAddingTag(false); setTagName(""); }} className="p-1 hover:bg-muted rounded text-muted-foreground flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                className="text-primary/80 hover:text-primary text-sm font-medium hover:underline flex items-center ml-1"
              >
                Add tag <Plus className="w-3 h-3 ml-0.5" />
              </button>
            )
          )}
        </div>

        {/* Creator and Date */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground text-right">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1">
              Created by
              {creator ? (
                <Link href={`/profile/${creator.username}`} className="text-primary font-medium hover:underline">
                  {creator.username}
                </Link>
              ) : (
                <span className="text-primary font-medium">Unknown</span>
              )}
            </span>
            <span>{format(new Date(issue.created_at), "dd MMM yyyy HH:mm")}</span>
          </div>
          {creator && (
            <Link href={`/profile/${creator.username}`}>
              <Avatar className="size-8 border border-border hover:opacity-80 transition-opacity cursor-pointer">
                <AvatarImage src={creator.avatar ?? undefined} />
                <AvatarFallback className="text-xs bg-muted">
                  {initials(creator.username)}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}