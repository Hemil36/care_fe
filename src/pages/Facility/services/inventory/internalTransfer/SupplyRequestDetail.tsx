import { useQuery } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import { MoreVertical } from "lucide-react";
import { useQueryParams } from "raviger";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import BackButton from "@/components/Common/BackButton";
import Page from "@/components/Common/Page";
import { TableSkeleton } from "@/components/Common/SkeletonLoading";

import query from "@/Utils/request/query";
import {
  SupplyDeliveryRead,
  getSupplyDeliveryStatusBadgeColor,
} from "@/types/inventory/supplyDelivery/supplyDelivery";
import supplyDeliveryApi from "@/types/inventory/supplyDelivery/supplyDeliveryApi";
import { getSupplyRequestPriorityBadgeColor } from "@/types/inventory/supplyRequest/supplyRequest";
import supplyRequestApi from "@/types/inventory/supplyRequest/supplyRequestApi";

interface Props {
  facilityId: string;
  locationId: string;
  id: string;
}

export default function SupplyRequestDetail({
  facilityId,
  locationId,
  id,
}: Props) {
  const { t } = useTranslation();
  const [qParams] = useQueryParams();

  const { data: supplyRequest, isLoading } = useQuery({
    queryKey: ["supplyRequest", id],
    queryFn: query(supplyRequestApi.retrieveSupplyRequest, {
      pathParams: { supplyRequestId: id },
    }),
    enabled: !!id,
  });

  const { data: deliveriesResponse, isLoading: deliveriesLoading } = useQuery({
    queryKey: ["deliveries", id],
    queryFn: query(supplyDeliveryApi.listSupplyDelivery, {
      queryParams: { supply_request: id },
    }),
    enabled: !!id,
  });

  const deliveries = deliveriesResponse?.results || [];

  if (isLoading || !supplyRequest) {
    return (
      <Page title={t("loading")} hideTitleOnPage>
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">{t("loading")}</div>
          </div>
        </div>
      </Page>
    );
  }

  const backUrl = `/facility/${facilityId}/locations/${locationId}/internal_transfers/to_receive?${new URLSearchParams(
    qParams as Record<string, string>,
  ).toString()}`;

  return (
    <div className="max-w-5xl container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <BackButton to={backUrl} />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-gray-400 shadow-sm"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>{t("pause_request")}</DropdownMenuItem>
            <DropdownMenuItem>{t("cancel_request")}</DropdownMenuItem>
            <DropdownMenuItem>{t("mark_as_error")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <h5 className="text-lg font-bold text-gray-950">
          {t("request") + " " + t("raised")}
        </h5>
        <p className="text-gray-600">
          {t("request_raised_by")} {supplyRequest.deliver_from?.name}
          {". "}
          {`${deliveries.length} ${t("deliveries") + " " + t("have") + " " + t("been") + " " + t("received")}`}
        </p>
      </div>

      <Card className="rounded-none shadow-sm rounded-md mt-4">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">{t("item")}</p>
              <p className="font-semibold text-lg">
                {supplyRequest.item?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {t("requested") + " " + t("quantity")}
              </p>
              <p className="font-semibold text-lg">
                {supplyRequest.quantity}{" "}
                {supplyRequest.item?.definitional?.dosage_form?.display}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("deliver_from")}</p>
              <p className="font-semibold text-lg">
                {supplyRequest.deliver_from?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("priority")}</p>
              <Badge
                variant="outline"
                className={getSupplyRequestPriorityBadgeColor(
                  supplyRequest.priority,
                )}
              >
                {t(supplyRequest.priority)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mx-4 bg-gray-100 rounded-md p-3 mt-2 text-gray-950 border border-gray-200">
        <h2 className="text-base font-semibold mb-1">
          {t("deliveries")} ({deliveries.length})
        </h2>
        {deliveriesLoading ? (
          <TableSkeleton count={5} />
        ) : (
          <div className="overflow-hidden rounded-md border-2 border-white shadow-md">
            <Table className="rounded-md">
              <TableHeader className="bg-gray-100 text-gray-700 text-sm">
                <TableRow className="divide-x">
                  <TableHead className="text-gray-700">
                    {t("item_received")}
                  </TableHead>
                  <TableHead className="text-gray-700">
                    {t("quantity") + " " + t("received")}
                  </TableHead>
                  <TableHead className="text-gray-700">{t("lot")}</TableHead>
                  <TableHead className="text-gray-700">{t("expiry")}</TableHead>
                  <TableHead className="text-gray-700">
                    {t("condition")}
                  </TableHead>
                  <TableHead className="text-gray-700">
                    {t("delivered_by")}
                  </TableHead>
                  <TableHead className="text-gray-700">{t("status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white text-base">
                {deliveries.map((delivery: SupplyDeliveryRead) => (
                  <TableRow
                    key={delivery.id}
                    className="hover:bg-gray-50 divide-x"
                  >
                    <TableCell className="font-semibold text-gray-950">
                      {delivery.supplied_item?.product_knowledge.name ||
                        delivery.supplied_inventory_item?.product
                          ?.product_knowledge.name}
                    </TableCell>
                    <TableCell className="font-medium text-gray-950">
                      {delivery.supplied_item_quantity}{" "}
                      {delivery.supplied_item?.product_knowledge.definitional
                        ?.dosage_form?.display ||
                        delivery.supplied_inventory_item?.product
                          ?.product_knowledge.definitional?.dosage_form
                          ?.display}
                    </TableCell>
                    <TableCell className="font-medium text-gray-950">
                      {delivery.supplied_inventory_item?.product?.batch
                        ?.lot_number || "-"}
                    </TableCell>
                    <TableCell className="font-medium text-gray-950">
                      {delivery.supplied_inventory_item?.product
                        ?.expiration_date
                        ? formatDate(
                            new Date(
                              delivery.supplied_inventory_item.product.expiration_date,
                            ),
                            "dd/MM/yyyy",
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {delivery.supplied_item_condition && (
                        <Badge
                          variant={
                            delivery.supplied_item_condition === "damaged"
                              ? "destructive"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {t(delivery.supplied_item_condition)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-gray-950">
                      {delivery.origin?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getSupplyDeliveryStatusBadgeColor(
                          delivery.status,
                        )}
                      >
                        {t(delivery.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
