import { Footer, LoadingAnimation, Navbar } from "@/components";
import { Container, ContainerProps } from "@mui/material";
import React, { FC } from "react";

type PageLayoutTypes = ContainerProps & {
  children: React.ReactNode;
  isLoading?: boolean;
};
const PageLayout: FC<PageLayoutTypes> = ({ children, isLoading, ...props }) => {
  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <Container sx={{ backgroundColor: "#EEF2F6" }} {...props}>
      <Navbar />
      {children}
      <Footer />
    </Container>
  );
};

export default PageLayout;
