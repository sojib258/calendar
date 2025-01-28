import { Typography, TypographyProps } from "@mui/material";
import { FC } from "react";

type TitleProps = TypographyProps & {
  children?: React.ReactNode;
};
const Title: FC<TitleProps> = ({ children, ...props }) => {
  return (
    <Typography
      variant="h5"
      gutterBottom
      sx={{
        fontWeight: 700,
        mb: 0,
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};

export default Title;
