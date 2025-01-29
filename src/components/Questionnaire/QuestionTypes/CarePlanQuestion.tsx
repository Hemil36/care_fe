import { DotsVerticalIcon, MinusCircledIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
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
import { Textarea } from "@/components/ui/textarea";

import {
  CARE_PLAN_INTENT,
  CARE_PLAN_LIFECYCLE_STATUS,
  CARE_PLAN_STATUS,
  CarePlanGoalRequest,
  CarePlanRequest,
  GoalTarget,
} from "@/types/emr/careplan/careplan";
import {
  QuestionnaireResponse,
  ResponseValue,
} from "@/types/questionnaire/form";
import { Question } from "@/types/questionnaire/question";

interface CarePlanQuestionProps {
  question: Question;
  questionnaireResponse: QuestionnaireResponse;
  updateQuestionnaireResponseCB: (
    values: ResponseValue[],
    questionId: string,
    note?: string,
  ) => void;
  disabled?: boolean;
  encounterId?: string;
  patientId: string;
  facilityId: string;
}

const sampleCodes = [
  {
    code: "8480-6",
    system: "http://loinc.org",
    display: "Systolic",
  },
  {
    code: "8462-4",
    system: "http://loinc.org",
    display: "Diastolic",
  },
  {
    code: "8867-4",
    system: "http://loinc.org",
    display: "Pulse",
  },
  {
    code: "8310-5",
    system: "http://loinc.org",
    display: "Temperature",
  },
  {
    code: "9279-1",
    system: "http://loinc.org",
    display: "Respiratory Rate",
  },
];

export default function CarePlanQuestion({
  questionnaireResponse,
  updateQuestionnaireResponseCB,
  disabled,
  patientId,
  encounterId,
  facilityId,
}: CarePlanQuestionProps) {
  const { t } = useTranslation();
  const careplans =
    (questionnaireResponse.values?.[0]
      ?.value as unknown as CarePlanRequest[]) || [];

  const handleUpdate = (index: number, updates: Partial<CarePlanRequest>) => {
    const newCarePlans = careplans.map((careplan, i) =>
      i === index ? { ...careplan, ...updates } : careplan,
    );

    updateQuestionnaireResponseCB(
      [{ type: "care_plan", value: newCarePlans }],
      questionnaireResponse.question_id,
    );
  };

  const handleGoalUpdate = (
    cpIndex: number,
    index: number,
    updates: Partial<CarePlanGoalRequest>,
  ) => {
    const newCarePlans = careplans.map((careplan, i) =>
      i === cpIndex
        ? {
            ...careplan,
            goals: careplan.goals?.map((goal, j) =>
              j === index ? { ...goal, ...updates } : goal,
            ),
          }
        : careplan,
    );

    updateQuestionnaireResponseCB(
      [{ type: "care_plan", value: newCarePlans }],
      questionnaireResponse.question_id,
    );
  };

  const handleGoalTargetUpdate = (
    cpIndex: number,
    goalIndex: number,
    index: number,
    updates: Partial<GoalTarget>,
  ) => {
    const newCarePlans = careplans.map((careplan, i) =>
      i === cpIndex
        ? {
            ...careplan,
            goals: careplan.goals?.map((goal, j) =>
              j === goalIndex
                ? {
                    ...goal,
                    target: goal.target?.map((target, k) =>
                      k === index ? { ...target, ...updates } : target,
                    ),
                  }
                : goal,
            ),
          }
        : careplan,
    );

    updateQuestionnaireResponseCB(
      [{ type: "care_plan", value: newCarePlans }],
      questionnaireResponse.question_id,
    );
  };

  return (
    <div>
      <div className="flex flex-col">
        {careplans.map((careplan, i) => (
          <div key={i} className="mb-10 pb-10 border-b">
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={disabled}
                    className="h-8 w-8"
                  >
                    <DotsVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      const newCarePlans = careplans.filter((_, j) => j !== i);
                      updateQuestionnaireResponseCB(
                        [{ type: "care_plan", value: newCarePlans }],
                        questionnaireResponse.question_id,
                      );
                    }}
                  >
                    <MinusCircledIcon className="h-4 w-4 mr-2" />
                    {t("remove")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("title")}</Label>
                <Input
                  type="text"
                  value={careplan.title}
                  onChange={(e) => handleUpdate(i, { title: e.target.value })}
                  disabled={disabled}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("careplan_status")}</Label>
                  <Select
                    value={careplan.status}
                    onValueChange={(value) =>
                      handleUpdate(i, {
                        status: value as CarePlanRequest["status"],
                      })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_status")} />
                    </SelectTrigger>
                    <SelectContent>
                      {CARE_PLAN_STATUS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(`${status}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("careplan_intent")}</Label>
                  <Select
                    value={careplan.intent}
                    onValueChange={(value) =>
                      handleUpdate(i, {
                        intent: value as CarePlanRequest["intent"],
                      })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_intent")} />
                    </SelectTrigger>
                    <SelectContent>
                      {CARE_PLAN_INTENT.map((intent) => (
                        <SelectItem key={intent} value={intent}>
                          {t(`${intent}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>{t("description")}</Label>
                <Textarea
                  value={careplan.description}
                  onChange={(e) =>
                    handleUpdate(i, { description: e.target.value })
                  }
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("start_date")}</Label>
                <DateTimePicker
                  value={
                    careplan.start_date
                      ? new Date(careplan.start_date)
                      : undefined
                  }
                  onChange={(date) => {
                    if (!date) return;
                    handleUpdate(i, { start_date: date.toISOString() });
                  }}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("end_date")}</Label>
                <DateTimePicker
                  value={
                    careplan.end_date ? new Date(careplan.end_date) : undefined
                  }
                  onChange={(date) => {
                    if (!date) return;
                    handleUpdate(i, { end_date: date.toISOString() });
                  }}
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="mt-6">
              {t("goals")}
              <div className="mt-4 flex flex-col gap-4">
                {careplan.goals?.map((goal, j) => (
                  <div
                    key={j}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200 relative"
                  >
                    <button
                      className="absolute top-2 right-2"
                      onClick={() => {
                        handleUpdate(i, {
                          goals: careplan.goals?.filter((_, k) => k !== j),
                        });
                      }}
                    >
                      <MinusCircledIcon className="h-4 w-4" />
                    </button>
                    <div className="space-y-2">
                      <Label>{t("description")}</Label>
                      <Input
                        type="text"
                        value={goal.description}
                        onChange={(e) =>
                          handleGoalUpdate(i, j, {
                            description: e.target.value,
                          })
                        }
                        disabled={disabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("lifecycle_status")}</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={t("select_status")} />
                        </SelectTrigger>
                        <SelectContent>
                          {CARE_PLAN_LIFECYCLE_STATUS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {t(`${status}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("priority")}</Label>
                      <Input
                        type="number"
                        value={goal.priority}
                        onChange={(e) =>
                          handleGoalUpdate(i, j, {
                            priority: parseInt(e.target.value),
                          })
                        }
                        disabled={disabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("start_date")}</Label>
                      <DateTimePicker
                        value={
                          goal.start_date
                            ? new Date(goal.start_date)
                            : undefined
                        }
                        onChange={(date) => {
                          if (!date) return;
                          handleGoalUpdate(i, j, {
                            start_date: date.toISOString(),
                          });
                        }}
                        disabled={disabled}
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="mb-2">{t("targets")}</div>
                      <div className="flex flex-col gap-2">
                        {goal.target?.map((target, k) => (
                          <div
                            key={k}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/5 rounded-lg p-2 relative"
                          >
                            <button
                              className="absolute top-2 right-2"
                              onClick={() => {
                                handleGoalUpdate(i, j, {
                                  target: goal.target?.filter(
                                    (_, l) => l !== k,
                                  ),
                                });
                              }}
                            >
                              <MinusCircledIcon className="h-4 w-4" />
                            </button>
                            <div className="space-y-2">
                              <Label>{t("measure")}</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={target.detail_integer}
                                  onChange={(e) =>
                                    handleGoalTargetUpdate(i, j, k, {
                                      detail_integer: Number(e.target.value),
                                    })
                                  }
                                  disabled={disabled}
                                />
                                <Select
                                  value={target.measure.code}
                                  onValueChange={(value) =>
                                    handleGoalTargetUpdate(i, j, k, {
                                      measure: {
                                        code: value as string,
                                        display: value as string,
                                        system: "",
                                      },
                                    })
                                  }
                                  disabled={disabled}
                                >
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={t("select_measure")}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {sampleCodes.map((code) => (
                                      <SelectItem
                                        key={code.code}
                                        value={code.code}
                                      >
                                        {code.display}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>{t("due_date")}</Label>
                              <DateTimePicker
                                value={
                                  target.due_date
                                    ? new Date(target.due_date)
                                    : undefined
                                }
                                onChange={(date) => {
                                  if (!date) return;
                                  handleGoalTargetUpdate(i, j, k, {
                                    due_date: date.toISOString(),
                                  });
                                }}
                                disabled={disabled}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        className="mt-2"
                        variant={"outline"}
                        onClick={() => {
                          handleGoalUpdate(i, j, {
                            target: [
                              ...(goal.target || []),
                              {
                                measure: { code: "", display: "", system: "" },
                                detail_quantity: {
                                  value: 0,
                                  unit: "",
                                },
                              },
                            ],
                          });
                        }}
                      >
                        {t("add_target")}
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  className="mt-2"
                  variant={"outline"}
                  onClick={() => {
                    handleUpdate(i, {
                      goals: [
                        ...(careplan.goals || []),
                        {
                          description: "",
                          target: [],
                          lifecycle_status: "proposed",
                          start_date: new Date().toISOString(),
                          achievement_status: "no-progress",
                          continuous: false,
                          priority: 1,
                        },
                      ],
                    });
                  }}
                >
                  {t("add_goal")}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button
        className="mt-2 w-full"
        variant={"outline"}
        onClick={() => {
          updateQuestionnaireResponseCB(
            [
              {
                type: "care_plan",
                value: [
                  ...careplans,
                  {
                    status: "active",
                    intent: "plan",
                    title: "",
                    description: "",
                    start_date: new Date().toISOString(),
                    end_date: new Date().toISOString(),
                    patient: patientId,
                    encounter: encounterId || "",
                    custodian: facilityId,
                    addresses: [],
                    goals: [],
                  },
                ],
              },
            ],
            questionnaireResponse.question_id,
          );
        }}
      >
        {t("add_care_plan")}
      </Button>
    </div>
  );
}
