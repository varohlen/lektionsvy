import logoLight from "./logo-light.svg";
import logoDark from "./logo-dark.svg";
import type { ThemeConfig } from "../../lib/theme/types";

export const config = {
  schoolName: "Lektionsvy",
  pageTitle: "Lektionsvy",
  metaDescription: "Lektionsvy är en widgetbaserad classroom screen.",
  logos: {
    light: logoLight,
    dark: logoDark,
    aspectRatio: 1600 / 300,
  },
  textWidget: {
    defaultFont: "body",
    fontLabels: {
      body: "Bas",
      display: "Display",
    },
  },
  features: {
    trelson: true,
  },
} satisfies ThemeConfig;
