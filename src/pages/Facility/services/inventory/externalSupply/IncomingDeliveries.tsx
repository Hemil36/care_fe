import { useQuery } from "@tanstack/react-query";
import { CheckCircleIcon, TruckIcon } from "lucide-react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Link } from "raviger";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Page from "@/components/Common/Page";

import useFilters from "@/hooks/useFilters";

import query from "@/Utils/request/query";
import SupplyDeliveryTable from "@/pages/Facility/services/supply/components/SupplyDeliveryTable";
import { SupplyDeliveryStatus } from "@/types/inventory/supplyDelivery/supplyDelivery";
import supplyDeliveryApi from "@/types/inventory/supplyDelivery/supplyDeliveryApi";
import organizationApi from "@/types/organization/organizationApi";

interface Props {
  facilityId: string;
  locationId: string;
}

export function IncomingDeliveries({ facilityId, locationId }: Props) {
  const { t } = useTranslation();
  const { qParams, updateQuery, Pagination, resultsPerPage } = useFilters({
    limit: 14,
    disableCache: true,
  });
  const [supplierSearchQuery, setSupplierSearchQuery] = useState("");
  const [supplierPopoverOpen, setSupplierPopoverOpen] = useState(false);

  const TABS_CONFIG = [
    {
      value: "in_progress",
      label: t("in_progress"),
      status: SupplyDeliveryStatus.in_progress,
    },
    {
      value: "completed",
      label: t("completed"),
      status: SupplyDeliveryStatus.completed,
    },
    {
      value: "abandoned",
      label: t("abandoned"),
      status: SupplyDeliveryStatus.abandoned,
    },
    {
      value: "entered_in_error",
      label: t("entered_in_error"),
      status: SupplyDeliveryStatus.entered_in_error,
    },
  ];
  const currentTab =
    TABS_CONFIG.find((tab) => tab.status === qParams.status)?.value ||
    "in_progress";
  function handleTabChange(value: string) {
    const tab = TABS_CONFIG.find((tab) => tab.value === value);
    if (!tab) return;
    updateQuery({
      status: tab.status,
      page: "1",
    });
  }

  const { data: response, isLoading } = useQuery({
    queryKey: ["externalSupplyDeliveries", facilityId, locationId, qParams],
    queryFn: query.debounced(supplyDeliveryApi.listSupplyDelivery, {
      queryParams: {
        facility: facilityId,
        limit: resultsPerPage,
        offset: ((qParams.page ?? 1) - 1) * resultsPerPage,
        status: qParams.status || "in_progress",
        destination: locationId,
        origin_isnull: true,
        supplier: qParams.supplier || undefined,
      },
    }),
  });

  const { data: availableSuppliers } = useQuery({
    queryKey: ["organizations", supplierSearchQuery],
    queryFn: query.debounced(organizationApi.list, {
      queryParams: {
        org_type: "product_supplier",
        name: supplierSearchQuery || undefined,
      },
    }),
  });

  const deliveries = response?.results || [];
  const supplierOptions = availableSuppliers?.results || [];
  const selectedSupplier = supplierOptions.find(
    (s) => s.id === qParams.supplier,
  );

  return (
    <Page title={t("inward_entry")} hideTitleOnPage>
      <div className="container mx-auto">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {t("inward_entry")}
            </h1>

            <div className="flex flex-row gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link
                  href="/external_supply/receive"
                  className="flex items-center gap-2"
                >
                  <TruckIcon />
                  {t("receive_stock")}
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link
                  href="/external_supply/inward_entry/approve"
                  className="flex items-center gap-2"
                >
                  <CheckCircleIcon />
                  {t("approve_deliveries")}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-4">
          <Tabs value={currentTab} onValueChange={handleTabChange}>
            <TabsList className="w-full justify-evenly sm:justify-start border-b rounded-none bg-transparent p-0 h-auto overflow-x-auto">
              {TABS_CONFIG.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="border-b-3 px-2.5 py-1 font-semibold text-gray-600 hover:text-gray-900 data-[state=active]:border-b-primary-700  data-[state=active]:text-primary-800 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <Popover
                open={supplierPopoverOpen}
                onOpenChange={setSupplierPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    <span className="truncate">
                      {selectedSupplier
                        ? selectedSupplier.name
                        : t("search_vendor")}
                    </span>
                    {selectedSupplier ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-4 p-0 hover:bg-transparent"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          updateQuery({ supplier: undefined });
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
                      placeholder={t("search_supplier")}
                      value={supplierSearchQuery}
                      onValueChange={setSupplierSearchQuery}
                    />
                    <CommandEmpty>{t("no_vendor_found")}</CommandEmpty>
                    <CommandGroup>
                      {supplierOptions.map((supplier) => (
                        <CommandItem
                          key={supplier.id}
                          value={supplier.name}
                          onSelect={() => {
                            updateQuery({ supplier: supplier.id });
                            setSupplierPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              qParams.supplier === supplier.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {supplier.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <SupplyDeliveryTable
          deliveries={deliveries}
          isLoading={isLoading}
          facilityId={facilityId}
          locationId={locationId}
          showSupplier={true}
          showDate={true}
        />

        <div className="mt-4">
          <Pagination totalCount={response?.count || 0} />
        </div>
      </div>
    </Page>
  );
}
