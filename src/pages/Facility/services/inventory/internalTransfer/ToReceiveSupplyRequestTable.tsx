import { useQuery } from "@tanstack/react-query";
import { BarChart3, SlidersHorizontal, X } from "lucide-react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import useFilters from "@/hooks/useFilters";

import query from "@/Utils/request/query";
import { ProductKnowledgeStatus } from "@/types/inventory/productKnowledge/productKnowledge";
import productKnowledgeApi from "@/types/inventory/productKnowledge/productKnowledgeApi";
import {
  SupplyRequestPriority,
  SupplyRequestRead,
  SupplyRequestStatus,
} from "@/types/inventory/supplyRequest/supplyRequest";
import supplyRequestApi from "@/types/inventory/supplyRequest/supplyRequestApi";

interface Props {
  facilityId: string;
  locationId: string;
}

export default function ToReceiveSupplyRequestTable({
  facilityId,
  locationId,
}: Props) {
  const { t } = useTranslation();
  const { qParams, updateQuery, Pagination, resultsPerPage } = useFilters({
    limit: 14,
    disableCache: true,
  });

  useEffect(() => {
    if (!qParams.status) {
      updateQuery({ status: SupplyRequestStatus.active });
    }
  }, [qParams.status, updateQuery]);

  const { data: productKnowledgeResponse } = useQuery({
    queryKey: ["productKnowledge", facilityId],
    queryFn: query(productKnowledgeApi.listProductKnowledge, {
      queryParams: {
        facility: facilityId,
        limit: 100,
        status: ProductKnowledgeStatus.active,
      },
    }),
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ["supplyRequests", facilityId, locationId, qParams],
    queryFn: query.debounced(supplyRequestApi.listSupplyRequest, {
      queryParams: {
        deliver_to: locationId,
        limit: resultsPerPage,
        offset: ((qParams.page ?? 1) - 1) * resultsPerPage,
        status: qParams.status,
        priority: qParams.priority, // TODO: add priority filter in backend
        item: qParams.item,
        deliver_from_isnull: false,
      },
    }),
  });

  const requests = response?.results || [];
  const productKnowledges = productKnowledgeResponse?.results || [];

  const getStatusBadgeColor = (status: SupplyRequestStatus) => {
    switch (status) {
      case SupplyRequestStatus.active:
        return "bg-green-100 text-green-800";
      case SupplyRequestStatus.completed:
        return "bg-blue-100 text-blue-800";
      case SupplyRequestStatus.cancelled:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadgeColor = (priority: SupplyRequestPriority) => {
    switch (priority) {
      case SupplyRequestPriority.urgent:
        return "bg-red-100 text-red-800";
      case SupplyRequestPriority.asap:
        return "bg-orange-100 text-orange-800";
      case SupplyRequestPriority.stat:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const selectedProduct = productKnowledges.find((p) => p.id === qParams.item);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              <span className="truncate">
                {selectedProduct ? selectedProduct.name : t("search_by_item")}
              </span>
              {selectedProduct ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-4 p-0 hover:bg-transparent"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateQuery({ item: undefined });
                  }}
                >
                  <X className="size-3" />
                  <span className="sr-only">{t("clear")}</span>
                </Button>
              ) : (
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandInput
                className="border-none focus-visible:ring-0"
                placeholder={t("search_product_knowledge")}
              />
              <CommandEmpty>{t("no_product_knowledge_found")}</CommandEmpty>
              <CommandGroup>
                {productKnowledges.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.name}
                    onSelect={() => {
                      updateQuery({ item: product.id });
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        qParams.item === product.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {product.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="gap-2 font-medium"
            >
              <SlidersHorizontal className="size-4" />
              <span>{t("filter_by_status")}</span>
              {qParams.status && (
                <Badge
                  variant="secondary"
                  className={cn("ml-2", getStatusBadgeColor(qParams.status))}
                >
                  {t(qParams.status)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandGroup>
                {Object.values(SupplyRequestStatus).map((status) => (
                  <CommandItem
                    key={status}
                    value={status}
                    onSelect={() =>
                      updateQuery({
                        status:
                          qParams.status === status
                            ? SupplyRequestStatus.active
                            : status,
                      })
                    }
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        qParams.status === status ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {t(status)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="gap-2 font-medium"
            >
              <BarChart3 className="size-4" />
              <span>{t("filter_by_priority")}</span>
              {qParams.priority && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-2",
                    getPriorityBadgeColor(qParams.priority),
                  )}
                >
                  {t(qParams.priority)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandGroup>
                {Object.values(SupplyRequestPriority).map((priority) => (
                  <CommandItem
                    key={priority}
                    value={priority}
                    onSelect={() =>
                      updateQuery({
                        priority:
                          qParams.priority === priority ? undefined : priority,
                      })
                    }
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        qParams.priority === priority
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {t(priority)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 text-gray-600">
              <TableHead className="text-gray-600">{t("item")}</TableHead>
              <TableHead className="text-gray-600">
                {t("qty_requested")}
              </TableHead>
              <TableHead className="text-gray-600">
                {t("deliver_from")}
              </TableHead>
              <TableHead className="text-gray-600">{t("status")}</TableHead>
              <TableHead className="text-gray-600">{t("priority")}</TableHead>
              <TableHead className="text-gray-600">{t("action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request: SupplyRequestRead) => (
              <TableRow key={request.id}>
                <TableCell>{request.item.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium min-w-8 text-right">
                      {request.quantity}
                    </span>
                    <span className="text-gray-500">
                      {request.item.definitional?.dosage_form?.display}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{request.deliver_from?.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getStatusBadgeColor(request.status)}
                  >
                    {t(request.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getPriorityBadgeColor(request.priority)}
                  >
                    {t(request.priority)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {}}
                  >
                    <svg
                      className="size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    {t("see_details")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-96">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-gray-100 p-3">
                      <svg
                        className="size-6 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-sm font-medium text-gray-900">
                      {t("no_requests_found")}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {t("no_requests_found_description")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <Pagination totalCount={response?.count || 0} />
      </div>
    </div>
  );
}
