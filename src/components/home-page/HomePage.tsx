"use client";

// Import necessary modules and components
import {
  DateRow,
  Loading,
  MonthRow,
  PageLayout,
  RoomCalendar as RoomRateAvailabilityCalendar,
  Title,
} from "@/components";
import { useRoomRateAvailabilityCalendar } from "@/hooks";
import { countDaysByMonth } from "@/utils";
import { Box, Card, Grid2 as Grid } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { DateRange } from "@mui/x-date-pickers-pro";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { SingleInputDateRangeField } from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import dayjs from "dayjs";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  FixedSizeGrid,
  GridChildComponentProps,
  GridOnScrollProps,
  ListChildComponentProps,
  VariableSizeGrid,
  VariableSizeList,
} from "react-window";
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
  const MonthRowComponent = (props: ListChildComponentProps) => (
    <MonthRow {...props} calenderMonths={calenderMonths} />
  );

  // Component to render each date row in the calendar
  const DateRowComponent = (props: GridChildComponentProps) => (
    <DateRow {...props} calenderDates={calenderDates} />
  );

  if (room_calendar?.isLoading) {
    return <Loading />;
  }

  console.log("RoomCalendar", room_calendar);

  return (
    <PageLayout>
      <Box>
        <Card elevation={1} sx={{ padding: 4, mt: 4 }}>
          <Grid container columnSpacing={2}>
            <Grid size={12}>
              <Title color="black">Rate Calendars</Title>
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
                    {MonthRowComponent}
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
                    {DateRowComponent}
                  </FixedSizeGrid>
                )}
              </AutoSizer>
            </Grid>
          </Grid>

          {room_calendar?.isSuccess
            ? room_calendar?.data?.data?.room_categories?.map(
                (room_category, key) => (
                  <RoomRateAvailabilityCalendar
                    key={key}
                    index={key}
                    InventoryRefs={InventoryRefs}
                    isLastElement={
                      key ===
                      room_calendar?.data?.data?.room_categories?.length - 1
                    }
                    room_category={room_category}
                    handleCalenderScroll={handleCalenderScroll}
                  />
                )
              )
            : null}
        </Card>
      </Box>
    </PageLayout>
  );
}
