import type { ConfigSchema } from "./types";

const providers = [
  { value: "openai", label: "OpenAI" },
  { value: "groq", label: "Groq" },
  { value: "claude", label: "Claude" },
];

const messageTypes = [
  { value: "text", label: "Plain text" },
  { value: "embed", label: "Embed" },
  { value: "components_v2", label: "Components v2" },
];

const memoryScopes = [
  { value: "channel", label: "Per channel" },
  { value: "guild", label: "Per server" },
];

export const supportbotAiSchema: ConfigSchema = [
  {
    title: "General",
    fields: [
      { path: "Enabled", label: "AI enabled", type: "boolean" },
      {
        path: "General.Provider",
        label: "Provider",
        type: "select",
        options: providers,
      },
      { path: "General.Model", label: "Model", type: "text" },
      {
        path: "General.Model_API_Key",
        label: "API key",
        type: "secret",
        placeholder: "MODEL_API_KEY",
      },
      { path: "General.Tokens", label: "Max tokens", type: "number" },
      {
        path: "General.Temperature",
        label: "Temperature",
        type: "number",
      },
      { path: "General.Name", label: "Display name", type: "text" },
      {
        path: "General.PastebinAPI_Key",
        label: "Pastebin API key",
        type: "secret",
        placeholder: "PASTEBIN_API_KEY",
      },
      {
        path: "General.PastebinAPI_URL",
        label: "Pastebin API URL",
        type: "text",
      },
    ],
  },
  {
    title: "Style & channel",
    fields: [
      {
        path: "Style.MessageType",
        label: "Message type",
        type: "select",
        options: messageTypes,
      },
      {
        path: "Features.SuggestTickets",
        label: "Suggest tickets",
        type: "boolean",
      },
      {
        path: "Channels.AIChannel",
        label: "AI channel ID",
        type: "discordId",
      },
      { path: "Embed.Color", label: "Embed colour", type: "color" },
      { path: "Embed.Footer", label: "Embed footer", type: "text" },
    ],
  },
  {
    title: "Memory",
    fields: [
      { path: "Memory.Enabled", label: "Memory enabled", type: "boolean" },
      { path: "Memory.StoreFacts", label: "Store facts", type: "boolean" },
      {
        path: "Memory.StoreSummaries",
        label: "Store summaries",
        type: "boolean",
      },
      {
        path: "Memory.MaxRecentMessages",
        label: "Max recent messages",
        type: "number",
      },
      {
        path: "Memory.Scope",
        label: "Memory scope",
        type: "select",
        options: memoryScopes,
      },
    ],
  },
  {
    title: "Custom instructions",
    fields: [
      {
        path: "CustomInstructions",
        label: "Instruction lines",
        type: "stringList",
        description: "One instruction per line sent to the AI.",
      },
    ],
  },
  {
    title: "Messages",
    fields: [
      {
        path: "Messages.ErrorResponse",
        label: "Error response",
        type: "text",
      },
      { path: "Messages.AIError", label: "AI error", type: "text" },
      { path: "Messages.AIDisabled", label: "AI disabled", type: "text" },
      {
        path: "Messages.MessageTooLong",
        label: "Message too long",
        type: "text",
      },
      {
        path: "Messages.SuggestTicketText",
        label: "Suggest ticket text",
        type: "text",
      },
      {
        path: "Messages.SuggestTicketReaction",
        label: "Suggest ticket emoji",
        type: "emoji",
      },
    ],
  },
];
