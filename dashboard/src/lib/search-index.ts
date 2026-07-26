import type { IconSvgElement } from "@hugeicons/react";
import {
  AiBrain01Icon,
  CommandIcon,
  ComputerTerminal01Icon,
  DashboardSquare02Icon,
  File02Icon,
  Message01Icon,
  Settings02Icon,
  Ticket01Icon,
} from "@hugeicons/core-free-icons";
import {
  configSchemas,
  type ConfigFileName,
  type ConfigSchema,
} from "@/lib/config-schemas";
import { plugins } from "@/lib/plugins";

export type SearchCategory = "page" | "module" | "setting" | "command";

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  category: SearchCategory;
  icon?: IconSvgElement;
  keywords: string[];
}

const FILE_LABELS: Record<ConfigFileName, string> = {
  supportbot: "Bot config",
  "ticket-panel": "Ticket panel",
  commands: "Commands",
  messages: "Messages",
  "supportbot-ai": "AI assistant",
};

const COMMAND_ENTRIES: {
  key: string;
  label: string;
  description: string;
}[] = [
  { key: "Help", label: "Help", description: "List all slash commands" },
  { key: "Info", label: "Info", description: "Server information" },
  { key: "TicketPanel", label: "Ticket panel", description: "Create ticket panel" },
  { key: "OpenTicket", label: "Open ticket", description: "Open a support ticket" },
  { key: "CloseTicket", label: "Close ticket", description: "Close a ticket" },
  { key: "TicketManage", label: "Manage ticket", description: "Manage an existing ticket" },
  { key: "Suggestion", label: "Suggestion", description: "Submit a suggestion" },
  { key: "Embed", label: "Embed", description: "Send an embed message" },
  { key: "Translate", label: "Translate", description: "Translate text" },
  { key: "Ping", label: "Ping", description: "Check bot latency" },
  { key: "AI", label: "AI", description: "AI assistant command" },
  { key: "Settings", label: "Settings command", description: "Bot settings via Discord" },
  { key: "Mod", label: "Moderation", description: "Moderation tools" },
];

function walkSchema(
  file: ConfigFileName,
  schema: ConfigSchema,
  items: SearchItem[],
) {
  const fileLabel = FILE_LABELS[file];
  for (const section of schema) {
    for (const field of section.fields) {
      items.push({
        id: `setting:${file}:${field.path}`,
        title: field.label,
        subtitle: `${fileLabel} · ${section.title}`,
        href: `/configs?file=${file}`,
        category: "setting",
        icon: iconForFile(file),
        keywords: [
          field.path,
          field.label,
          section.title,
          fileLabel,
          file,
          field.description ?? "",
          field.type,
        ].map((s) => s.toLowerCase()),
      });
    }
  }
}

function iconForFile(file: ConfigFileName): IconSvgElement {
  switch (file) {
    case "supportbot":
      return Settings02Icon;
    case "ticket-panel":
      return Ticket01Icon;
    case "messages":
      return Message01Icon;
    case "supportbot-ai":
      return AiBrain01Icon;
    case "commands":
      return CommandIcon;
    default:
      return Settings02Icon;
  }
}

function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [
    {
      id: "page:dashboard",
      title: "Dashboard",
      subtitle: "Overview and module status",
      href: "/",
      category: "page",
      icon: DashboardSquare02Icon,
      keywords: ["home", "overview", "stats"],
    },
    {
      id: "page:logs",
      title: "Logs",
      subtitle: "Live bot console output",
      href: "/logs",
      category: "page",
      icon: ComputerTerminal01Icon,
      keywords: ["console", "output", "errors", "warn"],
    },
    {
      id: "page:settings",
      title: "Settings",
      subtitle: "Updates and maintenance",
      href: "/settings",
      category: "page",
      icon: Settings02Icon,
      keywords: ["update", "version", "software"],
    },
    {
      id: "page:transcripts",
      title: "Transcripts",
      subtitle: "Closed ticket transcripts",
      href: "/transcripts",
      category: "page",
      icon: File02Icon,
      keywords: ["tickets", "archive", "html"],
    },
  ];

  for (const plugin of plugins) {
    items.push({
      id: `module:${plugin.id}`,
      title: plugin.title,
      subtitle: plugin.description,
      href: plugin.href,
      category: "module",
      icon: plugin.icon,
      keywords: [
        plugin.id,
        plugin.title,
        plugin.description,
        plugin.category,
      ].map((s) => s.toLowerCase()),
    });
  }

  for (const [file, schema] of Object.entries(configSchemas)) {
    if (schema === "commands") continue;
    walkSchema(file as ConfigFileName, schema, items);
  }

  for (const cmd of COMMAND_ENTRIES) {
    items.push({
      id: `command:${cmd.key}`,
      title: cmd.label,
      subtitle: `Command · ${cmd.description}`,
      href: "/configs?file=commands",
      category: "command",
      icon: CommandIcon,
      keywords: [
        cmd.key,
        cmd.label,
        cmd.description,
        "slash",
        "commands",
      ].map((s) => s.toLowerCase()),
    });
  }

  items.push({
    id: "setting:commands:all",
    title: "Slash commands",
    subtitle: "Commands · Enable and configure all commands",
    href: "/configs?file=commands",
    category: "setting",
    icon: CommandIcon,
    keywords: ["commands", "slash", "enable", "permissions"],
  });

  return items;
}

export const SEARCH_INDEX = buildSearchIndex();

const CATEGORY_LABEL: Record<SearchCategory, string> = {
  page: "Pages",
  module: "Modules",
  setting: "Settings",
  command: "Commands",
};

export function searchDashboard(query: string, limit = 12): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored = SEARCH_INDEX.map((item) => {
    let score = 0;
    const title = item.title.toLowerCase();
    const subtitle = (item.subtitle ?? "").toLowerCase();

    if (title === q) score += 100;
    else if (title.startsWith(q)) score += 40;
    else if (title.includes(q)) score += 20;

    if (subtitle.includes(q)) score += 10;

    for (const kw of item.keywords) {
      if (kw === q) score += 15;
      else if (kw.startsWith(q)) score += 8;
      else if (kw.includes(q)) score += 4;
    }

    return { item, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((r) => r.item);
}

export function groupSearchResults(items: SearchItem[]) {
  const groups: { category: SearchCategory; label: string; items: SearchItem[] }[] =
    [];
  const order: SearchCategory[] = ["page", "module", "setting", "command"];

  for (const cat of order) {
    const inCat = items.filter((i) => i.category === cat);
    if (inCat.length) {
      groups.push({
        category: cat,
        label: CATEGORY_LABEL[cat],
        items: inCat,
      });
    }
  }

  return groups;
}
