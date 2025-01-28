import { UserBareMinimum } from "@/components/Users/models";

import { HttpMethod, Type } from "@/Utils/request/api";
import { PaginatedResponse } from "@/Utils/request/types";

import { CarePlan } from "./careplan";

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

const dummyCarePlans: CarePlan[] = [
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

export const DummyCarePlanGet: () => Promise<
  PaginatedResponse<CarePlan>
> = async () => {
  return {
    count: 1,
    next: "",
    previous: "",
    results: dummyCarePlans,
  };
};

export const DummyCarePlanRetrieve: (
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
