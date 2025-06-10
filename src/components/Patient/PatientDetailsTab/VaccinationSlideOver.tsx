import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import CareIcon from "@/CAREUI/icons/CareIcon";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

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

interface VaccinationSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vaccination: any) => void;
  vaccination?: VaccinationRecord | null;
}

const VACCINE_OPTIONS = [
  { code: "03", name: "MMR (Measles, Mumps, Rubella)" },
  { code: "08", name: "Hepatitis B" },
  { code: "09", name: "Hepatitis A" },
  { code: "10", name: "IPV (Inactivated Polio Vaccine)" },
  { code: "20", name: "DTaP (Diphtheria, Tetanus, Pertussis)" },
  { code: "21", name: "Varicella (Chickenpox)" },
  { code: "62", name: "HPV (Human Papillomavirus)" },
  { code: "88", name: "Influenza (Flu)" },
  { code: "115", name: "Tdap (Tetanus, Diphtheria, Pertussis)" },
  { code: "121", name: "Zoster (Shingles)" },
  { code: "208", name: "COVID-19 mRNA" },
];

export const VaccinationSlideOver = ({
  isOpen,
  onClose,
  onSave,
  vaccination,
}: VaccinationSlideOverProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    vaccineCode: "",
    vaccineName: "",
    occurrenceDateTime: "",
    lotNumber: "",
    route: "",
    site: "",
    note: "",
    expirationDate: "",
  });
  const [isVaccineSelectOpen, setIsVaccineSelectOpen] = useState(false);

  useEffect(() => {
    if (vaccination) {
      setFormData({
        vaccineCode: vaccination.vaccineCode,
        vaccineName: vaccination.vaccineName,
        occurrenceDateTime: vaccination.occurrenceDateTime.split("T")[0],
        lotNumber: vaccination.lotNumber || "",
        route: vaccination.route || "",
        site: vaccination.site || "",
        note: vaccination.note || "",
        expirationDate: vaccination.expirationDate?.split("T")[0] || "",
      });
    } else {
      // Reset form for new vaccination
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        vaccineCode: "",
        vaccineName: "",
        occurrenceDateTime: today,
        lotNumber: "",
        route: "",
        site: "",
        note: "",
        expirationDate: "",
      });
    }
  }, [vaccination, isOpen]);

  const handleVaccineSelect = (vaccine: { code: string; name: string }) => {
    setFormData((prev) => ({
      ...prev,
      vaccineCode: vaccine.code,
      vaccineName: vaccine.name,
    }));
    setIsVaccineSelectOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.vaccineCode ||
      !formData.vaccineName ||
      !formData.occurrenceDateTime
    ) {
      return;
    }

    const submissionData = {
      ...formData,
      occurrenceDateTime: new Date(formData.occurrenceDateTime).toISOString(),
      expirationDate: formData.expirationDate
        ? new Date(formData.expirationDate).toISOString()
        : undefined,
    };

    if (vaccination) {
      onSave({
        ...vaccination,
        ...submissionData,
      });
    } else {
      onSave(submissionData);
    }
  };

  const selectedVaccine = VACCINE_OPTIONS.find(
    (v) => v.code === formData.vaccineCode,
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {vaccination ? t("edit_vaccination") : t("add_vaccination")}
          </SheetTitle>
          <SheetDescription>
            {vaccination
              ? t("edit_vaccination_details")
              : t("add_new_vaccination_record")}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="vaccine">{t("vaccine")} *</Label>
            <Popover
              open={isVaccineSelectOpen}
              onOpenChange={setIsVaccineSelectOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isVaccineSelectOpen}
                  className="w-full justify-between"
                >
                  {selectedVaccine ? selectedVaccine.name : t("select_vaccine")}
                  <CareIcon
                    icon="l-angle-down"
                    className="ml-2 h-4 w-4 shrink-0 opacity-50"
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder={t("search_vaccines")}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>{t("no_vaccines_found")}</CommandEmpty>
                    <CommandGroup>
                      {VACCINE_OPTIONS.map((vaccine) => (
                        <CommandItem
                          key={vaccine.code}
                          value={vaccine.name}
                          onSelect={() => handleVaccineSelect(vaccine)}
                        >
                          <span>{vaccine.name}</span>
                          <span className="ml-auto text-xs text-gray-500">
                            {vaccine.code}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">{t("date_given")} *</Label>
            <Input
              id="date"
              type="date"
              value={formData.occurrenceDateTime}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  occurrenceDateTime: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lotNumber">{t("lot_number")}</Label>
            <Input
              id="lotNumber"
              value={formData.lotNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lotNumber: e.target.value }))
              }
              placeholder={t("enter_lot_number")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="route">{t("route")}</Label>
            <Input
              id="route"
              value={formData.route}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, route: e.target.value }))
              }
              placeholder={t("e_g_intramuscular")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site">{t("site")}</Label>
            <Input
              id="site"
              value={formData.site}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, site: e.target.value }))
              }
              placeholder={t("e_g_left_deltoid")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expirationDate">{t("expiration_date")}</Label>
            <Input
              id="expirationDate"
              type="date"
              value={formData.expirationDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expirationDate: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">{t("notes")}</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, note: e.target.value }))
              }
              placeholder={t("any_additional_notes")}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                !formData.vaccineCode ||
                !formData.vaccineName ||
                !formData.occurrenceDateTime
              }
            >
              {vaccination ? t("update") : t("save")}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
