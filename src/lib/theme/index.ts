/*
 * Active theme selection
 *
 * To switch theme:
 * 1. Change both the CSS import in src/routes/+layout.svelte AND
 *    the config import below to match your chosen theme.
 * 2. Either use one of the existing themes under src/themes/,
 *    or create your own by copying src/themes/default/.
 */

import { config } from "../../themes/default/config";
export {
  BODY_TEXT_FONT_VARIANTS,
  TEXT_WIDGET_BACKGROUND_VARIANTS,
  TEXT_WIDGET_COLOR_VARIANTS,
  TEXT_WIDGET_FONT_VARIANTS,
} from "./types";
export type {
  BodyTextFontVariant,
  ThemeConfig,
  TextWidgetBackgroundVariant,
  TextWidgetColorVariant,
  TextWidgetFontVariant,
} from "./types";

export { config };
