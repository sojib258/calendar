"use client";
import { GridChildComponentProps, areEqual } from "react-window";

import { useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import { Dayjs } from "dayjs";
import { memo } from "react";

type DateRowProps = GridChildComponentProps & {
  calenderDates: Dayjs[];
};

const DateRow: React.FC<DateRowProps> = memo(function DateRowFC({
  columnIndex,
  calenderDates,
  style,
}) {
  const theme = useTheme();
  return (
    <Box style={style}>
      <Box
        sx={{
          pr: 1,
          fontSize: "12px",
          textAlign: "right",
          fontWeight: "bold",
          borderLeft: "1px solid",
          borderBottom: "1px solid",
          borderColor: theme.palette.divider,
        }}
      >
        <Box>{calenderDates[columnIndex].format("ddd")}</Box>
        <Box>{calenderDates[columnIndex].format("DD")}</Box>
      </Box>
    </Box>
  );
},
areEqual);

export default DateRow;
