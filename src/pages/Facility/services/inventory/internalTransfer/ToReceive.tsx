import { PlusIcon } from "lucide-react";
import { useQueryParams } from "raviger";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Page from "@/components/Common/Page";

import ToReceiveSupplyRequestTable from "@/pages/Facility/services/inventory/internalTransfer/ToReceiveSupplyRequestTable";

interface Props {
  facilityId: string;
  locationId: string;
}

type Tab =
  | "requests_raised"
  | "receive_items"
  | "received"
  | "abandoned"
  | "entered_in_error";

function EmptyState() {
  const { t } = useTranslation();
  return (
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
  );
}

export default function ToReceive({ facilityId, locationId }: Props) {
  const { t } = useTranslation();
  const [qParams, setQueryParams] = useQueryParams();
  const currentTab = (qParams.tab as Tab) || "requests_raised";

  const updateQuery = (params: Record<string, string>) => {
    setQueryParams({ ...qParams, ...params });
  };

  const handleTabChange = (value: string) => {
    updateQuery({ tab: value });
  };

  return (
    <Page title={t("to_receive")} hideTitleOnPage>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t("to_receive")}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {t("to_receive_description")}
            </p>
          </div>
          <div>
            {currentTab === "requests_raised" && (
              <Button
                onClick={() => {}}
                className="whitespace-nowrap bg-primary-700 hover:bg-primary-800"
              >
                <PlusIcon className="size-4" />
                {t("raise_stock_request")}
              </Button>
            )}
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent p-0 h-auto rounded-none">
            <TabsTrigger
              value="requests_raised"
              className="border-0 border-b-2 border-transparent px-4 py-2 text-gray-600 hover:text-gray-900 data-[state=active]:text-primary-800 data-[state=active]:border-primary-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none"
            >
              {t("requests_raised")}
            </TabsTrigger>
            <TabsTrigger
              value="receive_items"
              className="border-0 border-b-2 border-transparent px-4 py-2 text-gray-600 hover:text-gray-900 data-[state=active]:text-primary-800 data-[state=active]:border-primary-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none"
            >
              {t("receive_items")}
            </TabsTrigger>
            <TabsTrigger
              value="received"
              className="border-0 border-b-2 border-transparent px-4 py-2 text-gray-600 hover:text-gray-900 data-[state=active]:text-primary-800 data-[state=active]:border-primary-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none"
            >
              {t("received")}
            </TabsTrigger>
            <TabsTrigger
              value="abandoned"
              className="border-0 border-b-2 border-transparent px-4 py-2 text-gray-600 hover:text-gray-900 data-[state=active]:text-primary-800 data-[state=active]:border-primary-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none"
            >
              {t("abandoned")}
            </TabsTrigger>
            <TabsTrigger
              value="entered_in_error"
              className="border-0 border-b-2 border-transparent px-4 py-2 text-gray-600 hover:text-gray-900 data-[state=active]:text-primary-800 data-[state=active]:border-primary-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none"
            >
              {t("entered_in_error")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests_raised" className="mt-4 space-y-4">
            <ToReceiveSupplyRequestTable
              facilityId={facilityId}
              locationId={locationId}
            />
          </TabsContent>

          <TabsContent value="receive_items" className="mt-4">
            <EmptyState />
          </TabsContent>

          <TabsContent value="received" className="mt-4">
            <EmptyState />
          </TabsContent>

          <TabsContent value="abandoned" className="mt-4">
            <EmptyState />
          </TabsContent>

          <TabsContent value="entered_in_error" className="mt-4">
            <EmptyState />
          </TabsContent>
        </Tabs>
      </div>
    </Page>
  );
}
