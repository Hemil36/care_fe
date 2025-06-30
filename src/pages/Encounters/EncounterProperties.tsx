import { MapPinIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import CareIcon from "@/CAREUI/icons/CareIcon";

import { Badge } from "@/components/ui/badge";

import {
  ENCOUNTER_CLASS_ICONS,
  ENCOUNTER_STATUS_ICONS,
  Encounter,
} from "@/types/emr/encounter";

interface Props {
  encounter: Encounter;
}

export default function EncounterProperties({ encounter }: Props) {
  const { t } = useTranslation();

  const EncounterClassIcon = ENCOUNTER_CLASS_ICONS[encounter.encounter_class];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium">{t("status")}: </span>
        <div>
          <Badge variant="blue" size="sm">
            <CareIcon
              icon={
                ENCOUNTER_STATUS_ICONS[
                  encounter.status as keyof typeof ENCOUNTER_STATUS_ICONS
                ]
              }
              className="size-4"
            />
            {t(`encounter_status__${encounter.status}`)}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium">{t("encounter_class")}: </span>
        <div>
          <Badge variant="teal" size="sm">
            <EncounterClassIcon className="size-3" />
            {t(`encounter_class__${encounter.encounter_class}`)}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium">{t("priority")}: </span>
        <div>
          <Badge variant="orange" size="sm">
            {t(`encounter_priority__${encounter.priority}`)}
          </Badge>
        </div>
      </div>
      {encounter.current_location && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium">{t("location")}: </span>
          <div>
            <Badge variant="secondary" size="sm">
              <MapPinIcon className="size-3" />
              {encounter.current_location?.name}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
