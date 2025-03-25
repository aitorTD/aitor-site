export interface Theme {
  primary: string;
  primaryLight: string;
  primaryMedium: string;
  primaryDark: string;
  starColor: string;
}

export const themes: Record<string, Theme> = {
  mint: {
    primary: "#00796B",
    primaryLight: "rgba(0, 121, 107, 0.5)",
    primaryMedium: "rgba(0, 121, 107, 0.8)",
    primaryDark: "rgba(0, 121, 107, 0.95)",
    starColor: "0x00796B",
  },
  teal: {
    primary: "#1976D2",
    primaryLight: "rgba(25, 118, 210, 0.5)",
    primaryMedium: "rgba(25, 118, 210, 0.8)",
    primaryDark: "rgba(25, 118, 210, 0.95)",
    starColor: "0x1976D2",
  },
  orange: {
    primary: "#455A64",
    primaryLight: "rgba(69, 90, 100, 0.5)",
    primaryMedium: "rgba(69, 90, 100, 0.8)",
    primaryDark: "rgba(69, 90, 100, 0.95)",
    starColor: "0x455A64",
  },
  indigo: {
    primary: "#7B1FA2",
    primaryLight: "rgba(123, 31, 162, 0.5)",
    primaryMedium: "rgba(123, 31, 162, 0.8)",
    primaryDark: "rgba(123, 31, 162, 0.95)",
    starColor: "0x7B1FA2",
  },
};

export function applyTheme(themeName: string): void {
  const theme = themes[themeName];
  if (!theme) return;

  const root = document.documentElement;

  // Batch DOM operations to reduce reflows
  requestAnimationFrame(() => {
    // Update CSS variables
    root.style.setProperty("--color-primary", theme.primary);
    root.style.setProperty("--color-primary-light", theme.primaryLight);
    root.style.setProperty("--color-primary-medium", theme.primaryMedium);
    root.style.setProperty("--color-primary-dark", theme.primaryDark);

    // Update active state on buttons
    document.querySelectorAll(".color-option").forEach((option) => {
      option.classList.toggle(
        "active",
        option.getAttribute("data-theme") === themeName
      );
    });

    // Dispatch custom event for the star color change
    const event = new CustomEvent("themeChanged", {
      detail: { starColor: theme.starColor },
    });
    document.dispatchEvent(event);
  });

  // Save theme preference
  localStorage.setItem("preferred-theme", themeName);
}
