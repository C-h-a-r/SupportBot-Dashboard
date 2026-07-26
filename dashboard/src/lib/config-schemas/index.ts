import type { ConfigSchema } from "./types";
import { messagesSchema } from "./messages";
import { supportbotSchema } from "./supportbot";
import { supportbotAiSchema } from "./supportbot-ai";
import { ticketPanelSchema } from "./ticket-panel";

export type ConfigFileName =
  | "supportbot"
  | "ticket-panel"
  | "commands"
  | "messages"
  | "supportbot-ai";

export const configSchemas: Record<ConfigFileName, ConfigSchema | "commands"> = {
  supportbot: supportbotSchema,
  "ticket-panel": ticketPanelSchema,
  commands: "commands",
  messages: messagesSchema,
  "supportbot-ai": supportbotAiSchema,
};

export function getSchema(file: string): ConfigSchema | "commands" | null {
  if (file in configSchemas) {
    return configSchemas[file as ConfigFileName];
  }
  return null;
}

export * from "./types";
