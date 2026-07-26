export interface TranscriptTemplate {
  Theme: {
    Background: string;
    Panel: string;
    PanelSecondary: string;
    PanelTertiary: string;
    Border: string;
    Text: string;
    Muted: string;
    Accent: string;
    AccentSoft: string;
    AccentBorder: string;
    AccentText: string;
    Link: string;
    AttachmentLink: string;
    CodeBackground: string;
  };
  Typography: {
    FontFamily: string;
  };
  Header: {
    Title: string;
    Subtitle: string;
    Badge: string;
    ShowMetaCards: boolean;
  };
  Meta: {
    ChannelLabel: string;
    TicketIdLabel: string;
    MessageCountLabel: string;
    CloseReasonLabel: string;
    DefaultCloseReason: string;
  };
  Messages: {
    SectionTitle: string;
    EmptyState: string;
  };
  Advanced: {
    CustomCss: string;
  };
}
