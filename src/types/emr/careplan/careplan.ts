import { BaseModel } from "@/Utils/types";

export const CARE_PLAN_STATUS = [
  "draft",
  "active",
  "completed",
  "on-hold",
  "cancelled",
] as const;

export const CARE_PLAN_INTENT = [
  "proposal",
  "plan",
  "order",
  "option",
  "directive",
] as const;

export const CARE_PLAN_TASK_INTENT = [
  "unknown",
  "proposal",
  "plan",
  "order",
  "original-order",
  "reflex-order",
  "filler-order",
  "instance-order",
  "option",
] as const;

export const CARE_PLAN_LIFECYCLE_STATUS = [
  "proposed",
  "planned",
  "accepted",
  "active",
  "on-hold",
  "completed",
  "cancelled",
  "entered-in-error",
  "rejected",
] as const;

export const CARE_PLAN_ACHIEVEMENT_STATUS = [
  "in-progress",
  "improving",
  "worsening",
  "no-change",
  "achieved",
  "sustaining",
  "not-achieved",
  "no-progress",
  "not-attainable",
] as const;

export const CARE_PLAN_TASK_STATUS = [
  { name: "draft", color: "#e6e6e6" },
  { name: "requested", color: "#32c0f0" },
  { name: "received", color: "#32c0f0" },
  { name: "accepted", color: "#32c0f0" },
  { name: "rejected", color: "#ff3e17" },
  { name: "ready", color: "#32c0f0" },
  { name: "cancelled", color: "#ff3e17" },
  { name: "in-progress", color: "#f5d742" },
  { name: "on-hold", color: "#e6e6e6" },
  { name: "failed", color: "#ff3e17" },
  { name: "completed", color: "#6eff92" },
  { name: "entered-in-error", color: "#e6e6e6" },
] as const;

export const CARE_PLAN_TASK_PRIORITY = [
  "routine",
  "urgent",
  "asap",
  "stat",
] as const;

interface Code {
  code: string;
  display: string;
  system: string;
}

export interface CarePlan extends BaseModel, CarePlanRequest {}

export interface GoalTarget {
  measure: Code;
  detail_quantity?: any;
  detail_range?: unknown;
  detail_codeable_concept?: unknown;
  detail_string?: string;
  detail_boolean?: boolean;
  detail_integer?: number;
  detail_ratio?: unknown;
  due_date?: string;
}

export interface CarePlanGoalRequest {
  lifecycle_status: (typeof CARE_PLAN_LIFECYCLE_STATUS)[number];
  achievement_status: (typeof CARE_PLAN_ACHIEVEMENT_STATUS)[number];
  continuous: boolean;
  priority: number;
  description: string;
  start_date: string;
  source?: string;
  notes?: string;
  target?: GoalTarget[];
  permitted_groups?: unknown;
  updates?: GoalUpdateRequest[];
}

export interface CarePlanGoal extends BaseModel, CarePlanGoalRequest {
  care_plan: string;
  last_goal_update?: GoalUpdate;
  outcome?: unknown;
}

export interface GoalUpdateRequest {
  values: GoalTarget[];
  notes?: string;
  created_date: string;
}

export interface GoalUpdate
  extends BaseModel,
    Omit<GoalUpdateRequest, "created_date"> {
  goal: string;
}

export interface ActivityRequest {
  performed: boolean;
  task: TaskRequest;
}

export interface CarePlanRequest {
  status: (typeof CARE_PLAN_STATUS)[number];
  intent: (typeof CARE_PLAN_INTENT)[number];
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  patient: string;
  encounter: string;
  custodian: string;
  addresses: Code[];
  notes?: string;
  goals?: CarePlanGoalRequest[];
  activities?: ActivityRequest[];
}

export interface TaskRequest {
  status: (typeof CARE_PLAN_TASK_STATUS)[number]["name"];
  intent: (typeof CARE_PLAN_TASK_INTENT)[number];
  priority: (typeof CARE_PLAN_TASK_PRIORITY)[number];
  do_not_perform: boolean;
  code: Code;
  description: string;
  requested_period: {
    start: string;
    end: string;
  };
  notes?: string;
}
