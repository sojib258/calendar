import { Footer, Navbar } from "@/components";
import { Container } from "@mui/material";
import React, { FC } from "react";

type PageLayoutTypes = {
  children: React.ReactNode;
};
const PageLayout: FC<PageLayoutTypes> = ({ children }) => {
  return (
    <Container sx={{ backgroundColor: "#EEF2F6" }}>
      <Navbar />
      {children}
      <Footer />
    </Container>
  );
};

export default PageLayout;
