/* eslint-disable @typescript-eslint/no-explicit-any */
// CalendarSection.tsx
import { LoadingSpinner } from "@/components/loading";
import { IRoomCategoryCalender } from "@/hooks"; // Assuming this is where your interfaces are
import { Box } from "@mui/material";
import { memo, RefObject, useMemo } from "react";
import { VariableSizeGrid } from "react-window";
import RoomRateAvailabilityCalendar from "../given/RoomCalendar";

// Props for the individual calendar item
interface CalendarItemProps {
  room_category: IRoomCategoryCalender;
  index: number;
  InventoryRefs: RefObject<Array<RefObject<VariableSizeGrid | null>>>;
  isLastElement: boolean;
  handleCalenderScroll: () => void;
}

// Props for the main calendar section
interface CalendarSectionProps {
  room_calendar: any;
  InventoryRefs: RefObject<Array<RefObject<VariableSizeGrid | null>>>;
  handleCalenderScroll: any;
  observerRef: any;
}

// Separate calendar item component
const CalendarItem = memo(
  ({
    room_category,
    index,
    InventoryRefs,
    isLastElement,
    handleCalenderScroll,
  }: CalendarItemProps) => (
    <RoomRateAvailabilityCalendar
      key={room_category.id}
      index={index}
      InventoryRefs={InventoryRefs}
      isLastElement={isLastElement}
      room_category={room_category}
      handleCalenderScroll={handleCalenderScroll}
    />
  )
);

// Main calendar section component
const CalendarSection = memo(
  ({
    room_calendar,
    InventoryRefs,
    handleCalenderScroll,
    observerRef,
  }: CalendarSectionProps) => {
    const shouldShowCalendar =
      room_calendar.isSuccess && room_calendar.data?.pages?.length > 0;
    const isLoading =
      room_calendar.isLoading || room_calendar.isFetchingNextPage;

    const calendarContent = useMemo(() => {
      if (!shouldShowCalendar) return null;

      return room_calendar.data.pages.map((page: any, pageIndex: number) => {
        const isLastPage = pageIndex === room_calendar.data.pages.length - 1;

        return (
          <Box key={pageIndex}>
            {page.room_categories.map((room_category: any, index: number) => (
              <CalendarItem
                key={room_category.id}
                room_category={room_category}
                index={index}
                InventoryRefs={InventoryRefs}
                isLastElement={isLastPage}
                handleCalenderScroll={handleCalenderScroll}
              />
            ))}
          </Box>
        );
      });
    }, [
      room_calendar.data?.pages,
      InventoryRefs,
      handleCalenderScroll,
      shouldShowCalendar,
    ]);

    return (
      <>
        {shouldShowCalendar && (
          <>
            {calendarContent}
            <Box ref={observerRef} />
          </>
        )}
        {isLoading && <LoadingSpinner />}
      </>
    );
  }
);
// Add display names for better debugging
CalendarItem.displayName = "CalendarItem";
CalendarSection.displayName = "CalendarSection";

export default CalendarSection;
