"use client";
import { Box, Typography, useTheme } from "@mui/material";

const Footer = () => {
  const theme = useTheme(); // Get the theme for styling
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        textAlign: "center",
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Grit System. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
