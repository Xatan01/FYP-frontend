import { DarkTheme, DefaultTheme } from "@react-navigation/native";

export function buildPalette(isLight) {
  if (isLight) {
    return {
      background: "#f8fafc",
      backgroundAlt: "#eef2ff",
      card: "#ffffff",
      cardSoft: "#f8fafc",
      cardMuted: "#eef2ff",
      cardBorder: "#e2e8f0",
      input: "#ffffff",
      inputBorder: "#cbd5e1",
      textPrimary: "#0f172a",
      textSecondary: "#334155",
      textMuted: "#64748b",
      accent: "#2563eb",
      accentSoft: "#dbeafe",
      accentText: "#ffffff",
      accentSoftText: "#1e3a8a",
      success: "#16a34a",
      successSoft: "#dcfce7",
      successSoftText: "#166534",
      warning: "#d97706",
      warningSoft: "#fef3c7",
      warningSoftText: "#92400e",
      danger: "#dc2626",
      dangerSoft: "#fee2e2",
      dangerSoftText: "#991b1b",
      purpleSoft: "#f3e8ff",
      purpleBorder: "#e9d5ff",
      purpleText: "#6b21a8",
      heroStart: "#dbeafe",
      heroEnd: "#eff6ff",
      overlay: "rgba(15, 23, 42, 0.06)",
      shadow: "#000000",
      tabActive: "#1d4ed8",
      tabInactive: "#64748b",
      white: "#ffffff",
      black: "#000000",
    };
  }

  return {
    background: "#020617",
    backgroundAlt: "#0f172a",
    card: "#0f172a",
    cardSoft: "#111827",
    cardMuted: "#1e293b",
    cardBorder: "#1e293b",
    input: "#111827",
    inputBorder: "#334155",
    textPrimary: "#e2e8f0",
    textSecondary: "#cbd5e1",
    textMuted: "#94a3b8",
    accent: "#2563eb",
    accentSoft: "#1e3a8a",
    accentText: "#dbeafe",
    accentSoftText: "#dbeafe",
    success: "#22c55e",
    successSoft: "#14532d",
    successSoftText: "#dcfce7",
    warning: "#f59e0b",
    warningSoft: "#78350f",
    warningSoftText: "#fef3c7",
    danger: "#fca5a5",
    dangerSoft: "#3f0f1b",
    dangerSoftText: "#fecdd3",
    purpleSoft: "#3b0764",
    purpleBorder: "#6b21a8",
    purpleText: "#e9d5ff",
    heroStart: "#1e3a8a",
    heroEnd: "#0f172a",
    overlay: "rgba(15, 23, 42, 0.32)",
    shadow: "#000000",
    tabActive: "#93c5fd",
    tabInactive: "#64748b",
    white: "#ffffff",
    black: "#000000",
  };
}

export function buildNavigationTheme(themePreference = "dark") {
  const isLight = themePreference === "light";
  const palette = buildPalette(isLight);

  return isLight
    ? {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: palette.background,
          card: palette.card,
          text: palette.textPrimary,
          border: palette.cardBorder,
          primary: palette.accent,
        },
      }
    : {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: palette.background,
          card: palette.card,
          text: palette.textPrimary,
          border: palette.cardBorder,
          primary: palette.accent,
        },
      };
}
