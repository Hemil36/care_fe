import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link } from "raviger";

import SubHeading from "@/CAREUI/display/SubHeading";

import { EncounterTabProps } from "@/pages/Encounters/EncounterShow";
import { DummyCarePlanGet } from "@/types/emr/careplan/careplanApi";

export const EncounterCarePlanTab = (props: EncounterTabProps) => {
  const { patient, encounter, facilityId } = props;
  const { data: carePlans } = useQuery({
    queryKey: ["patient", patient.id, "care-plans"],
    queryFn: DummyCarePlanGet,
  });
  return (
    <div className="flex flex-col">
      <SubHeading title="Care Plan" />
      <div className="grid grid-cols-3 gap-4">
        {carePlans?.results.map((careplan, i) => (
          <Link
            href={`/facility/${facilityId}/encounter/${encounter.id}/care-plan/${careplan.id}`}
            key={i}
            className="bg-white border rounded-lg p-4 hover:text-inherit hover:border-primary-500"
          >
            <span className="font-bold">{careplan.title}</span>
            <div className="text-sm text-gray-500">
              {dayjs(careplan.end_date).isBefore(dayjs()) ? (
                "Completed"
              ) : dayjs(careplan.start_date).isAfter(dayjs()) ? (
                <span className="text-blue-500">Upcoming</span>
              ) : (
                <div className="text-red-500 flex items-center gap-1">
                  <div className="bg-red-500 w-2 aspect-square rounded-full inline-block" />
                  Active
                </div>
              )}
            </div>
            <div className="mt-4 text-sm">{careplan.description}</div>
            <div className="text-xs text-gray-500 mt-4">
              {dayjs(careplan.start_date).isAfter(dayjs())
                ? "Starts on"
                : "Started On"}{" "}
              : {dayjs(careplan.start_date).format("DD/MM/YYYY hh:mm a")}
              <br />
              {dayjs(careplan.end_date).isAfter(dayjs())
                ? "Ends on"
                : "Ended On"}{" "}
              : {dayjs(careplan.end_date).format("DD/MM/YYYY hh:mm a")}
            </div>
            <div className="mt-4">
              <span className="text-sm font-semibold">3/4 Goals Complete</span>
              <div className="bg-gray-200 rounded-full h-1 overflow-hidden mt-2">
                <div className="bg-primary-500 rounded-full w-3/4 h-full" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
