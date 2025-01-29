import Fetch from "@/utils/Fetch";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Dayjs } from "dayjs";

// Your existing interfaces remain the same
export interface IRoomInventory {
  id: string;
  date: Dayjs;
  available: number;
  status: boolean;
  booked: number;
}

export interface IRoomRatePlans {
  id: number;
  name: string;
}

export interface IRateCalendar {
  id: string;
  date: Dayjs;
  rate: number;
  min_length_of_stay: number;
  reservation_deadline: number;
}

export interface IRatePlanCalendar extends IRoomRatePlans {
  calendar: Array<IRateCalendar>;
}

export interface IRoomCategory {
  id: string;
  name: string;
  occupancy: number;
}

export interface IRoomCategoryCalender extends IRoomCategory {
  inventory_calendar: Array<IRoomInventory>;
  rate_plans: Array<IRatePlanCalendar>;
}

interface IParams {
  property_id: number;
  start_date: string;
  end_date: string;
  pageSize?: number;
}

interface IResponse {
  room_categories: Array<IRoomCategoryCalender>;
  nextCursor?: number;
}

// If your Fetch utility wraps the response in a Result type, define it here

export default function useRoomRateAvailabilityCalendar(params: IParams) {
  return useInfiniteQuery({
    queryKey: ["property_room_calendar", params],

    queryFn: async ({ pageParam = 0 }) => {
      const url = new URL(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/property/${params.property_id}/rate-calendar/assessment`
      );

      url.search = new URLSearchParams({
        start_date: params.start_date,
        end_date: params.end_date,
        cursor: pageParam.toString(),
        pageSize: (params.pageSize || 30).toString(),
      }).toString();

      const result = await Fetch<IResponse>({
        method: "GET",
        url,
      });

      return result.data; // Return the actual response data
    },

    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,

    // Remove hasNextPage as it's not needed in the options
    // TanStack Query determines this automatically based on getNextPageParam

    initialPageParam: 1,
  });
}
