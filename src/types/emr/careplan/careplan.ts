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
