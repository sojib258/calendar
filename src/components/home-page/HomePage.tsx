"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Import necessary modules and components
import { useRoomRateAvailabilityCalendar } from "@/hooks";
import { countDaysByMonth } from "@/utils";
import { Box, Card, CircularProgress, Grid2 as Grid } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { DateRange } from "@mui/x-date-pickers-pro";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { SingleInputDateRangeField } from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import dayjs from "dayjs";
import {
  RefObject,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { useInView } from "react-intersection-observer";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  FixedSizeGrid,
  GridChildComponentProps,
  GridOnScrollProps,
  ListChildComponentProps,
  VariableSizeGrid,
  VariableSizeList,
  areEqual,
} from "react-window";
import { PageLayout } from "../layout";
import { Title } from "./components/custom-made";
import { RoomCalendar as RoomRateAvailabilityCalendar } from "./components/given/index";
import { dateRowCss, loadingCss, monthRowCss, monthRowStickyCss } from "./css";
import { sizes } from "./sizes";

// Define the form type for the date range picker
export type CalendarForm = {
  date_range: DateRange<dayjs.Dayjs>;
};

// Style the VariableSizeList to hide the scrollbar
const StyledVariableSizeList = styled(VariableSizeList)({
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
});

export default function Page() {
  const theme = useTheme(); // Get the theme for styling

  const propertyId = 1; // Example property ID

  // Refs for various elements to handle scrolling
  const rootContainerRef = useRef<HTMLDivElement>(null);
  const calenderMonthsRef = useRef<VariableSizeList | null>(null);
  const calenderDatesRef = useRef<FixedSizeGrid | null>(null);
  const mainGridContainerRef = useRef<HTMLDivElement | null>(null);
  const InventoryRefs = useRef<Array<RefObject<VariableSizeGrid>>>([]);
  const { ref, inView } = useInView();

  // Handle horizontal scroll for dates
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

  // Handle horizontal scroll for the entire calendar
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

  // State for calendar dates and months
  const [calenderDates, setCalenderDates] = useState<Array<dayjs.Dayjs>>([]);
  const [calenderMonths, setCalenderMonths] = useState<Array<[string, number]>>(
    []
  );

  // Form control for date range picker
  const { control, watch } = useForm<CalendarForm>({
    defaultValues: {
      date_range: [dayjs(), dayjs().add(4, "month")],
    },
  });
  const watchedDateRange = watch("date_range");

  // Fetch room rate availability calendar data
  const room_calendar = useRoomRateAvailabilityCalendar({
    property_id: propertyId,
    start_date: watchedDateRange[0]!.format("YYYY-MM-DD"),
    end_date: (watchedDateRange[1]
      ? watchedDateRange[1]
      : watchedDateRange[0]!.add(2, "month")
    ).format("YYYY-MM-DD"),
  });

  // Component to render each month row in the calendar
  const MonthRow: React.FC<ListChildComponentProps> = memo(function MonthRowFC({
    index,
    style,
  }) {
    const month = calenderMonths[index][0];

    return (
      <Box style={style}>
        <Box sx={{ ...monthRowCss, borderColor: theme.palette.divider }}>
          <Box component="span" sx={monthRowStickyCss}>
            {month}
          </Box>
        </Box>
      </Box>
    );
  },
  areEqual);

  // Component to render each date row in the calendar
  const DateRow: React.FC<GridChildComponentProps> = memo(function DateRowFC({
    columnIndex,
    style,
  }) {
    return (
      <Box style={style}>
        <Box sx={{ ...dateRowCss, borderColor: theme.palette.divider }}>
          <Box>{calenderDates[columnIndex].format("ddd")}</Box>
          <Box>{calenderDates[columnIndex].format("DD")}</Box>
        </Box>
      </Box>
    );
  },
  areEqual);

  const fetchNextPage = useCallback(() => {
    if (room_calendar.hasNextPage && !room_calendar.isFetchingNextPage) {
      room_calendar.fetchNextPage();
    }
  }, [room_calendar]);

  // Update calendar dates and months when the date range changes
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

  // Add event listener for wheel scroll to handle horizontal scrolling
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

  useEffect(() => {
    const pages = room_calendar?.data?.pages;

    // Check if any page has an empty room_categories array
    const hasEmptyCategory = pages?.some(
      (page) => page.room_categories.length === 0
    );

    // Fetch next page if in view and no empty categories
    if (inView && !hasEmptyCategory) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, room_calendar]);

  return (
    <PageLayout isLoading={room_calendar.isLoading}>
      <Box>
        <Card elevation={1} sx={{ padding: 4, mt: 4 }}>
          <Grid container columnSpacing={2}>
            <Grid size={12}>
              <Title>Rate Calendar</Title>
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
            <Grid size={sizes?.one}></Grid>

            <Grid size={sizes?.two}>
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

          <Grid container sx={{ height: 48 }}>
            <Grid
              sx={{
                borderBottom: "1px solid",
                borderColor: theme.palette.divider,
              }}
              size={sizes?.one}
            ></Grid>
            <Grid size={sizes?.two}>
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

          {room_calendar?.data?.pages.map((page: any, pageIndex: number) => {
            const isLastElement =
              pageIndex === room_calendar.data.pages.length - 1;

            return (
              <Box key={pageIndex}>
                {page.room_categories.map(
                  (room_category: any, index: number) => (
                    <RoomRateAvailabilityCalendar
                      key={room_category.id}
                      index={index}
                      InventoryRefs={InventoryRefs}
                      isLastElement={isLastElement}
                      room_category={room_category}
                      handleCalenderScroll={handleCalenderScroll}
                    />
                  )
                )}
              </Box>
            );
          })}
          <Box ref={ref} />
          {room_calendar.isLoading ||
            (room_calendar?.isFetching && (
              <Box sx={loadingCss}>
                <CircularProgress />
              </Box>
            ))}
        </Card>
      </Box>
    </PageLayout>
  );
}
