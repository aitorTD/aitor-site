export interface Theme {
  primary: string;
  primaryLight: string;
  primaryMedium: string;
  primaryDark: string;
  starColor: string;
}

export const themes: Record<string, Theme> = {
  mint: {
    primary: "#37bd75",
    primaryLight: "rgba(55, 189, 117, 0.5)",
    primaryMedium: "rgba(55, 189, 117, 0.8)",
    primaryDark: "rgba(55, 189, 117, 0.95)",
    starColor: "0x37bd75",
  },
  teal: {
    primary: "#2599b3",
    primaryLight: "rgba(37, 153, 179, 0.5)",
    primaryMedium: "rgba(37, 153, 179, 0.8)",
    primaryDark: "rgba(37, 153, 179, 0.95)",
    starColor: "0x2599b3",
  },
  orange: {
    primary: "#d3965b",
    primaryLight: "rgba(211, 150, 91, 0.5)",
    primaryMedium: "rgba(211, 150, 91, 0.8)",
    primaryDark: "rgba(211, 150, 91, 0.95)",
    starColor: "0xd3965b",
  },
  indigo: {
    primary: "#694673",
    primaryLight: "rgba(105, 70, 115, 0.5)",
    primaryMedium: "rgba(105, 70, 115, 0.8)",
    primaryDark: "rgba(105, 70, 115, 0.95)",
    starColor: "0x694673",
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
