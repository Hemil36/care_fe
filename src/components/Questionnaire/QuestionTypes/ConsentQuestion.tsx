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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import useAuthUser from "@/hooks/useAuthUser";
import useFileUpload from "@/hooks/useFileUpload";

import { BACKEND_ALLOWED_EXTENSIONS } from "@/common/constants";

import {
  CONSENT_CATEGORIES,
  CONSENT_DECISIONS,
  CONSENT_STATUSES,
  CreateConsentRequest,
  VERIFICATION_TYPES,
} from "@/types/consent/consent";
import { FileUploadQuestion } from "@/types/files/files";
import { QuestionValidationError } from "@/types/questionnaire/batch";
import {
  QuestionnaireResponse,
  ResponseValue,
} from "@/types/questionnaire/form";
import { Question } from "@/types/questionnaire/question";
import { validateFields } from "@/types/questionnaire/validation";

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
  index,
  handleUpdate,
  handleRemove,
}: {
  value: Partial<CreateConsentRequest>;
  index: number;
  handleUpdate: (value: Partial<CreateConsentRequest>) => void;
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
        file_data: fileUpload.files[0],
        original_name: fileUpload.files[0].name,
        file_name: fileUpload.files[0].name,
      });
    } else {
      handleUpdate({
        ...value,
        file_data: undefined,
        original_name: undefined,
        file_name: undefined,
      });
    }
  }, [fileUpload.files]);

  return (
    <div className="border p-4 rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 flex flex-col">
          <Label>{t("consent_date")}</Label>
          <DatePicker
            date={value.date}
            onChange={(date) => handleUpdate({ date })}
          />
        </div>
        <div className="space-y-1  flex flex-col">
          <Label>{t("consent_period_start_date")}</Label>
          <DatePicker
            date={value.period?.start}
            onChange={(date) =>
              handleUpdate({ period: { ...value.period, start: date } })
            }
          />
        </div>
        <div className="space-y-1  flex flex-col">
          <Label>{t("consent_period_end_date")}</Label>
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
              decision: decision as CreateConsentRequest["decision"],
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
              category: category as CreateConsentRequest["category"],
            })
          }
        >
          <SelectTrigger>
            <SelectValue
              placeholder={t("select_category")}
              className="flex justify-start items-center w-full"
            />
          </SelectTrigger>
          <SelectContent>
            {CONSENT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                <p>{t(`consent_category__${category}`)}</p>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-xs text-blue-600 bg-blue-100 rounded-md p-2 mt-1">
          {t(`consent_category__${value.category}_description`)}
        </div>
      </div>

      <div className="mt-2 space-y-1">
        <Label>{t("status")}</Label>
        <Select
          value={value.status}
          onValueChange={(status) =>
            handleUpdate({ status: status as CreateConsentRequest["status"] })
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

      <div className="mt-2 space-y-1">
        <Label>{t("consent_verification_type")}</Label>
        <Select
          value={value.verification_details?.[0]?.verification_type}
          onValueChange={(verification_type) =>
            handleUpdate({
              verification_details: [
                {
                  ...value.verification_details?.[0],
                  verification_type:
                    verification_type as CreateConsentRequest["verification_details"][0]["verification_type"],
                },
              ],
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("select_verification_type")} />
          </SelectTrigger>
          <SelectContent>
            {VERIFICATION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`consent_verification_type__${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {value.file_data ? (
        <div>{value.original_name}</div>
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
    (questionnaireResponse.values?.[0]?.value as CreateConsentRequest[]) || [];

  const handleUpdate = (
    updates: Partial<CreateConsentRequest>,
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

  const handleAdd = (value: Partial<CreateConsentRequest>) => {
    updateQuestionnaireResponseCB(
      [
        {
          type: "consent",
          value: [...values, value as CreateConsentRequest],
        },
      ],
      questionnaireResponse.question_id,
      questionnaireResponse.note,
    );
  };

  const authUser = useAuthUser();

  return (
    <div>
      <div className="flex flex-col gap-4">
        {values.map((value, index) => (
          <ConsentBlock
            value={value}
            key={index}
            handleUpdate={(v) => handleUpdate(v, index)}
            index={index}
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
            verification_details: [
              {
                verified: true,
                verified_by: {
                  id: authUser.external_id,
                  first_name: authUser.first_name,
                  last_name: authUser.last_name,
                  phone_number: authUser.phone_number || "",
                  user_type: authUser.user_type,
                  gender: authUser.gender || "non_binary",
                  username: authUser.username,
                  email: authUser.email || "",
                  prefix: authUser.prefix || "",
                  suffix: authUser.suffix || "",
                  mfa_enabled: authUser.mfa_enabled || false,
                  last_login: authUser.last_login || new Date().toISOString(),
                  profile_picture_url: authUser.read_profile_picture_url || "",
                },
                verification_date: new Date().toISOString(),
                verification_type: "validation",
              },
            ],
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
