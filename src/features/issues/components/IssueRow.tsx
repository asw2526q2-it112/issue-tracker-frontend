// src/features/issues/components/IssueRow.tsx
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type components } from "@/lib/api/schema";
import { ColorDot } from "./ColorDot";

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

    // Esto arregla tanto el error de React como el mapeo de colores.
    const typeName = getFieldName(issue.type);
    const severityName = getFieldName(issue.severity);
    const priorityName = getFieldName(issue.priority);
    const statusName = getFieldName(issue.status);

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
                <div className="flex items-baseline gap-2">
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        #{issue.id}
                    </span>
                    <Link
                        href={`/${issue.id}/`}
                        className="truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                    >
                        {issue.subject}
                    </Link>
                </div>
                {/* Tags */}
                {issue.tags && (
                    <div className="mt-0.5 flex flex-wrap gap-1">
                        {String(issue.tags)
                            .split(",")
                            .filter(Boolean)
                            .map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full bg-muted px-2 py-px text-[10px] font-medium text-muted-foreground"
                                >
                                    {tag.trim()}
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
                    <Avatar className="size-8">
                        <AvatarImage src={assignee.avatar ?? undefined} />
                        <AvatarFallback className="text-xs">
                            {initials(assignee.username)}
                        </AvatarFallback>
                    </Avatar>
                ) : (
                    <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        --
                    </div>
                )}
            </div>
        </div>
    );
}