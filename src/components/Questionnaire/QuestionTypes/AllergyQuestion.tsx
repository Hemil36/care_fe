import {
  CheckCircledIcon,
  CircleBackslashIcon,
  MinusCircledIcon,
  Pencil2Icon,
} from "@radix-ui/react-icons";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CombinedDatePicker } from "@/components/ui/combined-date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CATEGORY_ICONS } from "@/components/Patient/allergy/list";
import { EntitySelectionDrawer } from "@/components/Questionnaire/EntitySelectionDrawer";
import ValueSetSelect from "@/components/Questionnaire/ValueSetSelect";

import useBreakpoints from "@/hooks/useBreakpoints";

import query from "@/Utils/request/query";
import { dateQueryString } from "@/Utils/utils";
import {
  ALLERGY_VERIFICATION_STATUS,
  type AllergyIntolerance,
  type AllergyIntoleranceRequest,
  type AllergyVerificationStatus,
} from "@/types/emr/allergyIntolerance/allergyIntolerance";
import allergyIntoleranceApi from "@/types/emr/allergyIntolerance/allergyIntoleranceApi";
import type { Code } from "@/types/questionnaire/code";
import type {
  QuestionnaireResponse,
  ResponseValue,
} from "@/types/questionnaire/form";
import type { Question } from "@/types/questionnaire/question";

interface AllergyQuestionProps {
  patientId: string;
  question: Question;
  questionnaireResponse: QuestionnaireResponse;
  updateQuestionnaireResponseCB: (
    values: ResponseValue[],
    questionId: string,
    note?: string,
  ) => void;
  disabled?: boolean;
}

const ALLERGY_INITIAL_VALUE: Partial<AllergyIntoleranceRequest> = {
  code: { code: "", display: "", system: "" },
  clinical_status: "active",
  verification_status: "confirmed",
  category: "medication",
  criticality: "low",
};

type AllergyCategory = "food" | "medication" | "environment" | "biologic";

const ALLERGY_CATEGORIES: Record<AllergyCategory, string> = {
  food: "Food",
  medication: "Medication",
  environment: "Environment",
  biologic: "Biologic",
};

function convertToAllergyRequest(
  allergy: AllergyIntolerance,
): AllergyIntoleranceRequest {
  return {
    id: allergy.id,
    code: allergy.code,
    clinical_status: allergy.clinical_status,
    verification_status: allergy.verification_status,
    category: allergy.category,
    criticality: allergy.criticality,
    last_occurrence: allergy.last_occurrence
      ? dateQueryString(new Date(allergy.last_occurrence))
      : undefined,
    note: allergy.note,
    encounter: allergy.encounter,
  };
}

