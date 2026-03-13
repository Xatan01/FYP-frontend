import React, { createContext, useContext, useMemo } from "react";
import { buildNavigationTheme, buildPalette } from "../theme/appTheme";

const ThemeContext = createContext({
  themePreference: "dark",
  isLight: false,
  palette: buildPalette(false),
  navigationTheme: buildNavigationTheme("dark"),
  setThemePreference: () => {},
});

export function ThemeProvider({
  children,
  themePreference = "dark",
  setThemePreference = () => {},
}) {
  const isLight = themePreference === "light";
  const palette = useMemo(() => buildPalette(isLight), [isLight]);
  const navigationTheme = useMemo(
    () => buildNavigationTheme(themePreference),
    [themePreference]
  );

  const value = useMemo(
    () => ({
      themePreference,
      isLight,
      palette,
      navigationTheme,
      setThemePreference,
    }),
    [themePreference, isLight, palette, navigationTheme, setThemePreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
