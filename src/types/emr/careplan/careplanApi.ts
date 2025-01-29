import { UserBareMinimum } from "@/components/Users/models";

import { HttpMethod, Type } from "@/Utils/request/api";
import { PaginatedResponse } from "@/Utils/request/types";

import { CarePlan, CarePlanGoal, GoalUpdate } from "./careplan";

const dummyUser: UserBareMinimum = {
  id: 1,
  first_name: "District",
  last_name: "Admin",
  last_login: "2025-01-28T07:38:56.574089Z",
  user_type: "staff",
  username: "devdistrictadmin",
  email: "sample@email.com",
  external_id: "123",
};

const dummyGoals: CarePlanGoal[] = [
  {
    care_plan: "12345",
    id: "12345",
    created_date: "2025-01-28T10:30:00Z",
    modified_date: "2025-01-28T10:45:00Z",
    lifecycle_status: "accepted",
    achievement_status: "achieved",
    is_continuous: true,
    priority: 1,
    description: "Reduce patient temperature to below 37°C",
    start_date: "2025-01-01",
    requested_by_patient: false,
    created_by: dummyUser,
    updated_by: dummyUser,
  },
];

const dummyGoalUpdates: GoalUpdate[] = [
  {
    id: "12345",
    created_date: "2025-01-28T10:30:00Z",
    modified_date: "2025-01-28T10:45:00Z",
    created_by: dummyUser,
    updated_by: dummyUser,
    goal: "12345",
    target_values: {},
  },
];

const dummyCarePlans: CarePlan[] = [
  {
    id: "12345",
    created_date: "2025-01-28T10:30:00Z",
    modified_date: "2025-01-28T10:45:00Z",
    status: "active",
    intent: "plan",
    title: "Fever Management Plan",
    description:
      "A care plan designed to manage the patient's fever with regular check-ups and medication adherence.",
    start_date: "2025-01-01",
    end_date: "2025-12-31",
    patient: "patient-001",
    encounter: "encounter-456",
    custodian: "Dr. John Doe",
    addresses: [
      {
        code: "E11",
        display: "Type 2 diabetes mellitus without complications",
        system: "ICD-10",
      },
      {
        code: "R73.03",
        display: "Prediabetes",
        system: "ICD-10",
      },
    ],
    notes:
      "Patient to follow up every three months with the care team. Adherence to medication and diet plan is critical for achieving desired outcomes.",
    created_by: dummyUser,
    updated_by: dummyUser,
  },
  {
    id: "12345",
    created_date: "2025-01-28T10:30:00Z",
    modified_date: "2025-01-28T10:45:00Z",
    status: "active",
    intent: "plan",
    title: "Chronic Condition Management Plan",
    description:
      "A care plan designed to manage the patient's chronic diabetes condition with regular check-ups and medication adherence.",
    start_date: "2025-01-01",
    end_date: "2025-1-21",
    patient: "patient-001",
    encounter: "encounter-456",
    custodian: "Dr. John Doe",
    addresses: [
      {
        code: "E11",
        display: "Type 2 diabetes mellitus without complications",
        system: "ICD-10",
      },
      {
        code: "R73.03",
        display: "Prediabetes",
        system: "ICD-10",
      },
    ],
    notes:
      "Patient to follow up every three months with the care team. Adherence to medication and diet plan is critical for achieving desired outcomes.",
    created_by: dummyUser,
    updated_by: dummyUser,
  },
  {
    id: "12345",
    created_date: "2025-01-28T10:30:00Z",
    modified_date: "2025-01-28T10:45:00Z",
    status: "active",
    intent: "plan",
    title: "Chronic Condition Management Plan",
    description:
      "A care plan designed to manage the patient's chronic diabetes condition with regular check-ups and medication adherence.",
    start_date: "2025-02-01",
    end_date: "2025-12-31",
    patient: "patient-001",
    encounter: "encounter-456",
    custodian: "Dr. John Doe",
    addresses: [
      {
        code: "E11",
        display: "Type 2 diabetes mellitus without complications",
        system: "ICD-10",
      },
      {
        code: "R73.03",
        display: "Prediabetes",
        system: "ICD-10",
      },
    ],
    notes:
      "Patient to follow up every three months with the care team. Adherence to medication and diet plan is critical for achieving desired outcomes.",
    created_by: dummyUser,
    updated_by: dummyUser,
  },
];

export const dummyCarePlanGoalList: (
  id: string,
) => Promise<PaginatedResponse<CarePlanGoal>> = async (id: string) => {
  return {
    count: 1,
    next: "",
    previous: "",
    results: dummyGoals.filter((goal) => goal.care_plan === id),
  };
};

export const dummyCarePlanGoalRetrieve: (
  id: string,
) => Promise<CarePlanGoal | undefined> = async (id: string) => {
  return dummyGoals.find((goal) => goal.id === id);
};

export const dummyCarePlanGoalUpdateList: (
  id: string,
) => Promise<PaginatedResponse<GoalUpdate>> = async (id: string) => {
  return {
    count: 1,
    next: "",
    previous: "",
    results: dummyGoalUpdates.filter((update) => update.goal === id),
  };
};

export const dummyCarePlanList: () => Promise<
  PaginatedResponse<CarePlan>
> = async () => {
  return {
    count: 1,
    next: "",
    previous: "",
    results: dummyCarePlans,
  };
};

export const dummyCarePlanRetrieve: (
  id: string,
) => Promise<CarePlan | undefined> = async (id: string) => {
  return dummyCarePlans.find((cp) => cp.id === id);
};

export default {
  getCarePlans: {
    path: "/api/v1/patient/{patientId}/care_plan/",
    method: HttpMethod.GET,
    TRes: Type<PaginatedResponse<CarePlan>>(),
  },
  retrieveCarePlan: {
    path: "/api/v1/patient/{patientId}/care_plan/{carePlanId}/",
    method: HttpMethod.GET,
    TRes: Type<CarePlan>(),
  },
};
