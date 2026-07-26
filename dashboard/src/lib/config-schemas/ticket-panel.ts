import type { ConfigSchema } from "./types";

const buttonStyles = [
  { value: "1", label: "Blurple" },
  { value: "2", label: "Grey" },
  { value: "3", label: "Green" },
  { value: "4", label: "Red" },
];

const layouts = [
  { value: "1", label: "Style 1" },
  { value: "2", label: "Style 2" },
  { value: "3", label: "Style 3" },
  { value: "4", label: "Style 4 (classic embed)" },
];

export const ticketPanelSchema: ConfigSchema = [
  {
    title: "Panel",
    fields: [{ path: "Panel", label: "Panel enabled", type: "boolean" }],
  },
  {
    title: "Embed style",
    fields: [
      { path: "Style.Title", label: "Title", type: "text" },
      { path: "Style.Description", label: "Description", type: "textarea" },
      { path: "Style.Image", label: "Image URL", type: "text" },
      { path: "Style.Color", label: "Embed colour", type: "color" },
      {
        path: "Style.Layout",
        label: "Layout",
        type: "select",
        options: layouts,
      },
    ],
  },
  {
    title: "Create button",
    fields: [
      { path: "Button.Text", label: "Button text", type: "text" },
      { path: "Button.Emoji", label: "Button emoji", type: "emoji" },
      {
        path: "Button.Color",
        label: "Button style",
        type: "select",
        options: buttonStyles,
      },
      { path: "Button.CustomId", label: "Custom ID", type: "text" },
    ],
  },
  {
    title: "Department menu",
    fields: [
      { path: "DepartmentMenu.CustomId", label: "Custom ID", type: "text" },
      { path: "DepartmentMenu.Placeholder", label: "Placeholder", type: "text" },
      {
        path: "DepartmentMenu.DefaultDescription",
        label: "Default description",
        type: "text",
      },
      {
        path: "DepartmentMenu.DefaultEmoji",
        label: "Default emoji",
        type: "emoji",
      },
    ],
  },
  {
    title: "Panel settings",
    fields: [
      { path: "Settings.Image", label: "Show image", type: "boolean" },
      { path: "Settings.TopTitle", label: "Top title", type: "boolean" },
      { path: "Settings.TopDivider", label: "Top divider", type: "boolean" },
      {
        path: "Settings.BottomTitle",
        label: "Bottom title",
        type: "boolean",
      },
      {
        path: "Settings.BottomDivider",
        label: "Bottom divider",
        type: "boolean",
      },
    ],
  },
  {
    title: "Messages",
    description: "Bot messages when using the ticket panel command.",
    fields: [
      {
        path: "Messages.NotConfigured",
        label: "Not configured",
        type: "textarea",
      },
      {
        path: "Messages.InvalidChannel",
        label: "Invalid channel",
        type: "textarea",
      },
      { path: "Messages.PanelSent", label: "Panel sent", type: "text" },
      {
        path: "Messages.PanelSentWithDepartments",
        label: "Panel sent (departments)",
        type: "text",
      },
      { path: "Messages.SendError", label: "Send error", type: "text" },
    ],
  },
];
