import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import PageTitle from "@/components/Common/PageTitle";

import { DummyCarePlanRetrieve } from "@/types/emr/careplan/careplanApi";

export default function CarePlan(props: {
  facilityId: string;
  encounterId: string;
  careplanId: string;
}) {
  const { t } = useTranslation();

  const planQuery = useQuery({
    queryKey: ["care-plan", props.careplanId],
    queryFn: () => DummyCarePlanRetrieve(props.careplanId),
  });

  const careplan = planQuery.data;

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 md:justify-between">
      <div>
        <PageTitle
          title={planQuery.data?.title || t("care_plan")}
          breadcrumbs={true}
          backUrl={`/facility/${props.facilityId}/encounter/${props.encounterId}/care-plan`}
        />
        <div className="text-lg text-gray-500">
          {dayjs(careplan?.end_date).isBefore(dayjs()) ? (
            "Completed"
          ) : dayjs(careplan?.start_date).isAfter(dayjs()) ? (
            <span className="text-blue-500">Upcoming</span>
          ) : (
            <div className="text-red-500 flex items-center gap-1">
              <div className="bg-red-500 w-2 aspect-square rounded-full inline-block" />
              Active
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500 mt-4">
          {dayjs(careplan?.start_date).isAfter(dayjs())
            ? "Starts on"
            : "Started On"}{" "}
          : {dayjs(careplan?.start_date).format("DD/MM/YYYY hh:mm a")}
          <br />
          {dayjs(careplan?.end_date).isAfter(dayjs())
            ? "Ends on"
            : "Ended On"}{" "}
          : {dayjs(careplan?.end_date).format("DD/MM/YYYY hh:mm a")}
        </div>
        <div className="mt-4">{careplan?.description}</div>
        <div className="mt-8">
          <b className="text-lg">Addresses</b>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            {careplan?.addresses.map((code, i) => (
              <TableRow key={i}>
                <TableCell>{code.code}</TableCell>
                <TableCell>{code.display}</TableCell>
              </TableRow>
            ))}
          </Table>
        </div>
        <div className="mt-8">
          <b className="text-lg">Goals</b>
        </div>
      </div>
      <div className="md:w-[200px] w-full flex flex-col gap-2">
        <Button className="w-full" variant={"primary"}>
          Update
        </Button>
        <Button className="w-full" variant={"primary"}>
          Prescribe Medication
        </Button>
        <Button className="w-full" variant={"primary"}>
          Order Lab Test
        </Button>
        <Button className="w-full" variant={"primary"}>
          Record Task
        </Button>
        <Button className="w-full" variant={"primary"}>
          Print Plan
        </Button>
      </div>
    </div>
  );
}
