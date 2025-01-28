"use client";
import { useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import { memo } from "react";
import { ListChildComponentProps, areEqual } from "react-window";

type MonthRowProps = Omit<ListChildComponentProps, "data"> & {
  calenderMonths: Array<[string, number]>;
};

const MonthRow: React.FC<MonthRowProps> = memo(function MonthRowFC({
  index,
  style,
  calenderMonths,
}) {
  const theme = useTheme();
  const month = calenderMonths[index][0];

  return (
    <Box style={style}>
      <Box
        sx={{
          px: 1,
          fontSize: "12px",
          fontWeight: "bold",
          borderLeft: "1px solid",
          borderBottom: "1px solid",
          borderColor: theme.palette.divider,
        }}
      >
        <Box
          component="span"
          sx={{
            position: "sticky",
            left: 2,
            zIndex: 1,
          }}
        >
          {month}
        </Box>
      </Box>
    </Box>
  );
},
areEqual);

export default MonthRow;
