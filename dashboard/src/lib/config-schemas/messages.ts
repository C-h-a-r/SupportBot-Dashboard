import type { ConfigSchema } from "./types";

export const messagesSchema: ConfigSchema = [
  {
    title: "Info command",
    fields: [
      { path: "Info.Title", label: "Title", type: "text" },
      { path: "Info.Description", label: "Description", type: "textarea" },
      { path: "Info.Button", label: "Button label", type: "text" },
      { path: "Info.URL", label: "Button URL", type: "text" },
      { path: "Info.Colour", label: "Colour", type: "color" },
    ],
  },
  {
    title: "Welcome message",
    fields: [
      { path: "Welcome.Enabled", label: "Enabled", type: "boolean" },
      {
        path: "Welcome.LayoutStyle",
        label: "Layout style",
        type: "select",
        options: [
          { value: "modern", label: "Modern (components)" },
          { value: "classic", label: "Classic embed" },
        ],
      },
      { path: "Welcome.Embed.Colour", label: "Embed colour", type: "color" },
      { path: "Welcome.Embed.Title", label: "Embed title", type: "text" },
      { path: "Welcome.Embed.Message", label: "Embed message", type: "textarea" },
    ],
  },
  {
    title: "Leave message",
    fields: [
      { path: "Leave.Enabled", label: "Enabled", type: "boolean" },
      { path: "Leave.Embed.Colour", label: "Embed colour", type: "color" },
      { path: "Leave.Embed.Title", label: "Embed title", type: "text" },
      { path: "Leave.Embed.Message", label: "Embed message", type: "textarea" },
    ],
  },
];
