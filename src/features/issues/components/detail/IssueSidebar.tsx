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
  useRemoveIssueWatcher,
  useAssignIssue,
  useUnassignIssue,
  useSetIssueDueDate,
  useRemoveIssueDueDate
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

  // Estats de modals base
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [watcherToDelete, setWatcherToDelete] = useState<UserMini | null>(null);

  // Estats per al Modal Completa de Watchers
  const [isWatcherModalOpen, setIsWatcherModalOpen] = useState(false);
  const [watcherSearch, setWatcherSearch] = useState("");
  const [tempSelectedWatcherIds, setTempSelectedWatcherIds] = useState<string[]>([]);
  const [isSavingWatchers, setIsSavingWatchers] = useState(false);
  // Modal assignee
  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [tempAssigneeId, setTempAssigneeId] = useState<string | null>(null);
  const [isSavingAssignee, setIsSavingAssignee] = useState(false);
  const [showUnassignModal, setShowUnassignModal] = useState(false);


  // Estats per al Due Date
  const [isDueDateModalOpen, setIsDueDateModalOpen] = useState(false);
  const [showDeleteDueDateModal, setShowDeleteDueDateModal] = useState(false);
  const [dueDateInput, setDueDateInput] = useState("");
  const [dueDateReasonInput, setDueDateReasonInput] = useState("");
  const [isSavingDueDate, setIsSavingDueDate] = useState(false);
  const [isDeletingDueDate, setIsDeletingDueDate] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);

  // Queries i Mutations
  const { mutateAsync: deleteIssueMutation } = useDeleteIssue();
  const { mutateAsync: updateIssue } = useUpdateIssue();
  const { mutateAsync: toggleWatch, isPending: isToggling } = useToggleIssueWatch();
  const { mutateAsync: addWatcher } = useAddIssueWatcher();
  const { mutateAsync: removeWatcher } = useRemoveIssueWatcher();
  const { mutateAsync: assignIssue } = useAssignIssue();
  const { mutateAsync: unassignIssue } = useUnassignIssue();
  const { mutateAsync: setDueDate } = useSetIssueDueDate();
  const { mutateAsync: removeDueDate } = useRemoveIssueDueDate();

  const typeName = getFieldName(issue.type);
  const severityName = getFieldName(issue.severity);
  const priorityName = getFieldName(issue.priority);

  const assignee = issue.assigned_to as UserMini | null | undefined;
  const watchers = (issue.watchers as UserMini[] | undefined) || [];

  const currentDueDate = (issue as Record<string, unknown>).deadline || (issue as Record<string, unknown>).due_date;
  const currentDueDateReason = (issue as Record<string, unknown>).due_date_reason || (issue as Record<string, unknown>).reason;

  const allUsers = (USERS as unknown as UserMini[]) || [];
  const isWatching = watchers.some(w => w.username === currentUser?.username);
  const currentWatcherIds = watchers.map(w => String(w.id));

  // Lògica de colors per a la Due Date
  let clockBg = "#f1f3f5";
  let clockText = "#008484";

  if (currentDueDate) {
    const [year, month, day] = String(currentDueDate).substring(0, 10).split('-');
    const dueDateObj = new Date(Number(year), Number(month) - 1, Number(day));
    dueDateObj.setHours(0, 0, 0, 0);

    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    const diffDays = Math.round((dueDateObj.getTime() - todayObj.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      clockBg = "#e03a3e"; // Vermell (avui o passat)
      clockText = "#ffffff";
    } else if (diffDays <= 14) {
      clockBg = "#f39c12"; // Taronja (fins a 2 setmanes)
      clockText = "#ffffff";
    } else {
      clockBg = "#2ecc71"; // Verd (més de 2 setmanes)
      clockText = "#ffffff";
    }
  }

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

  const handleSaveWatchers = async () => {
    setIsSavingWatchers(true);
    try {
      const idsToAddStr = tempSelectedWatcherIds.filter(id => !currentWatcherIds.includes(id));
      const idsToRemoveStr = currentWatcherIds.filter(id => !tempSelectedWatcherIds.includes(id));

      const addPromises = idsToAddStr.map(userIdStr => addWatcher({ id: issue.id as number, userId: Number(userIdStr) }));
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
  
  const handleAssignToMe = async () => {
    if (!currentUser) return;
    try {
      await assignIssue({ id: issue.id as number, userId: Number(currentUser.id) });
    } catch (e) {
      console.error("Error assigning to me", e);
    }
  };

  const handleUnassign = async () => {
    try {
      await unassignIssue(issue.id as number);
      setShowUnassignModal(false);
    } catch (e) {
      console.error("Error unassigning", e);
    }
  };

  const handleOpenAssigneeModal = () => {
    setTempAssigneeId(assignee ? String(assignee.id) : null);
    setAssigneeSearch("");
    setIsAssigneeModalOpen(true);
  };

  const handleSaveAssignee = async () => {
    setIsSavingAssignee(true);
    try {
      if (tempAssigneeId === null) {
        await unassignIssue(issue.id as number);
      } else {
        await assignIssue({ id: issue.id as number, userId: Number(tempAssigneeId) });
      }
      setIsAssigneeModalOpen(false);
    } catch (e) {
      console.error("Error saving assignee", e);
    } finally {
      setIsSavingAssignee(false);
    }
  };

  const filteredAssigneeUsers = allUsers.filter((u) =>
    u.username.toLowerCase().includes(assigneeSearch.toLowerCase()),
  );

  // Filtrem els usuaris del cercador dins del modal
  const filteredUsers = allUsers.filter(u =>
    u.username.toLowerCase().includes(watcherSearch.toLowerCase())
  );

  // Funcions de Due Date
  const handleOpenDueDateModal = () => {
    setDueDateInput(currentDueDate ? String(currentDueDate).substring(0, 10) : "");
    setDueDateReasonInput(currentDueDateReason ? String(currentDueDateReason) : "");
    setIsDueDateModalOpen(true);
  };

  const setDateOffset = (days: number, months: number = 0) => {
    const d = new Date();
    if (days) d.setDate(d.getDate() + days);
    if (months) d.setMonth(d.getMonth() + months);
    setDueDateInput(d.toISOString().split('T')[0]);
  };

  const handleSaveDueDate = async () => {
    if (!dueDateInput) return;
    setIsSavingDueDate(true);
    try {
      await setDueDate({
        id: issue.id as number,
        data: { deadline: dueDateInput, due_date_reason: dueDateReasonInput }
      });
      setIsDueDateModalOpen(false);
    } catch (error) {
      console.error("Error saving due date:", error);
    } finally {
      setIsSavingDueDate(false);
    }
  };

  const handleDeleteDueDate = async () => {
    setIsDeletingDueDate(true);
    try {
      await removeDueDate(issue.id as number);
      setShowDeleteDueDateModal(false);
      setIsDueDateModalOpen(false);
    } catch (error) {
      console.error("Error deleting due date:", error);
    } finally {
      setIsDeletingDueDate(false);
    }
  };

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

          {assignee && (
            <div className="flex flex-col mt-1 mb-2">
              <div className="group flex items-center justify-between hover:bg-muted/30 p-1.5 -mx-1.5 rounded transition-colors">
                <div className="flex items-center gap-2">
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={assignee.avatar ?? undefined} />
                    <AvatarFallback className="text-[10px] bg-muted">
                      {initials(assignee.username)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-[#008484] hover:underline cursor-pointer truncate">
                    {assignee.username}
                  </span>
                </div>
                <button
                  onClick={() => setShowUnassignModal(true)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 transition-opacity shrink-0"
                  title="Remove assignee"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleOpenAssigneeModal}
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              {assignee ? (
                <>
                  <span className="text-base leading-none">⇄</span> Change assigned
                </>
              ) : (
                <>+ Add assigned</>
              )}
            </button>

            {assignee?.username !== currentUser?.username && (
              <button
                onClick={handleAssignToMe}
                className="text-sm font-medium flex items-center gap-1 px-2 py-1 rounded transition-colors shrink-0 text-muted-foreground hover:text-foreground"
              >
                Assign to me
              </button>
            )}
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
                    <span className="text-sm text-[#008484] hover:cursor-pointer truncate">{watcher.username}</span>
                  </div>
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

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleOpenWatcherModal}
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              + Add watchers
            </button>

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

        {/* BOTONS INFERIORS (Due Date i Delete) */}
        <div className="flex items-center gap-2 mt-4 relative z-0">

          <button
            className="flex items-center justify-center h-8 w-8 rounded shrink-0 transition-colors shadow-sm hover:opacity-80"
            style={{ backgroundColor: clockBg, color: clockText }}
            onClick={handleOpenDueDateModal}
            title={currentDueDate ? `Due date: ${String(currentDueDate).substring(0, 10)}` : "Set due date"}
            type="button"
          >
            <span className="sr-only">Due Date</span>
            <Clock className="w-4 h-4" strokeWidth={2.5} />
          </button>

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

      {/* OVERLAY DEL MODAL COMPLETA DE WATCHERS */}
      {isWatcherModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center bg-transparent p-6 max-w-xl w-full text-center">
            <h2 className="text-3xl font-normal mb-8 text-foreground">Add/Remove watchers</h2>
            <input
              type="text"
              placeholder="Search for users"
              value={watcherSearch}
              onChange={(e) => setWatcherSearch(e.target.value)}
              className="w-full border-2 border-[#7de8d4] p-2 focus:outline-none text-base text-foreground bg-transparent mb-6 shadow-inner rounded-sm"
              autoFocus
            />
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
      
      {/* MODAL ASSIGNEE */}
      {isAssigneeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center bg-transparent p-6 max-w-xl w-full text-center">
            <h2 className="text-3xl font-normal mb-8 text-foreground">Assign user</h2>
            <input
              type="text"
              placeholder="Search for users"
              value={assigneeSearch}
              onChange={(e) => setAssigneeSearch(e.target.value)}
              className="w-full border-2 border-[#7de8d4] p-2 focus:outline-none text-base text-foreground bg-transparent mb-6 shadow-inner rounded-sm"
              autoFocus
            />
            <div className="w-full flex flex-col max-h-[50vh] overflow-y-auto pr-2 gap-1 mb-10 text-left border border-border/50 rounded-sm bg-card/50 p-2 shadow-inner">
              <div
                className={`flex items-center justify-between w-full p-2.5 rounded transition-colors cursor-pointer ${
                  tempAssigneeId === null ? "bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => setTempAssigneeId(null)}
              >
                <span className="text-base text-muted-foreground italic">No assignee</span>
                <div
                  className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    tempAssigneeId === null ? "border-primary bg-primary" : "border-border bg-card"
                  }`}
                >
                  {tempAssigneeId === null && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </div>
              </div>
              {filteredAssigneeUsers.length > 0 ? (
                filteredAssigneeUsers.map((user) => {
                  const isSelected = tempAssigneeId === String(user.id);
                  return (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between w-full p-2.5 rounded transition-colors cursor-pointer ${
                        isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setTempAssigneeId(String(user.id))}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 shrink-0 border border-border">
                          <AvatarImage src={user.avatar ?? undefined} />
                          <AvatarFallback className="text-sm bg-muted">{initials(user.username)}</AvatarFallback>
                        </Avatar>
                        <span className="text-base text-foreground font-medium">{user.username}</span>
                      </div>
                      <div
                        className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? "border-primary bg-primary" : "border-border bg-card"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground p-8 text-lg">No users found</div>
              )}
            </div>
            <div className="flex items-center gap-8">
              <button
                className="text-[#008484] hover:underline text-lg font-medium px-4"
                onClick={() => { setIsAssigneeModalOpen(false); setAssigneeSearch(""); }}
                disabled={isSavingAssignee}
              >
                Cancel
              </button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white px-8 py-2 rounded-sm shadow-md text-lg h-auto"
                onClick={handleSaveAssignee}
                disabled={isSavingAssignee}
              >
                <Check className="w-5 h-5 mr-2" />
                {isSavingAssignee ? "SAVING..." : "SAVE"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY DEL MODAL DUE DATE */}
      {isDueDateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center bg-transparent p-8 max-w-3xl w-full text-center relative">
            <button
              onClick={() => setIsDueDateModalOpen(false)}
              className="absolute -top-10 right-0 p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-4xl font-normal mb-8 text-foreground">Set due date</h2>
            <input
              type="date"
              ref={dateInputRef}
              value={dueDateInput}
              onChange={(e) => setDueDateInput(e.target.value)}
              onClick={() => { dateInputRef.current?.showPicker(); }}
              className="w-full border-2 border-[#7de8d4] p-3 focus:outline-none text-base text-foreground bg-transparent mb-4 shadow-inner rounded-sm cursor-pointer"
            />
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6 w-full">
              <button onClick={() => setDateOffset(7)} className="px-3 py-1.5 bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">In one week</button>
              <button onClick={() => setDateOffset(14)} className="px-3 py-1.5 bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">In two weeks</button>
              <button onClick={() => setDateOffset(0, 1)} className="px-3 py-1.5 bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">In one month</button>
              <button onClick={() => setDateOffset(0, 3)} className="px-3 py-1.5 bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">In three months</button>
            </div>
            <div className="w-full text-left text-sm font-semibold text-foreground mb-1">
              Reason for the due date
            </div>
            <textarea
              value={dueDateReasonInput}
              onChange={(e) => setDueDateReasonInput(e.target.value)}
              className="w-full border border-border/70 p-3 min-h-[120px] resize-y text-base focus:outline-none bg-card/50 shadow-inner rounded-sm mb-4"
            />
            <Button
              className="w-full bg-[#7de8d4] hover:bg-[#5bcbb7] text-[#0a1715] font-semibold py-6 rounded-sm shadow-md text-base"
              onClick={handleSaveDueDate}
              disabled={isSavingDueDate || !dueDateInput}
            >
              {isSavingDueDate ? "SAVING..." : "SAVE"}
            </Button>
            {Boolean(currentDueDate) && (
              <div className="w-full flex justify-end mt-4">
                <button
                  onClick={() => setShowDeleteDueDateModal(true)}
                  className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                  title="Remove due date"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL UNASSIGN */}
      {showUnassignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center bg-transparent p-6 max-w-md w-full text-center">
            <h2 className="text-3xl font-normal mb-6 text-foreground">Remove assignee</h2>
            <p className="text-lg mb-2 font-medium">Are you sure you want to remove this assignee?</p>
            <p className="text-base text-muted-foreground mb-10">{assignee?.username}</p>
            <div className="flex items-center gap-6">
              <button
                className="text-[#008484] hover:underline font-medium px-4"
                onClick={() => setShowUnassignModal(false)}
              >
                Cancel
              </button>
              <Button
                variant="destructive"
                className="bg-[#e03a3e] hover:bg-[#c93236] text-white px-6 rounded-sm shadow-md"
                onClick={handleUnassign}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                REMOVE
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY DEL MODAL DELETE DUE DATE */}
      {showDeleteDueDateModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center bg-transparent p-6 max-w-md w-full text-center">
            <h2 className="text-3xl font-normal mb-6 text-foreground">Delete due date</h2>
            <p className="text-lg mb-2 font-medium">Are you sure you want to delete?</p>
            <p className="text-base text-muted-foreground mb-10 italic">
              {currentDueDateReason ? `"${currentDueDateReason}"` : "The due date for this issue"}
            </p>
            <div className="flex items-center gap-6">
              <button
                className="text-[#008484] hover:underline font-medium px-4"
                onClick={() => setShowDeleteDueDateModal(false)}
                disabled={isDeletingDueDate}
              >
                Cancel
              </button>
              <Button
                variant="destructive"
                className="bg-[#e03a3e] hover:bg-[#c93236] text-white px-6 rounded-sm shadow-md"
                onClick={handleDeleteDueDate}
                disabled={isDeletingDueDate}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeletingDueDate ? "DELETING..." : "DELETE"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}