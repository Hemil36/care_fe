import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckIcon, Plus, X } from "lucide-react";
import { useNavigate } from "raviger";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";

import Page from "@/components/Common/Page";

import useAppHistory from "@/hooks/useAppHistory";

import routes from "@/Utils/request/api";
import mutate from "@/Utils/request/mutate";
import { ProductSearch } from "@/pages/Facility/services/inventory/ProductSearch";
import { SupplierSelect } from "@/pages/Facility/services/inventory/SupplierSelect";
import { ProductRead } from "@/types/inventory/product/product";
import {
  SupplyDeliveryCreate,
  SupplyDeliveryStatus,
  SupplyDeliveryType,
} from "@/types/inventory/supplyDelivery/supplyDelivery";
import supplyDeliveryApi from "@/types/inventory/supplyDelivery/supplyDeliveryApi";
import { SupplyRequestRead } from "@/types/inventory/supplyRequest/supplyRequest";
import { Organization } from "@/types/organization/organization";

import { ReceiveStockTable } from "./ReceiveStockTable";
import { SupplyRequestSelect } from "./SupplyRequestSelect";

const itemReference = z.object({
  id: z.string(),
  name: z.string(),
  unit: z.string().optional(),
});

const supplyRequestReference = z.object({
  id: z.string(),
  item: itemReference,
  quantity: z.number(),
});

const objectReference = z.object({ id: z.string(), name: z.string() });

const receiveStockSchema = z.object({
  supplier: objectReference.nullable(),
  entries: z
    .array(
      z.object({
        supply_request: supplyRequestReference.nullable(),
        supplied_item: z
          .object({
            id: z.string(),
            name: z.string(),
            batch: z.object({
              lot_number: z.string(),
            }),
            expiration_date: z.string(),
          })
          .nullable(),
        supplied_item_quantity: z.number().min(0),
        _checked: z.boolean().optional(),
      }),
    )
    .min(1),
});

export function ReceiveStock({
  facilityId,
  locationId,
}: {
  facilityId: string;
  locationId: string;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goBack } = useAppHistory();
  const [editingItem, setEditingItem] = useState<{
    entry: any;
    index: number | null;
  } | null>(null);

  const form = useForm({
    resolver: zodResolver(receiveStockSchema),
    defaultValues: {
      supplier: null,
      entries: [],
    },
  });

  const batchRequest = useMutation({
    mutationFn: mutate(routes.batchRequest),
    onSuccess: () => {
      toast.success(t("stock_received"));
      form.reset();
      navigate("/external_supply/inward_entry/approve");
    },
    onError: () => {
      toast.error(t("error_receiving_stock"));
    },
  });

  function onSubmit(data: z.infer<typeof receiveStockSchema>) {
    batchRequest.mutate({
      requests: data.entries
        .filter((entry) => entry._checked)
        .map((entry) => ({
          url: supplyDeliveryApi.createSupplyDelivery.path,
          method: supplyDeliveryApi.createSupplyDelivery.method,
          reference_id: `supplied-item-${entry.supplied_item?.id}`,
          body: {
            supplier: data.supplier?.id,
            supply_request: entry.supply_request?.id,
            destination: locationId,
            supplied_item: entry.supplied_item?.id,
            supplied_item_quantity: entry.supplied_item_quantity,
            status: SupplyDeliveryStatus.completed,
            supplied_item_type: SupplyDeliveryType.product,
          } satisfies SupplyDeliveryCreate,
        })),
    });
  }

  const entries = form.watch("entries");
  const supplier = form.watch("supplier");

  const _removeEntry = (index: number) => {
    form.setValue(
      "entries",
      entries.filter((_, i) => i !== index),
    );
  };

  const handleAddItem = () => {
    setEditingItem({
      entry: {
        supply_request: null,
        supplied_item: {
          id: "",
          name: "",
          batch: {
            lot_number: "",
          },
          expiration_date: "",
        },
        supplied_item_quantity: 1,
        _checked: false,
      },
      index: null,
    });
  };

  return (
    <Page
      title={t("receive_stock")}
      className="flex flex-col gap-4"
      hideTitleOnPage
    >
      <div className="flex flex-row gap-2 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{t("receive_stock")}</h1>
          <p className="text-sm text-gray-500">
            {t("receive_stock_description")}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            goBack(
              `/facility/${facilityId}/locations/${locationId}/external_supply/inward_entry`,
            )
          }
        >
          <X className="size-4" />
        </Button>
      </div>
      <Separator className="my-1" />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-row gap-2 items-end justify-between"
        >
          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem className="grow-1 max-w-md">
                <FormLabel>{t("supplier")}</FormLabel>
                <FormControl>
                  <SupplierSelect
                    value={field.value as Organization}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                handleAddItem();
              }}
            >
              <Plus className="size-4" />
              {t("add_item")}
            </Button>
            {entries.length > 0 && (
              <Button
                type="submit"
                variant="primary"
                disabled={
                  batchRequest.isPending ||
                  entries.filter((entry) => entry._checked).length === 0
                }
              >
                <Plus className="size-4" />
                {t("save_as_received")}
              </Button>
            )}
          </div>
        </form>
      </Form>
      <div className="mt-2">
        <ReceiveStockTable
          entries={entries}
          form={form}
          setEditingItem={setEditingItem}
          handleAddItem={handleAddItem}
        />
      </div>
      {editingItem && (
        <AddItemForm
          facilityId={facilityId}
          locationId={locationId}
          entry={editingItem.entry}
          index={editingItem.index}
          open={!!editingItem}
          setOpen={(open) => {
            if (!open) setEditingItem(null);
          }}
          onSuccess={(newEntry, idx) => {
            if (idx === null) {
              form.setValue("entries", [...entries, newEntry]);
            } else {
              const updated = [...entries];
              updated[idx] = newEntry;
              form.setValue("entries", updated);
            }
            setEditingItem(null);
          }}
          supplier={supplier?.id || ""}
        />
      )}
    </Page>
  );
}

