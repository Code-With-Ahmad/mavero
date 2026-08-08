// Validated categorical/status chart palette — see the dataviz skill.
// Mavero's own brand hues are too desaturated to pass the chroma floor for
// chart marks (by design — a muted boutique palette), so chart series use
// this separately-validated set while chrome (grid/axis/text) follows the
// app's ivory/charcoal theme via `useTheme()`.
export const CATEGORICAL = {
  light: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"],
  dark: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"],
};

export const SEQUENTIAL_HUE = {
  light: "#2a78d6",
  dark: "#3987e5",
};

export function getChartChrome(theme) {
  return theme === "dark"
    ? {
        grid: "#2c2c2a",
        axis: "#383835",
        textPrimary: "#ffffff",
        textSecondary: "#c3c2b7",
        muted: "#898781",
        tooltipBg: "#171a20",
        tooltipBorder: "#454e5c",
      }
    : {
        grid: "#e1e0d9",
        axis: "#c3c2b7",
        textPrimary: "#0b0b0b",
        textSecondary: "#52514e",
        muted: "#898781",
        tooltipBg: "#ffffff",
        tooltipBorder: "#e9dfc9",
      };
}
