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

export interface CarePlan extends BaseModel {
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
}

export interface CarePlanGoal extends BaseModel {
  care_plan: string;
  lifecycle_status: (typeof CARE_PLAN_LIFECYCLE_STATUS)[number];
  achievement_status: (typeof CARE_PLAN_ACHIEVEMENT_STATUS)[number];
  is_continuous: boolean;
  priority: number;
  description: string;
  start_date: string;
  requested_by_patient: boolean;
  notes?: string;
  outcome?: unknown;
  targets?: unknown;
  permitted_groups?: unknown;
}

export interface GoalUpdate extends BaseModel {
  goal: string;
  target_values: unknown;
  notes?: string;
}
