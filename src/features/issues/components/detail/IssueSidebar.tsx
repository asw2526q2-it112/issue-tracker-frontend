"use client";

import { useState, useRef, useEffect } from "react";
import { ColorDot } from "../ColorDot";
import { type components } from "@/lib/api/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ChevronDown, Clock, Trash2, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useDeleteIssue,
  useUpdateIssue,
  useToggleIssueWatch,
  useAddIssueWatcher,
  useRemoveIssueWatcher
} from "@/features/issues/queries";
import { getCurrentUser } from "@/lib/auth/current-user";

// Importem els usuaris del fitxer local
import { USERS } from "@/lib/auth/users";

type IssueDetail = components["schemas"]["IssueDetail"];
type UserMini = components["schemas"]["UserMini"];

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

// --- SUB-COMPONENT: EL DROPDOWN DE L'STATUS ---
function StatusDropdown({
  issueStatus,
  options,
  onSelect,
  canEdit,
  colorMap
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
  const currentColor = colorMap[statusName] || "#6c757d";

  return (
    <div className="relative w-full z-50 mb-2" ref={ref}>
      <div className="flex items-center gap-3">
        <span className="text-foreground text-2xl font-light uppercase tracking-wide">
          {isClosed ? "CLOSED" : "OPEN"}
        </span>
        <button
          onClick={() => canEdit && setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-white text-xs font-semibold uppercase transition-opacity ${canEdit ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
          style={{ backgroundColor: currentColor }}
        >
          {statusName}
          {canEdit && <ChevronDown className="w-3 h-3 opacity-70 ml-1" />}
        </button>
      </div>
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

// --- SUB-COMPONENT: EL DROPDOWN INLINE ---
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
  const router = useRouter();
  const currentUser = getCurrentUser();

  // Estats de modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [watcherToDelete, setWatcherToDelete] = useState<UserMini | null>(null);

  // Estats per al Modal Completa de Watchers
  const [isWatcherModalOpen, setIsWatcherModalOpen] = useState(false);
  const [watcherSearch, setWatcherSearch] = useState("");
  // CORRECCIÓ: Guardem els IDs temporals com a strings
  const [tempSelectedWatcherIds, setTempSelectedWatcherIds] = useState<string[]>([]);
  const [isSavingWatchers, setIsSavingWatchers] = useState(false);

  // Queries i Mutations
  const { mutateAsync: deleteIssueMutation } = useDeleteIssue();
  const { mutateAsync: updateIssue } = useUpdateIssue();
  const { mutateAsync: toggleWatch, isPending: isToggling } = useToggleIssueWatch();
  const { mutateAsync: addWatcher } = useAddIssueWatcher();
  const { mutateAsync: removeWatcher } = useRemoveIssueWatcher();

  const typeName = getFieldName(issue.type);
  const severityName = getFieldName(issue.severity);
  const priorityName = getFieldName(issue.priority);

  const assignee = issue.assigned_to as UserMini | null | undefined;
  const watchers = (issue.watchers as UserMini[] | undefined) || [];

  // Carreguem els usuaris del fitxer local (amb doble cast pel readonly)
  const allUsers = (USERS as unknown as UserMini[]) || [];

  const isWatching = watchers.some(w => w.username === currentUser?.username);

  // CORRECCIÓ: Convertim els IDs actuals a string per a una comparació segura
  const currentWatcherIds = watchers.map(w => String(w.id));

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

  // Funcions de Watchers
  const handleToggleWatch = async () => {
    try {
      await toggleWatch(issue.id as number);
    } catch (e) {
      console.error("Error toggling watch", e);
    }
  };

  // Funció per guardar la selecció múltiple del modal
  const handleSaveWatchers = async () => {
    setIsSavingWatchers(true);
    try {
      // Calculem diferències comparant strings
      const idsToAddStr = tempSelectedWatcherIds.filter(id => !currentWatcherIds.includes(id));
      const idsToRemoveStr = currentWatcherIds.filter(id => !tempSelectedWatcherIds.includes(id));

      // Executem mutacions convertint els strings a números (el que espera l'API)
      const addPromises = idsToAddStr.map(userIdStr => addWatcher({ id: issue.id as number, userId: Number(userIdStr) }));
      // Nota: removeWatcher necessita el ID del pivot si fem servir la de Taiga, però basat en
      // handleRemoveSpecificWatcher, la teva API accepta el User ID directament.
      const removePromises = idsToRemoveStr.map(userIdStr => removeWatcher({ id: issue.id as number, userId: Number(userIdStr) }));

      await Promise.all([...addPromises, ...removePromises]);

      setIsWatcherModalOpen(false);
      setWatcherSearch("");
    } catch (error) {
      console.error("Error saving watchers:", error);
    } finally {
      setIsSavingWatchers(false);
    }
  };

  const handleOpenWatcherModal = () => {

    setTempSelectedWatcherIds(currentWatcherIds);
    setIsWatcherModalOpen(true);
  };


  const handleToggleUserSelection = (userId: unknown) => {
    const userIdStr = String(userId);
    setTempSelectedWatcherIds(prev =>
      prev.includes(userIdStr)
        ? prev.filter(id => id !== userIdStr)
        : [...prev, userIdStr]
    );
  };

  const handleRemoveSpecificWatcher = async () => {
    if (!watcherToDelete) return;
    try {
      await removeWatcher({ id: issue.id as number, userId: watcherToDelete.id as number });
      setWatcherToDelete(null);
    } catch (e) {
      console.error("Error removing watcher", e);
    }
  };

  // Filtrem els usuaris del cercador dins del modal
  const filteredUsers = allUsers.filter(u =>
    u.username.toLowerCase().includes(watcherSearch.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col gap-8">

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
            <InlineDropdown currentName={typeName} currentColor={colorMap[typeName]} options={options.type} onSelect={(id) => handleUpdateField("type", id)} canEdit={canEdit} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">severity</span>
            <InlineDropdown currentName={severityName} currentColor={colorMap[severityName]} options={options.severity} onSelect={(id) => handleUpdateField("severity", id)} canEdit={canEdit} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">priority</span>
            <InlineDropdown currentName={priorityName} currentColor={colorMap[priorityName]} options={options.priority} onSelect={(id) => handleUpdateField("priority", id)} canEdit={canEdit} />
          </div>
        </div>

        <hr className="border-border" />

        {/* ASSIGNED */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">Assigned</span>
          <div className="flex items-center justify-between">
            {assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarImage src={assignee.avatar ?? undefined} />
                  <AvatarFallback className="text-[10px] bg-muted">{initials(assignee.username)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{assignee.username}</span>
              </div>
            ) : (
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
                + Add assigned
              </button>
            )}
            <button className="text-sm text-primary hover:underline">Assign to me</button>
          </div>
        </div>

        <hr className="border-border" />

        {/* WATCHERS */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">Watchers</span>

          {watchers.length > 0 && (
            <div className="flex flex-col mt-1 mb-2">
              {watchers.map(watcher => (
                <div key={watcher.id} className="group flex items-center justify-between hover:bg-muted/30 p-1.5 -mx-1.5 rounded transition-colors">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-8 shrink-0">
                      <AvatarImage src={watcher.avatar ?? undefined} />
                      <AvatarFallback className="text-[10px] bg-muted">
                        {initials(watcher.username)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-[#008484] hover:underline cursor-pointer truncate">{watcher.username}</span>
                  </div>
                  {/* Creueta per eliminar */}
                  <button
                    onClick={() => setWatcherToDelete(watcher)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 transition-opacity shrink-0"
                    title="Remove watcher"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Botons a sota del tot */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleOpenWatcherModal}
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              + Add watchers
            </button>

            {/* Toggle Watch/Unwatch Button */}
            <button
              onClick={handleToggleWatch}
              disabled={isToggling}
              className={`text-sm font-medium flex items-center gap-1 px-2 py-1 rounded transition-colors shrink-0 ${isWatching
                ? "text-muted-foreground hover:bg-muted/50"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {isWatching ? (
                <><EyeOff className="w-4 h-4" /> Unwatch</>
              ) : (
                <><Eye className="w-4 h-4" /> Watch</>
              )}
            </button>
          </div>
        </div>

        <hr className="border-border" />

        <div className="flex items-center gap-2 mt-4 relative z-0">
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

      {/* OVERLAY DEL MODAL DELETE ISSUE */}
      {showDeleteModal && canEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm">
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

      {/* OVERLAY DEL MODAL DELETE WATCHER */}
      {watcherToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center bg-transparent p-6 max-w-md w-full text-center">
            <h2 className="text-3xl font-normal mb-6 text-foreground">Remove watcher</h2>
            <p className="text-lg mb-2 font-medium">Are you sure you want to remove this watcher?</p>
            <p className="text-base text-muted-foreground mb-10">
              {watcherToDelete.username}
            </p>
            <div className="flex items-center gap-6">
              <button
                className="text-[#008484] hover:underline font-medium px-4"
                onClick={() => setWatcherToDelete(null)}
              >
                Cancel
              </button>
              <Button
                variant="destructive"
                className="bg-[#e03a3e] hover:bg-[#c93236] text-white px-6 rounded-sm shadow-md"
                onClick={handleRemoveSpecificWatcher}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                REMOVE
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY DEL MODAL COMPLETA DE WATCHERS (Selecció Múltiple) */}
      {isWatcherModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center bg-transparent p-6 max-w-xl w-full text-center">
            <h2 className="text-3xl font-normal mb-8 text-foreground">Add/Remove watchers</h2>

            {/* Cercador */}
            <input
              type="text"
              placeholder="Search for users"
              value={watcherSearch}
              onChange={(e) => setWatcherSearch(e.target.value)}
              className="w-full border-2 border-[#7de8d4] p-2 focus:outline-none text-base text-foreground bg-transparent mb-6 shadow-inner rounded-sm"
              autoFocus
            />

            {/* Llista d'usuaris amb Checkbox */}
            <div className="w-full flex flex-col max-h-[50vh] overflow-y-auto pr-2 gap-1 mb-10 text-left border border-border/50 rounded-sm bg-card/50 p-2 shadow-inner">
              {filteredUsers.length > 0 ? filteredUsers.map(user => {
                const isSelected = tempSelectedWatcherIds.includes(String(user.id));
                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between w-full p-2.5 rounded transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 shrink-0 border border-border">
                        <AvatarImage src={user.avatar ?? undefined} />
                        <AvatarFallback className="text-sm bg-muted">{initials(user.username)}</AvatarFallback>
                      </Avatar>
                      <span className="text-base text-foreground font-medium">{user.username}</span>
                    </div>
                    {/* Custom Checkbox */}
                    <button
                      onClick={() => handleToggleUserSelection(user.id)}
                      className={`size-6 rounded border-2 flex items-center justify-center transition-colors shadow-md ${isSelected ? 'border-primary bg-primary text-white' : 'border-border bg-card'}`}
                      title={isSelected ? "Deselect" : "Select"}
                    >
                      {isSelected && <Check className="w-4 h-4" strokeWidth={3} />}
                    </button>
                  </div>
                );
              }) : (
                <div className="text-center text-muted-foreground p-8 text-lg">No users found</div>
              )}
            </div>

            {/* Accions (SAVE / Cancel) */}
            <div className="flex items-center gap-8">
              <button
                className="text-[#008484] hover:underline text-lg font-medium px-4"
                onClick={() => { setIsWatcherModalOpen(false); setWatcherSearch(""); }}
                disabled={isSavingWatchers}
              >
                Cancel
              </button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white px-8 py-2 rounded-sm shadow-md text-lg h-auto"
                onClick={handleSaveWatchers}
                disabled={isSavingWatchers}
              >
                <Check className="w-5 h-5 mr-2" />
                {isSavingWatchers ? "SAVING..." : "SAVE"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}