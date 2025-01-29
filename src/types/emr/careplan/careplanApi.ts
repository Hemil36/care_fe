import dayjs from "dayjs";

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

const dummyGoalUpdates: GoalUpdate[] = [
  {
    id: "12345",
    created_date: "2025-01-28T10:30:00Z",
    modified_date: "2025-01-28T10:45:00Z",
    created_by: dummyUser,
    updated_by: dummyUser,
    goal: "12345",
    values: [
      {
        measure: {
          code: "8302-2",
          display: "Body temperature",
          system: "LOINC",
        },
        detail_quantity: {
          value: 37.5,
          unit: "Cel",
          system: "http://unitsofmeasure.org",
          code: "Cel",
        },
        due_date: "2025-01-28T10:45:00Z",
      },
    ],
  },
  {
    id: "123456",
    created_date: "2025-01-27T10:30:00Z",
    modified_date: "2025-01-27T10:45:00Z",
    created_by: dummyUser,
    updated_by: dummyUser,
    goal: "12345",
    values: [
      {
        measure: {
          code: "8302-2",
          display: "Body temperature",
          system: "LOINC",
        },
        detail_quantity: {
          value: 38.0,
          unit: "Cel",
          system: "http://unitsofmeasure.org",
          code: "Cel",
        },
        due_date: "2025-01-27T10:45:00Z",
      },
    ],
  },
  {
    id: "1234567",
    created_date: "2025-01-26T10:30:00Z",
    modified_date: "2025-01-26T10:45:00Z",
    created_by: dummyUser,
    updated_by: dummyUser,
    goal: "12345",
    values: [
      {
        measure: {
          code: "8302-2",
          display: "Body temperature",
          system: "LOINC",
        },
        detail_quantity: {
          value: 37.7,
          unit: "Cel",
          system: "http://unitsofmeasure.org",
          code: "Cel",
        },
        due_date: "2025-01-27T10:45:00Z",
      },
    ],
  },
];

const dummyGoals: CarePlanGoal[] = [
  {
    care_plan: "12345",
    id: "12345",
    created_date: "2025-01-28T10:30:00Z",
    modified_date: "2025-01-28T10:45:00Z",
    lifecycle_status: "accepted",
    achievement_status: "improving",
    continuous: true,
    priority: 1,
    description: "Reduce patient temperature to below 37°C",
    start_date: "2025-01-01",
    created_by: dummyUser,
    updated_by: dummyUser,
    last_goal_update: dummyGoalUpdates
      .filter((goal) => goal.goal === "12345")
      .sort((a, b) =>
        dayjs(a.modified_date).isAfter(dayjs(b.modified_date)) ? -1 : 1,
      )[0],
    target: [
      {
        measure: {
          code: "8302-2",
          display: "Body temperature",
          system: "LOINC",
        },
        detail_quantity: {
          value: 37,
          unit: "Cel",
          system: "http://unitsofmeasure.org",
          code: "Cel",
        },
        due_date: "2025-01-28T10:45:00Z",
      },
    ],
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
