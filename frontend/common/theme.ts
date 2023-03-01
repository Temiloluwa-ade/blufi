export const colors = {
  pink: "#db537d",
  orange: "#ff5858",
  white: "#fff",
  grey: "#FCFCFC",
  darkGrey: "#91959D",
  darkBlue: "#294269",
  mainDark: "#141C2D",
  lightViolet: "#5346a1",
  darkViolet: "#2828fd",
  yellow: "#feff78",
};

export const theme = {
  gutter: {
    xs: "5px",
    sm: "10px",
    md: "15px",
    lg: "20px",
    xl: "25px",
  },
  colors: {
    primary: colors.orange,
    secondary: colors.mainDark,
    ...colors,
  },
  // maybe only for testing
  layout: {
    navbar_height: "60px",
    max_width: "1200px",
    mobile_padding: "2rem",
  },
};
