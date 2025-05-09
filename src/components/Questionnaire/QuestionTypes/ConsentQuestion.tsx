import { t } from "i18next";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import CareIcon from "@/CAREUI/icons/CareIcon";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import useFileUpload from "@/hooks/useFileUpload";

import { BACKEND_ALLOWED_EXTENSIONS } from "@/common/constants";

import {
  CONSENT_CATEGORIES,
  CONSENT_DECISIONS,
  CONSENT_STATUSES,
  CreateConsentQuestion,
} from "@/types/consent/consent";
import { QuestionValidationError } from "@/types/questionnaire/batch";
import {
  QuestionnaireResponse,
  ResponseValue,
} from "@/types/questionnaire/form";
import { Question } from "@/types/questionnaire/question";

interface FilesQuestionProps {
  question: Question;
  questionnaireResponse: QuestionnaireResponse;
  updateQuestionnaireResponseCB: (
    values: ResponseValue[],
    questionId: string,
    note?: string,
  ) => void;
  disabled?: boolean;
  errors: QuestionValidationError[];
  encounterId: string;
}

const ConsentBlock = ({
  value,
  handleUpdate,
  handleRemove,
}: {
  value: Partial<CreateConsentQuestion>;
  handleUpdate: (value: Partial<CreateConsentQuestion>) => void;
  handleRemove: () => void;
}) => {
  const fileUpload = useFileUpload({
    type: "consent",
    allowedExtensions: BACKEND_ALLOWED_EXTENSIONS,
    allowNameFallback: false,
    compress: false,
  });

  useEffect(() => {
    if (fileUpload.files.length) {
      handleUpdate({
        ...value,
        file: fileUpload.files[0],
      });
    } else {
      handleUpdate({
        ...value,
        file: undefined,
      });
    }
  }, [fileUpload.files]);

  return (
    <div className="border p-4 rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 flex flex-col">
          <Label>{t("consent_given_on")}</Label>
          <DatePicker
            date={value.date}
            onChange={(date) => handleUpdate({ date })}
          />
        </div>
        <div className="space-y-1  flex flex-col">
          <Label>{t("consent_valid_from")}</Label>
          <DatePicker
            date={value.period?.start}
            onChange={(date) =>
              handleUpdate({ period: { ...value.period, start: date } })
            }
          />
        </div>
        <div className="space-y-1  flex flex-col">
          <Label>{t("consent_valid_until")}</Label>
          <DatePicker
            date={value.period?.end}
            onChange={(date) =>
              handleUpdate({ period: { ...value.period, end: date } })
            }
          />
        </div>
      </div>

      <div className="space-y-1 mt-2">
        <Label>{t("consent_decision")}</Label>
        <Select
          value={value.decision}
          onValueChange={(decision) =>
            handleUpdate({
              decision: decision as CreateConsentQuestion["decision"],
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("select_consent_decision")} />
          </SelectTrigger>
          <SelectContent>
            {CONSENT_DECISIONS.map((decision) => (
              <SelectItem key={decision} value={decision}>
                {t(`consent_decision__${decision}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-2 space-y-1">
        <Label>{t("category")}</Label>
        <Select
          value={value.category}
          onValueChange={(category) =>
            handleUpdate({
              category: category as CreateConsentQuestion["category"],
            })
          }
        >
          <SelectTrigger>
            <SelectValue
              placeholder={t("select_category")}
              className="flex justify-start items-center w-full"
            >
              {value.category
                ? t(`consent_category__${value.category}`)
                : t("select_category")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CONSENT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">
                    {t(`consent_category__${category}`)}
                  </p>
                  <p className="text-xs text-gray-500 whitespace-normal">
                    {t(`consent_category__${category}_description`)}
                  </p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-2 space-y-1">
        <Label>{t("status")}</Label>
        <Select
          value={value.status}
          onValueChange={(status) =>
            handleUpdate({ status: status as CreateConsentQuestion["status"] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("select_status")} />
          </SelectTrigger>
          <SelectContent>
            {CONSENT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {t(`consent_status__${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {value.file ? (
        <div>{value.file.name}</div>
      ) : (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"secondary"}
                className="border border-secondary-300"
              >
                <CareIcon icon="l-file-upload-alt" />
                {t("attach_file")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[calc(100vw-2.5rem)] sm:w-full"
            >
              <DropdownMenuItem
                className="flex flex-row items-center"
                onSelect={(e) => {
                  e.preventDefault();
                }}
              >
                <Label className="py-1 flex flex-row items-center cursor-pointer text-primary-900  w-full">
                  <CareIcon icon="l-file-upload-alt" className="mr-1" />
                  <span>{t("choose_file")}</span>

                  {fileUpload.Input({
                    className: "hidden",
                  })}
                </Label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fileUpload.handleCameraCapture()}
                  className="flex flex-row justify-stretch items-center w-full text-primary-900"
                >
                  <CareIcon icon="l-camera" />
                  <span>{t("open_camera")}</span>
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fileUpload.handleAudioCapture()}
                  className="flex flex-row justify-stretch items-center w-full text-primary-900"
                >
                  <CareIcon icon="l-microphone" />
                  <span>{t("record")}</span>
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {fileUpload.Dialogues}
        </>
      )}
      <div className="mt-2 flex justify-end">
        <Button variant={"secondary"} onClick={handleRemove}>
          <CareIcon icon="l-times-circle" />
          {t("remove")}
        </Button>
      </div>
    </div>
  );
};

export function ConsentQuestion(props: FilesQuestionProps) {
  const { questionnaireResponse, updateQuestionnaireResponseCB, encounterId } =
    props;

  const { t } = useTranslation();

  const values =
    (questionnaireResponse.values?.[0]?.value as CreateConsentQuestion[]) || [];

  const handleUpdate = (
    updates: Partial<CreateConsentQuestion>,
    index: number,
  ) => {
    updateQuestionnaireResponseCB(
      [
        {
          type: "consent",
          value: values.map((v, i) => (i === index ? { ...v, ...updates } : v)),
        },
      ],
      questionnaireResponse.question_id,
      questionnaireResponse.note,
    );
  };

  const handleAdd = (value: Partial<CreateConsentQuestion>) => {
    updateQuestionnaireResponseCB(
      [
        {
          type: "consent",
          value: [...values, value as CreateConsentQuestion],
        },
      ],
      questionnaireResponse.question_id,
      questionnaireResponse.note,
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        {values.map((value, index) => (
          <ConsentBlock
            value={value}
            key={index}
            handleUpdate={(v) => handleUpdate(v, index)}
            handleRemove={() =>
              updateQuestionnaireResponseCB(
                [
                  {
                    type: "consent",
                    value: values.filter((_, i) => i !== index),
                  },
                ],
                questionnaireResponse.question_id,
                questionnaireResponse.note,
              )
            }
          />
        ))}
      </div>
      <Button
        variant={"secondary"}
        className="w-full mt-4"
        onClick={() => {
          handleAdd({
            decision: "permit",
            category: "treatment",
            status: "active",
            date: new Date(),
            period: {
              start: new Date(),
              end: undefined,
            },
            encounter: encounterId,
            verification_details: [],
            source_attachments: [],
          });
        }}
      >
        <CareIcon icon="l-plus" />
        {t("link_consent")}
      </Button>
    </div>
  );
}
