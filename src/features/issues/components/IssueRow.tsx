// src/features/issues/components/IssueRow.tsx
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type components } from "@/lib/api/schema";
import { ColorDot } from "./ColorDot";
import { Clock } from "lucide-react";

type IssueRead = components["schemas"]["IssueRead"];

interface IssueRowProps {
    issue: IssueRead;
    /** mapa nombre → color para pintar los dots */
    colorMap: Record<string, string>;
}

function initials(username: string) {
    return username.slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function getFieldName(field: unknown): string {
    // 1. Si de verdad llega un string, lo devolvemos tal cual.
    if (typeof field === "string") {
        return field;
    }

    // 2. Si es un objeto, comprobamos que no sea nulo y que tenga la propiedad "name".
    if (typeof field === "object" && field !== null && "name" in field) {
        const obj = field as { name?: unknown };
        return typeof obj.name === "string" ? obj.name : "";
    }

    // 3. Si llega cualquier otra cosa (null, undefined, un número...), lo convertimos a texto seguro.
    return String(field ?? "");
}

export function IssueRow({ issue, colorMap }: IssueRowProps) {
    const assignee = issue.assigned_to as
        | components["schemas"]["UserMini"]
        | null
        | undefined;

    const typeName = getFieldName(issue.type);
    const severityName = getFieldName(issue.severity);
    const priorityName = getFieldName(issue.priority);
    const statusName = getFieldName(issue.status);

    // Transformem la resposta de l'API al tipus correcte
    const issueTags = (issue.tags as unknown as { id: number; name: string; color: string }[]) || [];

    // Lògica de color de la Due Date (Idèntica al Header)
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
        <div className="grid grid-cols-[3rem_5rem_5rem_1fr_5rem_5.5rem_5.5rem] items-center justify-items-center gap-x-4 gap-y-0 border-b border-border px-4 py-3 transition-colors last:border-0 hover:bg-muted/40">
            {/* Type dot */}
            <ColorDot color={colorMap[typeName] ?? "#94a3b8"} title={typeName} />

            {/* Severity dot */}
            <ColorDot
                color={colorMap[severityName] ?? "#94a3b8"}
                title={severityName}
            />

            {/* Priority dot */}
            <ColorDot
                color={colorMap[priorityName] ?? "#94a3b8"}
                title={priorityName}
            />

            {/* Issue id + subject */}
            <div className="min-w-0 w-full justify-self-start">
                <div className="flex items-center gap-2">
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        #{issue.id}
                    </span>
                    <Link
                        href={`/${issue.id}/`}
                        className="truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                    >
                        {issue.subject}
                    </Link>
                    {Boolean(currentDueDate) && (
                        <span title={`Due date: ${String(currentDueDate).substring(0, 10)}`} className="flex items-center">
                            <Clock
                                className="w-3.5 h-3.5 shrink-0"
                                color={clockColor}
                                strokeWidth={2.5}
                            />
                        </span>
                    )}
                </div>

                {/* Tags */}
                {issueTags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                        {issueTags.map((tag) => (
                            <span
                                key={tag.id}
                                className="rounded-sm px-2 py-px text-[10px] font-semibold text-white shadow-sm"
                                style={{ backgroundColor: tag.color }}
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Status */}
            <span className="w-fit whitespace-nowrap rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
                {statusName}
            </span>

            {/* Created at */}
            <span className="whitespace-nowrap text-xs text-muted-foreground">
                {formatDate(issue.created_at)}
            </span>

            {/* Assignee */}
            <div>
                {assignee ? (
                    <Link href={`/profile/${assignee.username}`}>
                        <Avatar className="size-8 hover:opacity-80 transition-opacity cursor-pointer">
                            <AvatarImage src={assignee.avatar ?? undefined} />
                            <AvatarFallback className="text-xs">
                                {initials(assignee.username)}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                ) : (
                    <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        --
                    </div>
                )}
            </div>
        </div>
    );
}