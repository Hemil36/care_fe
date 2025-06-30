import { formatDate } from "date-fns";
import { EllipsisVerticalIcon, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
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

export interface ReceiveStockTableProps {
  entries: any[];
  form: any;
  setEditingItem: (item: any) => void;
  handleAddItem: () => void;
}

export function ReceiveStockTable({
  entries,
  form,
  setEditingItem,
  handleAddItem,
}: ReceiveStockTableProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-2">
      <h5 className="font-semibold mb-2">{t("items_section")}</h5>
      {entries.length > 0 ? (
        <div className="rounded-md overflow-hidden border-2 border-white shadow-md">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow className="divide-x">
                <TableHead className="w-8"></TableHead>
                <TableHead>{t("requested_item")}</TableHead>
                <TableHead>{t("received_item")}</TableHead>
                <TableHead>{t("received_quantity")}</TableHead>
                <TableHead>{t("lot")}</TableHead>
                <TableHead>{t("expiry")}</TableHead>
                <TableHead>{t("tax")}</TableHead>
                <TableHead>{t("discount")}</TableHead>
                <TableHead>{t("amount")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white text-base">
              {entries.map((entry, idx) => (
                <TableRow key={idx} className="divide-x">
                  {/* Checkbox */}
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={!!entry._checked}
                      onChange={(e) => {
                        form.setValue(
                          `entries.${idx}._checked`,
                          e.target.checked,
                        );
                      }}
                    />
                  </TableCell>
                  {/* Requested Item/Qty */}
                  <TableCell>
                    {entry.supply_request?.item?.name || t("not_selected")}
                    <div className="text-xs text-gray-500">
                      {entry.supplied_item_quantity}{" "}
                      {entry.supply_request?.item?.unit || ""}
                    </div>
                  </TableCell>
                  {/* Received Item */}
                  <TableCell>
                    {entry.supplied_item?.id ? (
                      <span>{entry.supplied_item.name}</span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditingItem({ entry: { ...entry }, index: idx })
                        }
                        className="w-full"
                      >
                        <Plus className="size-4 mr-1" /> {t("receive_item")}
                      </Button>
                    )}
                  </TableCell>
                  {/* Received Qty */}
                  <TableCell>{entry.supplied_item_quantity}</TableCell>
                  {/* Lot */}
                  <TableCell>
                    {entry.supplied_item?.batch?.lot_number || "-"}
                  </TableCell>
                  {/* Expiry Date */}
                  <TableCell>
                    {formatDate(
                      new Date(entry.supplied_item?.expiration_date),
                      "dd/MM/yy",
                    ) || "-"}
                  </TableCell>
                  {/* Tax */}
                  <TableCell>-</TableCell>
                  {/* Discount */}
                  <TableCell>-</TableCell>
                  {/* Amount */}
                  <TableCell>-</TableCell>
                  {/* Actions */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <EllipsisVerticalIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            setEditingItem({ entry: { ...entry }, index: idx })
                          }
                        >
                          {t("edit")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-gray-500 bg-gray-100 p-8 rounded-md">
          <p className="mb-2 text-lg font-semibold">
            {t("no_items_added_yet")}
          </p>
          <p className="mb-4 text-sm">{t("receive_stock_empty_hint")}</p>
          <Button variant="outline" onClick={handleAddItem}>
            <Plus className="size-4 mr-2" />
            {t("add_item")}
          </Button>
        </div>
      )}
    </div>
  );
}
