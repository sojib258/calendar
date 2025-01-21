"use client";

import { Grid2 as Grid, Typography, Card, Box, Container } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DateRange } from "@mui/x-date-pickers-pro";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { SingleInputDateRangeField } from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import { Controller, useForm } from "react-hook-form";
import {
  RefObject,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  VariableSizeList,
  ListChildComponentProps,
  areEqual,
  FixedSizeGrid,
  GridChildComponentProps,
  VariableSizeGrid,
  GridOnScrollProps,
} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import { countDaysByMonth } from "@/utils";
import RoomRateAvailabilityCalendar from "./(components)/RoomCalendar";
import Navbar from "@/components/Navbar";
import useRoomRateAvailabilityCalendar from "./(hooks)/useRoomRateAvailabilityCalendar";

export type CalendarForm = {
  date_range: DateRange<dayjs.Dayjs>;
};

const StyledVariableSizeList = styled(VariableSizeList)({
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
});

export default function Page() {
  const theme = useTheme();

  const propertyId = 1;

  // a special element that listens to scroll events and dispatches them to actual grid containers
  const rootContainerRef = useRef<HTMLDivElement>(null);

  const calenderMonthsRef = useRef<VariableSizeList | null>(null);

  const calenderDatesRef = useRef<FixedSizeGrid | null>(null);

  // ref to a "canvas" div with size of entire grid. The actual DOM element that we scroll
  const mainGridContainerRef = useRef<HTMLDivElement | null>(null);

  const InventoryRefs = useRef<Array<RefObject<VariableSizeGrid>>>([]);

  const handleDatesScroll = useCallback(({ scrollLeft }: GridOnScrollProps) => {
    InventoryRefs.current.forEach((ref) => {
      if (ref.current) {
        ref.current.scrollTo({ scrollLeft });
      }
    });
    if (calenderMonthsRef.current) {
      calenderMonthsRef.current.scrollTo(scrollLeft);
    }
  }, []);

  const handleCalenderScroll = useCallback(
    ({ scrollLeft }: GridOnScrollProps) => {
      InventoryRefs.current.forEach((ref) => {
        if (ref.current) {
          ref.current.scrollTo({ scrollLeft });
        }
      });
      if (calenderMonthsRef.current) {
        calenderMonthsRef.current.scrollTo(scrollLeft);
      }
      if (calenderDatesRef.current) {
        calenderDatesRef.current.scrollTo({ scrollLeft });
      }
    },
    []
  );

  useEffect(() => {
    const { current: rootContainer } = rootContainerRef;
    if (rootContainer) {
      const handler = (e: WheelEvent) => {
        if (
          mainGridContainerRef.current &&
          InventoryRefs.current &&
          calenderMonthsRef.current &&
          calenderDatesRef.current
        ) {
          // Check if deltaX is non-zero (indicating horizontal scroll)
          if (e.deltaX !== 0) {
            e.preventDefault();
            let { scrollLeft } = mainGridContainerRef.current;
            scrollLeft += e.deltaX;

            InventoryRefs.current.forEach((ref) => {
              if (ref.current) {
                ref.current.scrollTo({ scrollLeft });
              }
            });

            calenderMonthsRef.current.scrollTo(scrollLeft);
            calenderDatesRef.current.scrollTo({ scrollLeft });
          }
        }
      };
      rootContainer.addEventListener("wheel", handler);
      return () => rootContainer.removeEventListener("wheel", handler);
    }
  });

  const [calenderDates, setCalenderDates] = useState<Array<dayjs.Dayjs>>([]);
  const [calenderMonths, setCalenderMonths] = useState<Array<[string, number]>>(
    []
  );

  const { control, watch } = useForm<CalendarForm>({
    defaultValues: {
      date_range: [dayjs(), dayjs().add(2, "month")],
    },
  });
  const watchedDateRange = watch("date_range");

  useEffect(() => {
    const { months, dates } = countDaysByMonth(
      watchedDateRange[0]!,
      watchedDateRange[1]
        ? watchedDateRange[1]
        : watchedDateRange[0]!.add(2, "month")
    );

    setCalenderMonths(months);
    setCalenderDates(dates);
  }, [watchedDateRange]);

  const room_calendar = useRoomRateAvailabilityCalendar({
    property_id: propertyId,
    start_date: watchedDateRange[0]!.format("YYYY-MM-DD"),
    end_date: (watchedDateRange[1]
      ? watchedDateRange[1]
      : watchedDateRange[0]!.add(2, "month")
    ).format("YYYY-MM-DD"),
  });

  const MonthRow: React.FC<ListChildComponentProps> = memo(function MonthRowFC({
    index,
    style,
  }) {
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

  const DateRow: React.FC<GridChildComponentProps> = memo(function DateRowFC({
    columnIndex,
    style,
  }) {
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

  return (
    <Container sx={{ backgroundColor: "#EEF2F6" }}>
      <Navbar />
      <Box>
        <Card elevation={1} sx={{ padding: 4, mt: 4 }}>
          <Grid container columnSpacing={2}>
            <Grid size={12}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 0,
                }}
              >
                Rate Calendar
              </Typography>
            </Grid>

            <Grid size={4}>
              <Controller
                name="date_range"
                control={control}
                rules={{
                  required: "Please specify a date range.",
                }}
                render={({ field, fieldState: { invalid, error } }) => (
                  <DateRangePicker
                    {...field}
                    autoFocus
                    minDate={dayjs()}
                    maxDate={dayjs().add(2, "year")}
                    slots={{ field: SingleInputDateRangeField }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: invalid,
                        helperText: invalid ? error?.message : null,
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Card>
        <Card elevation={1} sx={{ my: 6, padding: 3 }} ref={rootContainerRef}>
          <Grid container columnSpacing={2}>
            <Grid
              size={{
                xs: 4,
                sm: 4,
                md: 3,
                lg: 2,
                xl: 2,
              }}
            ></Grid>

            <Grid
              size={{
                xs: 8,
                sm: 8,
                md: 9,
                lg: 10,
                xl: 10,
              }}
            >
              <AutoSizer disableHeight>
                {({ width }) => (
                  <StyledVariableSizeList
                    height={19}
                    width={width}
                    itemCount={calenderMonths.length}
                    itemSize={(index: number) => {
                      const no_of_days = calenderMonths[index][1];
                      return no_of_days * 74;
                    }}
                    layout="horizontal"
                    ref={calenderMonthsRef}
                  >
                    {MonthRow}
                  </StyledVariableSizeList>
                )}
              </AutoSizer>
            </Grid>
          </Grid>

          <Grid container sx={{ height: 54 }}>
            <Grid
              sx={{
                borderBottom: "1px solid",
                borderColor: theme.palette.divider,
              }}
              size={{
                xs: 4,
                sm: 4,
                md: 3,
                lg: 2,
                xl: 2,
              }}
            ></Grid>
            <Grid
              size={{
                xs: 8,
                sm: 8,
                md: 9,
                lg: 10,
                xl: 10,
              }}
            >
              <AutoSizer>
                {({ height, width }) => (
                  <FixedSizeGrid
                    height={height}
                    width={width}
                    columnCount={calenderDates.length}
                    columnWidth={74}
                    rowCount={1}
                    rowHeight={37}
                    ref={calenderDatesRef}
                    outerRef={mainGridContainerRef}
                    onScroll={handleDatesScroll}
                  >
                    {DateRow}
                  </FixedSizeGrid>
                )}
              </AutoSizer>
            </Grid>
          </Grid>

          {room_calendar.isSuccess
            ? room_calendar.data.data.map((room_category, key) => (
                <RoomRateAvailabilityCalendar
                  key={key}
                  index={key}
                  InventoryRefs={InventoryRefs}
                  isLastElement={key === room_calendar.data.data.length - 1}
                  room_category={room_category}
                  handleCalenderScroll={handleCalenderScroll}
                />
              ))
            : null}
        </Card>
      </Box>
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
    </Container>
  );
}
