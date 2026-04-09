export type TextWidgetFontVariant = "body" | "display";

export type ThemeConfig = {
  schoolName: string;
  pageTitle: string;
  metaDescription: string;
  logos: {
    light: string;
    dark: string;
    aspectRatio: number;
  };
  textWidget: {
    defaultFont: TextWidgetFontVariant;
    fontLabels: Record<TextWidgetFontVariant, string>;
  };
  features: {
    trelson: boolean;
  };
};
