import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import CareIcon from "@/CAREUI/icons/CareIcon";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatDateTime } from "@/Utils/utils";

import { VaccinationSlideOver } from "./VaccinationSlideOver";

interface VaccinationRecord {
  id: string;
  vaccineCode: string;
  vaccineName: string;
  occurrenceDateTime: string;
  lotNumber?: string;
  status: string;
  recordedDate: string;
  primarySource: boolean;
  route?: string;
  site?: string;
  note?: string;
  expirationDate?: string;
}

const INITIAL_VACCINATIONS: VaccinationRecord[] = [
  {
    id: "1",
    vaccineCode: "03",
    vaccineName: "MMR (Measles, Mumps, Rubella)",
    occurrenceDateTime: "2024-01-15T10:30:00Z",
    lotNumber: "MM2024A",
    status: "completed",
    recordedDate: "2024-01-15T10:35:00Z",
    primarySource: true,
    route: "Intramuscular",
    site: "Left deltoid",
    note: "Patient tolerated well, no adverse reactions observed",
  },
];

export const Vaccinations = () => {
  const { t } = useTranslation();

  const [vaccinations, setVaccinations] =
    useState<VaccinationRecord[]>(INITIAL_VACCINATIONS);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [selectedVaccination, setSelectedVaccination] =
    useState<VaccinationRecord | null>(null);

  const handleAddVaccination = (
    vaccinationData: Omit<
      VaccinationRecord,
      "id" | "status" | "recordedDate" | "primarySource"
    >,
  ) => {
    const newVaccination: VaccinationRecord = {
      ...vaccinationData,
      id: Date.now().toString(),
      status: "completed",
      recordedDate: new Date().toISOString(),
      primarySource: true,
    };

    setVaccinations((prev) => [newVaccination, ...prev]);
    setIsSlideOverOpen(false);
    toast.success(t("vaccination_added_successfully"));
  };

  const handleEditVaccination = (updatedVaccination: VaccinationRecord) => {
    setVaccinations((prev) =>
      prev.map((v) =>
        v.id === updatedVaccination.id ? updatedVaccination : v,
      ),
    );
    setIsSlideOverOpen(false);
    setSelectedVaccination(null);
    toast.success(t("vaccination_updated_successfully"));
  };

  const handleEdit = (vaccination: VaccinationRecord) => {
    setSelectedVaccination(vaccination);
    setIsSlideOverOpen(true);
  };

  const handleAdd = () => {
    setSelectedVaccination(null);
    setIsSlideOverOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      completed:
        "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900",
      not_done: "bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900",
      entered_in_error:
        "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900",
    };

    return (
      <Badge
        className={
          statusColors[status] ||
          "bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900"
        }
      >
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="mt-4 px-3 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <h2 className="text-2xl font-semibold leading-tight text-center sm:text-left">
          {t("vaccinations")}
        </h2>
        <Button variant="outline_primary" onClick={handleAdd}>
          <CareIcon icon="l-plus" className="mr-2" />
          {t("add_vaccination")}
        </Button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("vaccine_name")}</TableHead>
              <TableHead>{t("date_given")}</TableHead>
              <TableHead>{t("lot_number")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vaccinations.length ? (
              vaccinations.map((vaccination) => (
                <TableRow key={vaccination.id}>
                  <TableCell className="font-medium">
                    {vaccination.vaccineName}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(vaccination.occurrenceDateTime)}
                  </TableCell>
                  <TableCell>
                    {vaccination.lotNumber || (
                      <span className="text-gray-500">
                        {t("not_specified")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(vaccination.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(vaccination)}
                    >
                      <CareIcon icon="l-edit" className="mr-1" />
                      {t("edit")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  {t("no_vaccinations")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <VaccinationSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => {
          setIsSlideOverOpen(false);
          setSelectedVaccination(null);
        }}
        onSave={
          selectedVaccination ? handleEditVaccination : handleAddVaccination
        }
        vaccination={selectedVaccination}
      />
    </div>
  );
};
