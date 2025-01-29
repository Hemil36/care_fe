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
}

export interface CarePlanGoal extends BaseModel, CarePlanGoalRequest {
  care_plan: string;
  last_goal_update?: GoalUpdate;
  outcome?: unknown;
}

export interface GoalUpdate extends BaseModel {
  goal: string;
  values: GoalTarget[];
  notes?: string;
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
}
