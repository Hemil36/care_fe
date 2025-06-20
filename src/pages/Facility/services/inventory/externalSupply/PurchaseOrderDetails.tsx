import { navigate } from "raviger";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DefinitionList,
  DefinitionListItem,
} from "@/components/ui/definition-list";

import { SupplyRequestRead } from "@/types/inventory/supplyRequest/supplyRequest";

import { PRIORITY_COLORS, STATUS_COLORS } from "./utils";

interface Props {
  request: SupplyRequestRead;
  facilityId: string;
  locationId: string;
  showViewDetails?: boolean;
}

export default function PurchaseOrderDetails({
  request,
  facilityId,
  locationId,
  showViewDetails = false,
}: Props) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("purchase_order_details")}</CardTitle>
        {showViewDetails && (
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                `/facility/${facilityId}/locations/${locationId}/external_supply/purchase_orders/${request.id}`,
              )
            }
          >
            {t("view_details")}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <DefinitionList>
          <DefinitionListItem
            term={t("item")}
            description={request.item.name}
          />
          <DefinitionListItem
            term={t("quantity")}
            description={request.quantity}
          />
          <DefinitionListItem
            term={t("deliver_from")}
            description={request.deliver_from?.name || t("not_specified")}
          />
          <DefinitionListItem
            term={t("deliver_to")}
            description={request.deliver_to.name}
          />
          <DefinitionListItem
            term={t("category")}
            description={t(request.category)}
          />
          <DefinitionListItem
            term={t("intent")}
            description={t(request.intent)}
          />
          <DefinitionListItem
            term={t("reason")}
            description={t(request.reason)}
          />
          <DefinitionListItem
            term={t("status")}
            description={
              <Badge
                className={STATUS_COLORS[request.status]}
                variant="secondary"
              >
                {t(request.status)}
              </Badge>
            }
          />
          <DefinitionListItem
            term={t("priority")}
            description={
              <Badge
                className={PRIORITY_COLORS[request.priority]}
                variant="secondary"
              >
                {t(request.priority)}
              </Badge>
            }
          />
        </DefinitionList>
      </CardContent>
    </Card>
  );
}
