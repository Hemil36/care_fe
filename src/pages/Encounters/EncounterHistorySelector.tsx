import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import React from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { CardListSkeleton } from "@/components/Common/SkeletonLoading";

import routes from "@/Utils/request/api";
import query from "@/Utils/request/query";
import { PaginatedResponse } from "@/Utils/request/types";
import { ENCOUNTER_STATUS_COLORS, Encounter } from "@/types/emr/encounter";

interface EncounterCardProps {
  encounter: Encounter;
  isSelected: boolean;
  onSelect: (encounterId: string) => void;
}

function EncounterCard({
  encounter,
  isSelected,
  onSelect,
}: EncounterCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      className={cn(
        "rounded-md relative cursor-pointer transition-colors mb-2 w-80",
        isSelected
          ? "bg-white border-emerald-600"
          : "bg-gray-100 hover:bg-gray-100 shadow-none",
      )}
      onClick={() => onSelect(encounter.id)}
    >
      {isSelected && (
        <div className="absolute right-0 inset-y-5 w-1 bg-emerald-600 rounded-l" />
      )}
      <CardContent className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold">
                {t(`encounter_class__${encounter.encounter_class}`)}
              </div>
              <Badge
                variant={ENCOUNTER_STATUS_COLORS[encounter.status]}
                className="text-xs px-1.5"
              >
                {t(`encounter_status__${encounter.status}`)}
              </Badge>
            </div>
            <div className="text-xs text-gray-500 flex flex-wrap text-end justify-end">
              <span className="whitespace-nowrap">
                {format(new Date(encounter.period.start!), "dd MMM")}
              </span>
              {encounter.period.end && <span>{" - "}</span>}
              {encounter.period.end ? (
                <span>{format(new Date(encounter.period.end), "dd MMM")}</span>
              ) : (
                <span>
                  {" - "}
                  {t("ongoing")}
                </span>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500">{encounter.facility.name}</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface Props {
  patientId: string;
  selectedEncounterId: string;
  onSelectEncounter: (encounterId: string) => void;
}

export default function EncounterHistorySelector({
  patientId,
  selectedEncounterId,
  onSelectEncounter,
}: Props) {
  const { t } = useTranslation();

  const { data: currentEncounters } = useQuery({
    queryKey: ["encounters", "live", patientId],
    queryFn: query(routes.encounter.list, {
      queryParams: { patient: patientId, live: false },
    }),
    select: (data: PaginatedResponse<Encounter>) => data.results,
  });

  const { data: pastEncounters } = useQuery({
    queryKey: ["encounters", "closed", patientId],
    queryFn: query(routes.encounter.list, {
      queryParams: { patient: patientId, live: true },
    }),
    select: (data: PaginatedResponse<Encounter>) => data.results,
  });

  return (
    <div className="space-y-4 pt-2">
      {!currentEncounters ? (
        <CardListSkeleton count={1} />
      ) : currentEncounters.length > 0 ? (
        <div>
          <h2 className="px-4 mb-2 text-xs font-medium text-gray-600 uppercase">
            {t("current_encounter")}
          </h2>
          <div className="space-y-2">
            {currentEncounters.map((encounter) => (
              <EncounterCard
                key={encounter.id}
                encounter={encounter}
                isSelected={encounter.id === selectedEncounterId}
                onSelect={onSelectEncounter}
              />
            ))}
          </div>
        </div>
      ) : null}

      <Separator className="my-4" />

      {!pastEncounters ? (
        <CardListSkeleton count={5} />
      ) : pastEncounters.length > 0 ? (
        <div>
          <h2 className="px-4 mb-2 text-xs font-medium text-gray-600 uppercase">
            {t("past_encounters")}
          </h2>
          <div>
            {pastEncounters.reduce<React.ReactNode[]>(
              (acc, encounter, index) => {
                const currentYear = new Date(
                  encounter.period.start!,
                ).getFullYear();
                const prevYear =
                  index > 0
                    ? new Date(
                        pastEncounters[index - 1].period.start!,
                      ).getFullYear()
                    : null;

                if (currentYear !== prevYear) {
                  acc.push(
                    <div
                      key={`year-${currentYear}`}
                      className="px-4 mb-2 text-sm font-medium text-indigo-700"
                    >
                      {currentYear}
                    </div>,
                  );
                }

                acc.push(
                  <EncounterCard
                    key={encounter.id}
                    encounter={encounter}
                    isSelected={encounter.id === selectedEncounterId}
                    onSelect={onSelectEncounter}
                  />,
                );
                return acc;
              },
              [],
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
