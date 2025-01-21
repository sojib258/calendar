import Fetch from "@/utils/Fetch";
import { useQuery } from "@tanstack/react-query";
import { Dayjs } from "dayjs";

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
}

export default function useRoomRateAvailabilityCalendar(params: IParams) {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/property/${params.property_id}/rate-calendar/assessment`
  );

  url.search = new URLSearchParams({
    start_date: params.start_date,
    end_date: params.end_date,
  }).toString();

  return useQuery({
    queryKey: ["property_room_calendar", params],
    queryFn: async () =>
      await Fetch<Array<IRoomCategoryCalender>>({
        method: "GET",
        url,
      }),
  });
}
