import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import PageTitle from "@/components/Common/PageTitle";

import {
  dummyCarePlanGoalRetrieve,
  dummyCarePlanGoalUpdateList,
  dummyCarePlanRetrieve,
} from "@/types/emr/careplan/careplanApi";

export default function CarePlanGoalPage(props: {
  facilityId: string;
  encounterId: string;
  careplanId: string;
  goalId: string;
}) {
  const goalQuery = useQuery({
    queryKey: ["care-plan", props.careplanId, "goal", props.goalId],
    queryFn: () => dummyCarePlanGoalRetrieve(props.goalId),
  });

  const planQuery = useQuery({
    queryKey: ["care-plan", props.careplanId],
    queryFn: () => dummyCarePlanRetrieve(props.careplanId),
  });

  const goalUpdatesQuery = useQuery({
    queryKey: ["care-plan", props.careplanId, "goal", props.goalId, "updates"],
    queryFn: () => dummyCarePlanGoalUpdateList(props.goalId),
  });
  const { t } = useTranslation();

  interface ChartData {
    timestamp: string;
    time: number;
    [key: string]: string | number;
  }

  const data: ChartData[] =
    goalUpdatesQuery.data?.results.map((update) => ({
      timestamp: update.created_date,
      time: new Date(update.created_date).getTime(),
      ...update.values.reduce(
        (acc, v) => {
          acc[v.measure.display] = v.detail_quantity.value;
          return acc;
        },
        {} as Record<string, string | number>,
      ),
    })) || [];

  return (
    <div>
      <PageTitle
        title={goalQuery.data?.description || t("care_plan_goal")}
        breadcrumbs={true}
        backUrl={`/facility/${props.facilityId}/encounter/${props.encounterId}/care-plan/${props.careplanId}`}
      />

      <div>Under {planQuery.data?.title || t("care_plan")}</div>
      <br />
      <div>
        Last Recorded Value:{" "}
        <b>
          {goalQuery.data?.last_goal_update?.values.map(
            (v) => v.detail_quantity.value + " " + v.detail_quantity.unit,
          )}
        </b>
      </div>
      <div>
        Goal Value:{" "}
        <b>
          {goalQuery.data?.target?.map(
            (v) => v.detail_quantity.value + " " + v.detail_quantity.unit,
          )}
        </b>
      </div>
      <br />
      <div>
        Status:
        <b>{goalQuery.data?.achievement_status}</b>
      </div>
      <h2 className="text-xl font-bold mt-10 mb-2">Graphs</h2>
      {goalQuery.data?.target?.map((t) => (
        <div className="h-[300px]" key={t.measure.code}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                scale="time"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
                }}
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => {
                  if (typeof value === "number") {
                    const date = new Date(value);
                    return dayjs(date).format("DD/MM/YYYY hh:mm a");
                  }
                  return value;
                }}
              />
              <Legend />

              <Line
                key={t.measure.code}
                type="monotone"
                dataKey={t.measure.display}
                stroke={"black"}
                dot={true}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
      <br />
      <h2 className="text-xl font-bold mt-10 mb-2">All Updates</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            {goalQuery.data?.target?.map((t) => (
              <TableHead key={t.measure.code}>{t.measure.display}</TableHead>
            ))}
            <TableHead>Taken By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goalUpdatesQuery.data?.results.map((goalUpdate, i) => (
            <TableRow key={i}>
              <TableCell>
                {dayjs(goalUpdate.created_date).format("DD/MM/YYYY hh:mm a")}
              </TableCell>
              {goalQuery.data?.target?.map((t) => (
                <TableCell key={t.measure.code}>
                  {
                    goalUpdate.values.find(
                      (v) => v.measure.code === t.measure.code,
                    )?.detail_quantity.value
                  }
                </TableCell>
              ))}
              <TableCell>
                {goalUpdate.created_by.first_name}{" "}
                {goalUpdate.created_by.last_name}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