function AddItemForm({
  entry,
  supplier,
  facilityId,
  locationId,
  index,
  open,
  setOpen,
  onSuccess,
}: {
  entry: any;
  supplier: string;
  facilityId: string;
  locationId: string;
  index: number | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: (newEntry: any, idx: number | null) => void;
}) {
  const { t } = useTranslation();
  const [currentEntry, setCurrentEntry] = useState(entry);
  const [productFormSubmit, setProductFormSubmit] = useState<
    (() => void) | null
  >(null);
  const [isProductCreationInProgress, setIsProductCreationInProgress] =
    useState(false);

  useEffect(() => {
    setCurrentEntry(entry);
  }, [entry, open]);

  if (!currentEntry) return null;

  const handleSave = () => {
    if (productFormSubmit && isProductCreationInProgress) {
      // If product creation is in progress, trigger the submit
      productFormSubmit();
    } else {
      // No product creation needed, save the entry directly
      onSuccess(currentEntry, index);
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-2xl p-3">
        <ScrollArea className="h-[calc(100vh-8rem)] mt-6 p-3">
          <div className="flex flex-col gap-2">
            <div className="bg-gray-100 p-3 rounded flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  {t("received_item")}
                </label>
                <SupplyRequestSelect
                  value={
                    currentEntry.supply_request
                      ? (currentEntry.supply_request as SupplyRequestRead)
                      : undefined
                  }
                  onChange={(value) => {
                    if (value) {
                      setCurrentEntry((prev: any) => ({
                        ...prev,
                        supply_request: value,
                        supplied_item_quantity: value.quantity,
                      }));
                    } else {
                      setCurrentEntry((prev: any) => ({
                        ...prev,
                        supply_request: null,
                      }));
                    }
                  }}
                  locationId={locationId}
                  placeholder={t("select_item")}
                  inputPlaceholder={t("search_items")}
                  noOptionsMessage={t("no_items_found")}
                  supplier={supplier}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  {t("received_quantity")}
                </label>
                <Input
                  type="number"
                  min={0}
                  value={currentEntry.supplied_item_quantity || 0}
                  onChange={(e) =>
                    setCurrentEntry((prev: any) => ({
                      ...prev,
                      supplied_item_quantity: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <ProductSearch
              facilityId={facilityId}
              value={
                currentEntry.supplied_item?.id
                  ? (currentEntry.supplied_item as ProductRead)
                  : undefined
              }
              onChange={(product: ProductRead) => {
                setCurrentEntry((prev: any) => ({
                  ...prev,
                  supplied_item: {
                    id: product.id,
                    name: product.product_knowledge.name,
                    batch: {
                      lot_number: product.batch?.lot_number || "",
                    },
                    expiration_date: product.expiration_date || "",
                  },
                }));
                // Clear the submit function and creation state since product is now selected
                setProductFormSubmit(null);
                setIsProductCreationInProgress(false);
              }}
              onProductSubmit={(submitFn) => {
                setProductFormSubmit(() => submitFn);
                setIsProductCreationInProgress(true);
              }}
            />
          </div>
        </ScrollArea>
        <div className="flex flex-row gap-2 justify-end">
          <Button variant="outline" onClick={handleCancel}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={
              !currentEntry.supply_request ||
              !currentEntry.supplied_item_quantity ||
              (isProductCreationInProgress && !productFormSubmit)
            }
          >
            <CheckIcon className="size-6" />
            {t("add_item")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
