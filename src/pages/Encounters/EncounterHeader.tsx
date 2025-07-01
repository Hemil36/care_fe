import { ExternalLink } from "lucide-react";
import { Link } from "raviger";
import { useTranslation } from "react-i18next";

import { Card } from "@/components/ui/card";

import { Avatar } from "@/components/Common/Avatar";

import { formatDateTime, formatPatientAge } from "@/Utils/utils";
import { Encounter } from "@/types/emr/encounter";

interface Props {
  encounter: Encounter;
}

export function EncounterHeader({ encounter }: Props) {
  const { t } = useTranslation();
  const { patient, facility } = encounter;

  return (
    <Card className="p-4">
      <div className="flex gap-8 items-end">
        <div className="flex gap-3 items-center">
          <div className="size-12">
            <Avatar name={patient.name} />
          </div>
          <Link
            href={`/facility/${facility.id}/patient/${patient.id}`}
            className="flex flex-col"
          >
            <div className="flex gap-2 items-center">
              <h5 className="text-lg font-semibold">{patient.name}</h5>
              <ExternalLink className="size-4" />
            </div>
            <span className="text-gray-700">
              {formatPatientAge(patient, true)},{" "}
              {t(`GENDER__${patient.gender}`)}
            </span>
          </Link>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-600">{t("start_date")}: </span>
          <span className="text-sm font-semibold">
            {formatDateTime(encounter.period.start)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-600">{t("end_date")}: </span>
          <span className="text-sm font-semibold">
            {encounter.period.end
              ? formatDateTime(encounter.period.end)
              : `-- (${t("ongoing")})`}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-600">
            {t("hospital_identifier")}:{" "}
          </span>
          {/* TODO: implement this once we have it */}
          <span className="text-sm font-semibold">--</span>
        </div>
      </div>
    </Card>
  );
}
