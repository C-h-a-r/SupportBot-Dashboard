import type { ConfigSchema } from "@/lib/config-schemas";

export const transcriptTemplateSchema: ConfigSchema = [
  {
    title: "Colors",
    description: "Theme colors used across the transcript page.",
    fields: [
      { path: "Theme.Background", label: "Page background", type: "color" },
      { path: "Theme.Panel", label: "Panel background", type: "color" },
      { path: "Theme.PanelSecondary", label: "Secondary panel", type: "color" },
      { path: "Theme.Border", label: "Borders", type: "color" },
      { path: "Theme.Text", label: "Main text", type: "color" },
      { path: "Theme.Muted", label: "Muted text", type: "color" },
      { path: "Theme.Accent", label: "Accent", type: "color" },
      { path: "Theme.Link", label: "Links", type: "color" },
      { path: "Theme.AttachmentLink", label: "Attachment links", type: "color" },
      { path: "Theme.CodeBackground", label: "Code blocks", type: "color" },
    ],
  },
  {
    title: "Typography",
    fields: [
      {
        path: "Typography.FontFamily",
        label: "Font family",
        type: "googleFont",
        description: "Google Fonts are loaded automatically in saved transcripts.",
      },
    ],
  },
  {
    title: "Header",
    fields: [
      { path: "Header.Title", label: "Title", type: "text" },
      {
        path: "Header.Subtitle",
        label: "Subtitle",
        type: "textarea",
        description:
          "Placeholders: {{ticketName}} {{ticketId}} {{messageCount}} {{reason}}. Use **text** for bold.",
      },
      { path: "Header.Badge", label: "Badge label", type: "text" },
      {
        path: "Header.ShowMetaCards",
        label: "Show info cards",
        type: "boolean",
      },
    ],
  },
  {
    title: "Info card labels",
    fields: [
      { path: "Meta.ChannelLabel", label: "Channel label", type: "text" },
      { path: "Meta.TicketIdLabel", label: "Ticket ID label", type: "text" },
      {
        path: "Meta.MessageCountLabel",
        label: "Message count label",
        type: "text",
      },
      {
        path: "Meta.CloseReasonLabel",
        label: "Close reason label",
        type: "text",
      },
      {
        path: "Meta.DefaultCloseReason",
        label: "Default close reason",
        type: "text",
      },
    ],
  },
  {
    title: "Messages section",
    fields: [
      {
        path: "Messages.SectionTitle",
        label: "Section heading",
        type: "text",
      },
      {
        path: "Messages.EmptyState",
        label: "Empty state text",
        type: "text",
      },
    ],
  },
  {
    title: "Advanced CSS",
    description: "Optional extra CSS appended to the transcript stylesheet.",
    fields: [
      {
        path: "Advanced.CustomCss",
        label: "Custom CSS",
        type: "textarea",
        description: "Example: .badge { font-size: 1rem; }",
      },
    ],
  },
];
