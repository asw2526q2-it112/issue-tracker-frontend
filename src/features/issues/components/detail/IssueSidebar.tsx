"use client";

import { useState, useRef, useEffect } from "react";
import { ColorDot } from "../ColorDot";
import { type components } from "@/lib/api/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, ChevronDown, Clock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeleteIssue, useUpdateIssue } from "@/features/issues/queries";

type IssueDetail = components["schemas"]["IssueDetail"];

type SettingOption = { id: number; name: string; color: string; is_closed?: boolean };

interface IssueSidebarProps {
  issue: IssueDetail;
  colorMap: Record<string, string>;
  options: {
    status: SettingOption[];
    type: SettingOption[];
    severity: SettingOption[];
    priority: SettingOption[];
  };
  canEdit: boolean;
}

// --- SUB-COMPONENT: EL DROPDOWN DE L'STATUS (ARREGLAT I AMB COLORS) ---
function StatusDropdown({
  issueStatus,
  options,
  onSelect,
  canEdit,
  colorMap // Necessitem els colors aquí!
}: {
  issueStatus: unknown;
  options: SettingOption[];
  onSelect: (id: number) => void;
  canEdit: boolean;
  colorMap: Record<string, string>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusName = getFieldName(issueStatus);
  const isClosed = issueStatus && typeof issueStatus === 'object' && (issueStatus as { is_closed?: boolean }).is_closed;

  // Agafem el color actual (si no el troba, posa un gris per defecte)
  const currentColor = colorMap[statusName] || "#6c757d";

  return (
    <div className="relative w-full z-50 mb-2" ref={ref}>
      <div className="flex items-center gap-3">
        {/* L'estat global (OPEN o CLOSED) en text gran */}
        <span className="text-foreground text-2xl font-light uppercase tracking-wide">
          {isClosed ? "CLOSED" : "OPEN"}
        </span>

        {/* El requadre petit amb el nom de l'Status i el seu color */}
        <button
          onClick={() => canEdit && setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-white text-xs font-semibold uppercase transition-opacity ${canEdit ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
          style={{ backgroundColor: currentColor }}
        >
          {statusName}
          {canEdit && <ChevronDown className="w-3 h-3 opacity-70 ml-1" />}
        </button>
      </div>

      {/* El llistat d'opcions com a la foto */}
      {isOpen && canEdit && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border shadow-lg rounded-sm flex flex-col py-1 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); onSelect(opt.id); }}
              className="text-left px-4 py-2 hover:bg-muted transition-colors flex items-center justify-between"
            >
              <span className="uppercase font-bold text-foreground text-xs">{opt.name}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#6c757d] text-white">
                {opt.is_closed ? "CLOSED" : "OPEN"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENT: EL DROPDOWN INLINE (TYPE, SEVERITY, PRIORITY) ---
function InlineDropdown({
  currentName,
  currentColor,
  options,
  onSelect,
  canEdit
}: {
  currentName: string;
  currentColor: string;
  options: SettingOption[];
  onSelect: (id: number) => void;
  canEdit: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!canEdit) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground">{currentName}</span>
        <ColorDot color={currentColor ?? "#94a3b8"} title={currentName} />
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-2 cursor-pointer group" ref={ref} onClick={() => setIsOpen(!isOpen)}>
      <span className="font-medium text-foreground group-hover:text-primary transition-colors">{currentName}</span>
      <ColorDot color={currentColor ?? "#94a3b8"} title={currentName} />

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-card border border-border shadow-lg rounded-sm z-50 flex flex-col py-1">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); onSelect(opt.id); }}
              className="text-left px-4 py-2 hover:bg-muted text-sm text-[#008484] hover:text-primary transition-colors"
            >
              {opt.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getFieldName(field: unknown): string {
  if (typeof field === "string") return field;
  if (typeof field === "object" && field !== null && "name" in field) {
    const obj = field as { name?: unknown };
    return typeof obj.name === "string" ? obj.name : "";
  }
  return String(field ?? "");
}

function initials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

// --- MAIN SIDEBAR ---
export function IssueSidebar({ issue, colorMap, options, canEdit }: IssueSidebarProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const { mutateAsync: deleteIssueMutation } = useDeleteIssue();
  const { mutateAsync: updateIssue } = useUpdateIssue();

  const typeName = getFieldName(issue.type);
  const severityName = getFieldName(issue.severity);
  const priorityName = getFieldName(issue.priority);

  const assignee = issue.assigned_to as components["schemas"]["UserMini"] | null | undefined;
  const watchers = issue.watchers as components["schemas"]["UserMini"][] | undefined;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteIssueMutation(issue.id as number);
      setShowDeleteModal(false);
      router.push("/");
    } catch (error) {
      console.error("Error deleting issue:", error);
      setIsDeleting(false);
    }
  };

  const handleUpdateField = async (field: "type" | "severity" | "priority" | "status", newId: number) => {
    try {
      await updateIssue({ id: issue.id as number, data: { [field]: newId } });
    } catch (e) {
      console.error("Error updating field", e);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8">

        {/* Status Dropdown ja connectat amb la prop de colors */}
        <StatusDropdown
          issueStatus={issue.status}
          options={options.status}
          onSelect={(id) => handleUpdateField("status", id)}
          canEdit={canEdit}
          colorMap={colorMap}
        />

        <div className="flex flex-col gap-4 text-sm relative z-40">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">type</span>
            <InlineDropdown
              currentName={typeName}
              currentColor={colorMap[typeName]}
              options={options.type}
              onSelect={(id) => handleUpdateField("type", id)}
              canEdit={canEdit}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">severity</span>
            <InlineDropdown
              currentName={severityName}
              currentColor={colorMap[severityName]}
              options={options.severity}
              onSelect={(id) => handleUpdateField("severity", id)}
              canEdit={canEdit}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">priority</span>
            <InlineDropdown
              currentName={priorityName}
              currentColor={colorMap[priorityName]}
              options={options.priority}
              onSelect={(id) => handleUpdateField("priority", id)}
              canEdit={canEdit}
            />
          </div>
        </div>

        <hr className="border-border" />

        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">Assigned</span>
          <div className="flex items-center justify-between">
            {assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarImage src={assignee.avatar ?? undefined} />
                  <AvatarFallback className="text-[10px] bg-muted">
                    {initials(assignee.username)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{assignee.username}</span>
              </div>
            ) : (
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
                + Add assigned
              </button>
            )}
            <button className="text-sm text-primary hover:underline">
              Assign to me
            </button>
          </div>
        </div>

        <hr className="border-border" />

        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">Watchers</span>
          <div className="flex items-center justify-between">
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
              + Add watchers
            </button>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Eye className="w-4 h-4" /> Watch
            </button>
          </div>
          {watchers && watchers.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              {watchers.map(watcher => (
                <div key={watcher.id} className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarImage src={watcher.avatar ?? undefined} />
                    <AvatarFallback className="text-[10px] bg-muted">
                      {initials(watcher.username)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground">{watcher.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <hr className="border-border" />

        <div className="flex items-center gap-2 mt-4">
          <Button variant="secondary" size="icon" className="h-8 w-8 rounded shrink-0 bg-[#f1f3f5] hover:bg-[#e2e6ea]">
            <span className="sr-only">Due Date</span>
            <Clock className="w-4 h-4 text-[#008484]" strokeWidth={2.5} />
          </Button>

          {canEdit && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => setShowDeleteModal(true)}
            >
              <span className="sr-only">Delete</span>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {showDeleteModal && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center bg-transparent p-6 max-w-md w-full text-center">
            <h2 className="text-3xl font-normal mb-6 text-foreground">Delete issue</h2>
            <p className="text-lg mb-2 font-medium">Are you sure you want to delete?</p>
            <p className="text-base text-muted-foreground mb-10">

              {issue.subject || `Issue ${issue.id}`}
            </p>
            <div className="flex items-center gap-6">
              <button
                className="text-[#008484] hover:underline font-medium px-4"
                onClick={() => setShowDeleteModal(false)}
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
    </>
  );
}