export function AllergyQuestion({
  questionnaireResponse,
  updateQuestionnaireResponseCB,
  disabled,
  patientId,
}: AllergyQuestionProps) {
  const isPreview = patientId === "preview";
  const allergies =
    (questionnaireResponse.values?.[0]?.value as AllergyIntoleranceRequest[]) ||
    [];
  const [expandedAllergyIndex, setExpandedAllergyIndex] = useState<
    number | null
  >(null);

  // Drawer state for mobile
  const [showAllergyDetails, setShowAllergyDetails] = useState(false);
  const [selectedAllergy, setSelectedAllergy] = useState<Code | null>(null);
  const [newAllergyDetails, setNewAllergyDetails] =
    useState<AllergyIntoleranceRequest | null>(null);
  const isMobile = useBreakpoints({ default: true, md: false });

  const { data: patientAllergies } = useQuery({
    queryKey: ["allergies", patientId],
    queryFn: query(allergyIntoleranceApi.getAllergy, {
      pathParams: { patientId },
      queryParams: {
        limit: 100,
      },
    }),
    enabled: !isPreview,
  });

  useEffect(() => {
    if (patientAllergies?.results) {
      updateQuestionnaireResponseCB(
        [
          {
            type: "allergy_intolerance",
            value: patientAllergies.results.map(convertToAllergyRequest),
          },
        ],
        questionnaireResponse.question_id,
      );
    }
  }, [patientAllergies]);

  const handleAddAllergy = (code: Code) => {
    const isDuplicate = allergies.some(
      (allergy) =>
        allergy.code.code === code.code &&
        allergy.verification_status !== "entered_in_error",
    );

    if (isDuplicate) {
      toast?.warning(t("allergy_already_added"));
      return;
    }

    if (isMobile) {
      setSelectedAllergy(code);
      setNewAllergyDetails({
        ...ALLERGY_INITIAL_VALUE,
        code,
      } as AllergyIntoleranceRequest);
      setShowAllergyDetails(true);
    } else {
      addNewAllergy({
        ...ALLERGY_INITIAL_VALUE,
        code,
      } as AllergyIntoleranceRequest);
    }
  };

  const addNewAllergy = (allergy: AllergyIntoleranceRequest) => {
    const newAllergies = [...allergies, allergy];
    updateQuestionnaireResponseCB(
      [{ type: "allergy_intolerance", value: newAllergies }],
      questionnaireResponse.question_id,
    );
    setExpandedAllergyIndex(newAllergies.length - 1);
    setSelectedAllergy(null);
    setNewAllergyDetails(null);
    setShowAllergyDetails(false);
  };

  const handleConfirmAllergy = () => {
    if (!newAllergyDetails) return;
    addNewAllergy(newAllergyDetails);
  };

  const handleBack = () => {
    if (selectedAllergy) {
      setSelectedAllergy(null);
      setNewAllergyDetails(null);
    } else {
      setShowAllergyDetails(false);
    }
  };

  const handleRemoveAllergy = (index: number) => {
    const allergy = allergies[index];
    if (allergy.id) {
      // For existing records, update verification status to entered_in_error
      const newAllergies = allergies.map((a, i) =>
        i === index
          ? { ...a, verification_status: "entered_in_error" as const }
          : a,
      ) as AllergyIntoleranceRequest[];
      updateQuestionnaireResponseCB(
        [
          {
            type: "allergy_intolerance",
            value: newAllergies,
          },
        ],
        questionnaireResponse.question_id,
      );
    } else {
      // For new records, remove them completely
      const newAllergies = allergies.filter((_, i) => i !== index);
      updateQuestionnaireResponseCB(
        [
          {
            type: "allergy_intolerance",
            value: newAllergies,
          },
        ],
        questionnaireResponse.question_id,
      );
    }
  };

  const handleUpdateAllergy = (
    index: number,
    updates: Partial<AllergyIntoleranceRequest>,
  ) => {
    const newAllergies = allergies.map((allergy, i) =>
      i === index ? { ...allergy, ...updates } : allergy,
    );
    updateQuestionnaireResponseCB(
      [{ type: "allergy_intolerance", value: newAllergies }],
      questionnaireResponse.question_id,
    );
  };

  // New allergy details content for mobile drawer
  const allergyDetailsContent = (
    <div className="space-y-4 p-4">
      {newAllergyDetails && (
        <AllergyTableRow
          allergy={newAllergyDetails}
          disabled={disabled}
          onUpdate={(updates) => {
            if (newAllergyDetails) {
              setNewAllergyDetails({
                ...newAllergyDetails,
                ...updates,
              });
            }
          }}
          onRemove={() => handleBack()}
        />
      )}
    </div>
  );

  return (
    <>
      {allergies.length > 0 && (
        <div className="rounded-lg lg:border lg:border-gray-200">
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10%] max-w-[3rem]"></TableHead>
                  <TableHead className="w-[40%]">{t("substance")}</TableHead>
                  <TableHead className="w-[15%] text-center">
                    {t("criticality")}
                  </TableHead>
                  <TableHead className="w-[15%] text-center">
                    {t("status")}
                  </TableHead>
                  <TableHead className="w-[15%] text-center">
                    {t("occurrence")}
                  </TableHead>
                  <TableHead className="w-[5%]">{t("action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allergies.map((allergy, index) => (
                  <AllergyTableRow
                    key={index}
                    allergy={allergy}
                    disabled={disabled}
                    onUpdate={(updates) => handleUpdateAllergy(index, updates)}
                    onRemove={() => handleRemoveAllergy(index)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden">
            {allergies.map((allergy, index) => (
              <Collapsible
                key={index}
                open={expandedAllergyIndex === index}
                onOpenChange={() => {
                  setExpandedAllergyIndex(
                    expandedAllergyIndex === index ? null : index,
                  );
                }}
                className="mb-2 "
              >
                <Card
                  className={cn("rounded-lg", {
                    "border border-primary-500 bg-gray-50":
                      expandedAllergyIndex === index,
                    "border-0 shadow-none": expandedAllergyIndex !== index,
                  })}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader
                      className={cn(
                        "p-2 rounded-lg shadow-none bg-gray-50 cursor-pointer active:bg-gray-100 transition-colors",
                        {
                          "bg-gray-200 border border-gray-300":
                            expandedAllergyIndex !== index,
                          "opacity-60":
                            allergy.verification_status ===
                              "entered_in_error" ||
                            allergy.clinical_status === "inactive",
                        },
                      )}
                    >
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle
                              className={cn(
                                "text-base text-gray-950 break-words",
                                allergy.clinical_status === "resolved" &&
                                  "line-through",
                                allergy.clinical_status === "inactive" &&
                                  "opacity-60",
                              )}
                              title={allergy.code.display}
                            >
                              {allergy.code.display}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Select
                              value={allergy.category}
                              onValueChange={(value) =>
                                handleUpdateAllergy(index, { category: value })
                              }
                              disabled={disabled || !!allergy.id}
                            >
                              <SelectTrigger
                                className="size-10 px-0 [&>svg]:hidden flex items-center justify-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <SelectValue>
                                  {allergy.category &&
                                    CATEGORY_ICONS[
                                      allergy.category as AllergyCategory
                                    ]}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(ALLERGY_CATEGORIES).map(
                                  ([value, label]) => (
                                    <SelectItem
                                      key={value}
                                      value={value}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="flex items-center gap-2">
                                        {
                                          CATEGORY_ICONS[
                                            value as AllergyCategory
                                          ]
                                        }
                                        <span>{label}</span>
                                      </div>
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                            {expandedAllergyIndex === index && (
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={
                                  disabled ||
                                  allergy.verification_status ===
                                    "entered_in_error"
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveAllergy(index);
                                }}
                                className="size-10 p-4 border border-gray-400 bg-white shadow text-destructive"
                              >
                                <MinusCircledIcon className="size-5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-10 border border-gray-400 bg-white shadow p-4 pointer-events-none"
                            >
                              {expandedAllergyIndex === index ? (
                                <ChevronsDownUp className="size-5" />
                              ) : (
                                <ChevronsUpDown className="size-5" />
                              )}
                            </Button>
                          </div>
                        </div>
                        {expandedAllergyIndex !== index && (
                          <div
                            className={cn("text-sm mt-1 text-gray-600", {
                              "line-through":
                                allergy.clinical_status === "resolved",
                            })}
                          >
                            {t(allergy.criticality)}
                            {" · "}
                            {t(allergy.verification_status)}
                            {allergy.last_occurrence && (
                              <>
                                {" · "}
                                {new Date(
                                  allergy.last_occurrence,
                                ).toLocaleDateString()}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="p-3 pt-2 space-y-3 rounded-lg bg-gray-50">
                      <AllergyTableRow
                        allergy={allergy}
                        disabled={disabled}
                        onUpdate={(updates) =>
                          handleUpdateAllergy(index, updates)
                        }
                        onRemove={() => handleRemoveAllergy(index)}
                      />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </div>
      )}

      {isMobile ? (
        <EntitySelectionDrawer
          open={showAllergyDetails}
          onOpenChange={setShowAllergyDetails}
          selectedEntity={selectedAllergy}
          system="system-allergy-code"
          entityType="allergy"
          disabled={disabled}
          onSelect={handleAddAllergy}
          onBack={handleBack}
          onConfirm={handleConfirmAllergy}
          entityDetailsContent={allergyDetailsContent}
          addPlaceholder={t("add_another_allergy")}
        />
      ) : (
        <ValueSetSelect
          system="system-allergy-code"
          placeholder={t("add_another_allergy")}
          onSelect={handleAddAllergy}
          disabled={disabled}
        />
      )}
    </>
  );
}

interface AllergyItemProps {
  allergy: AllergyIntoleranceRequest;
  disabled?: boolean;
  onUpdate?: (allergy: Partial<AllergyIntoleranceRequest>) => void;
  onRemove?: () => void;
}

const AllergyTableRow = ({
  allergy,
  disabled,
  onUpdate,
  onRemove,
}: AllergyItemProps) => {
  const [showNotes, setShowNotes] = useState(allergy.note !== undefined);
  const desktopLayout = useBreakpoints({ md: true, default: false });

  const isInactive =
    allergy.verification_status === "entered_in_error" || disabled;

  const notesDisabled = disabled;

  const isResolved = allergy.clinical_status === "resolved";
  const isInactiveStatus = allergy.clinical_status === "inactive";

  const rowClassName = `group ${
    allergy.verification_status === "entered_in_error"
      ? "opacity-40 pointer-events-none"
      : isInactiveStatus
        ? "opacity-60"
        : isResolved
          ? "[&_*]:line-through"
          : ""
  }`;

  const handleNotesToggle = () => {
    if (showNotes) {
      setShowNotes(false);
      onUpdate?.({ note: undefined });
    } else {
      setShowNotes(true);
      onUpdate?.({ note: "" });
    }
  };

  const categorySelect = (
    <Select
      value={allergy.category}
      onValueChange={(value) => onUpdate?.({ category: value })}
      disabled={isInactive || !!allergy.id}
    >
      <SelectTrigger
        className={
          desktopLayout
            ? "h-7 w-[2rem] px-0 [&>svg]:hidden flex items-center justify-center"
            : "h-8 w-full"
        }
      >
        <SelectValue
          placeholder="Cat"
          className={
            desktopLayout
              ? "text-center h-full flex items-center justify-center m-0 p-0"
              : ""
          }
        >
          {allergy.category &&
            CATEGORY_ICONS[allergy.category as AllergyCategory]}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(
          Object.entries(ALLERGY_CATEGORIES) as [AllergyCategory, string][]
        ).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            <div className="flex items-center gap-2">
              {CATEGORY_ICONS[value]}
              <span>{label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const criticalitySelect = (
    <Select
      value={allergy.criticality}
      onValueChange={(value) => onUpdate?.({ criticality: value })}
      disabled={isInactive}
    >
      <SelectTrigger
        className={
          desktopLayout
            ? "h-7 w-full px-1 text-sm"
            : cn("h-8 mt-1", {
                "line-through": isResolved,
              })
        }
      >
        <SelectValue placeholder={desktopLayout ? t("critical") : "Critical"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="low">{t("low")}</SelectItem>
        <SelectItem value="high">{t("high")}</SelectItem>
        <SelectItem value="unable_to_assess">
          {t("unable_to_assess")}
        </SelectItem>
      </SelectContent>
    </Select>
  );

  const statusSelect = (
    <Select
      value={allergy.verification_status}
      onValueChange={(value) => {
        if (value in ALLERGY_VERIFICATION_STATUS) {
          onUpdate?.({
            verification_status: value as AllergyVerificationStatus,
          });
        }
      }}
      disabled={isInactive}
    >
      <SelectTrigger
        className={
          desktopLayout
            ? "h-7 w-full px-1 text-sm"
            : cn("h-8 mt-1", {
                "line-through": isResolved,
              })
        }
      >
        <SelectValue placeholder={desktopLayout ? t("verify") : "Verify"} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ALLERGY_VERIFICATION_STATUS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const occurrencePicker = (
    <CombinedDatePicker
      value={
        allergy.last_occurrence ? new Date(allergy.last_occurrence) : undefined
      }
      onChange={(date) =>
        onUpdate?.({
          last_occurrence: dateQueryString(date),
        })
      }
      disabled={isInactive}
      buttonClassName={
        desktopLayout
          ? "h-7 text-sm px-2 justify-start font-normal w-full"
          : cn("h-7 text-sm px-2 justify-start font-normal w-full", {
              "line-through": isResolved,
            })
      }
    />
  );

  const statusButtons = (
    <div className="flex flex-col gap-2 col-span-2">
      {allergy.clinical_status !== "active" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onUpdate?.({
              clinical_status: "active",
            })
          }
          disabled={isInactive}
        >
          <CheckCircledIcon className="size-4 mr-2" />
          {t("mark_active")}
        </Button>
      )}
      {allergy.clinical_status !== "inactive" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onUpdate?.({
              clinical_status: "inactive",
            })
          }
          disabled={isInactive}
        >
          <CircleBackslashIcon className="size-4 mr-2" />
          {t("mark_inactive")}
        </Button>
      )}
      {allergy.clinical_status !== "resolved" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onUpdate?.({
              clinical_status: "resolved",
            })
          }
          disabled={isInactive}
        >
          <CheckCircledIcon className="size-4 mr-2 text-green-600" />
          {t("mark_resolved")}
        </Button>
      )}
    </div>
  );

  const notesInput = (
    <Input
      type="text"
      placeholder={t("add_notes_about_the_allergy")}
      value={allergy.note ?? ""}
      onChange={(e) => onUpdate?.({ note: e.target.value })}
      disabled={notesDisabled}
      className={cn(desktopLayout ? "mt-0.5" : "mt-1", {
        "line-through": isResolved,
      })}
    />
  );

  // Mobile view layout
  const formContent = (
    <div className="grid grid-cols-2 gap-2 space-y-4">
      <div>
        <Label className="text-sm text-gray-500">{t("criticality")}</Label>
        {criticalitySelect}
      </div>

      <div>
        <Label className="text-sm text-gray-500">{t("status")}</Label>
        {statusSelect}
      </div>

      <div className="col-span-2">
        <Label className="text-sm text-gray-500">{t("occurrence")}</Label>
        {occurrencePicker}
      </div>

      {statusButtons}

      <div className="col-span-2">
        <Label className="text-sm text-gray-500">{t("notes")}</Label>
        {notesInput}
      </div>
    </div>
  );

  if (desktopLayout) {
    return (
      <>
        <TableRow className={rowClassName}>
          <TableCell className="py-1 pr-0">{categorySelect}</TableCell>
          <TableCell className="font-medium py-1 pl-1">
            {allergy.code.display}
          </TableCell>
          <TableCell className="py-1 px-0.5">{criticalitySelect}</TableCell>
          <TableCell className="py-1 px-0.5">{statusSelect}</TableCell>
          <TableCell className="py-1 px-1">{occurrencePicker}</TableCell>
          <TableCell className="py-1 px-0 flex justify-center items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isInactive}
                  className="size-8"
                >
                  <DotsVerticalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleNotesToggle}>
                  <Pencil2Icon className="size-4 mr-2" />
                  {showNotes ? t("hide_notes") : t("add_notes")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {allergy.clinical_status !== "active" && (
                  <DropdownMenuItem
                    onClick={() =>
                      onUpdate?.({
                        clinical_status: "active",
                      })
                    }
                    disabled={isInactive}
                  >
                    <CheckCircledIcon className="size-4 mr-2" />
                    {t("mark_active")}
                  </DropdownMenuItem>
                )}
                {allergy.clinical_status !== "inactive" && (
                  <DropdownMenuItem
                    onClick={() =>
                      onUpdate?.({
                        clinical_status: "inactive",
                      })
                    }
                    disabled={isInactive}
                  >
                    <CircleBackslashIcon className="size-4 mr-2" />
                    {t("mark_inactive")}
                  </DropdownMenuItem>
                )}
                {allergy.clinical_status !== "resolved" && (
                  <DropdownMenuItem
                    onClick={() =>
                      onUpdate?.({
                        clinical_status: "resolved",
                      })
                    }
                    disabled={isInactive}
                  >
                    <CheckCircledIcon className="size-4 mr-2 text-green-600" />
                    {t("mark_resolved")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={onRemove}
                  disabled={allergy.verification_status === "entered_in_error"}
                >
                  <MinusCircledIcon className="size-4 mr-2" />
                  {allergy.verification_status === "entered_in_error"
                    ? t("already_marked_as_error")
                    : t("remove_allergy")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {showNotes && (
          <TableRow>
            <TableCell colSpan={6} className="px-4 py-2">
              <Label className="text-xs text-gray-500">{t("notes")}</Label>
              {notesInput}
            </TableCell>
          </TableRow>
        )}
      </>
    );
  }

  return formContent;
};
