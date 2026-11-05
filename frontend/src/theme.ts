import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    accent: Palette["primary"];
  }

  interface PaletteOptions {
    accent?: PaletteOptions["primary"];
  }
}

const theme = createTheme({
  cssVariables: true,
  palette: {
    common: {
      black: "#000000",
      white: "#FFFFFF",
    },
    primary: {
      main: "#001F54",
      light: "#193B70",
      dark: "#00152F",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#2563EB",
      light: "#93C5FD",
      dark: "#1D4ED8",
    },
    accent: {
      main: "#6D5CE8",
      light: "#EFEDFF",
      dark: "#6558E8",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#0369A1",
      light: "#E0F2FE",
    },
    success: {
      main: "#15803D",
      light: "#DCFCE7",
    },
    warning: {
      main: "#C2410C",
      light: "#FFEDD5",
    },
    error: {
      main: "#BE185D",
      light: "#FCE7F3",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#182230",
      secondary: "#64748B",
    },
    divider: "#E2E8F0",
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: "Arial, sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
});

export default theme;