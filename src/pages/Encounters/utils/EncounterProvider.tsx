import { useQuery } from "@tanstack/react-query";
import { useQueryParams } from "raviger";
import { createContext, useContext } from "react";

import routes from "@/Utils/request/api";
import query from "@/Utils/request/query";
import { PaginatedResponse } from "@/Utils/request/types";
import { Encounter } from "@/types/emr/encounter";
import { Patient } from "@/types/emr/patient";

type EncounterContextType = {
  currentEncounterId: string;
  facilityId?: string;
  patientId: string;
  selectedEncounterId: string;

  patient: Patient | undefined;
  currentEncounter: Encounter | undefined;
  pastEncounters: PaginatedResponse<Encounter> | undefined;
  selectedEncounter: Encounter | undefined;
  isPatientLoading: boolean;
  isCurrentEncounterLoading: boolean;
  isSelectedEncounterLoading: boolean;
  isPastEncountersLoading: boolean;
  setSelectedEncounter: (encounterId: string | null) => void;
};

const encounterContext = createContext<EncounterContextType | undefined>(
  undefined,
);

export function EncounterProvider({
  children,
  encounterId,
  facilityId,
  patientId,
}: {
  children: React.ReactNode;
  encounterId: string;
  facilityId?: string;
  patientId: string;
}) {
  const currentEncounterId = encounterId;
  const [{ selectedEncounter: selectedEncounterId = encounterId }, setQParams] =
    useQueryParams();

  const { data: patient, isLoading: isPatientLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: query(routes.patient.getPatient, {
      pathParams: { id: patientId },
    }),
  });

  const { data: currentEncounter, isLoading: isCurrentEncounterLoading } =
    useQuery({
      queryKey: ["encounter", currentEncounterId],
      queryFn: query(routes.encounter.get, {
        pathParams: { id: currentEncounterId },
        queryParams: facilityId
          ? { facility: facilityId }
          : { patient: patientId },
      }),
    });

  const { data: selectedEncounter, isLoading: isSelectedEncounterLoading } =
    useQuery({
      queryKey: ["encounter", selectedEncounterId],
      queryFn: query(routes.encounter.get, {
        pathParams: { id: selectedEncounterId },
        queryParams: facilityId
          ? { facility: facilityId }
          : { patient: patientId },
      }),
    });

  const { data: encounters, isLoading: isPastEncountersLoading } = useQuery({
    queryKey: ["encounters", "past", patientId],
    queryFn: query(routes.encounter.list, {
      queryParams: { patient: patientId },
    }),
  });

  const setSelectedEncounter = (encounterId: string | null) => {
    setQParams(
      { selectedEncounter: encounterId },
      { replace: false, overwrite: false },
    );
  };

  return (
    <encounterContext.Provider
      value={{
        currentEncounterId,
        facilityId: facilityId ?? currentEncounter?.facility.id,
        patientId,
        selectedEncounterId,
        patient,
        currentEncounter,
        pastEncounters: {
          ...encounters,
          results:
            encounters?.results.filter(
              (encounter) => encounter.id !== currentEncounterId,
            ) ?? [],
          count: encounters?.count ?? 0,
        },
        selectedEncounter,
        isPatientLoading,
        isCurrentEncounterLoading,
        isSelectedEncounterLoading,
        isPastEncountersLoading,
        setSelectedEncounter,
      }}
    >
      {children}
    </encounterContext.Provider>
  );
}

export function useEncounter() {
  const context = useContext(encounterContext);
  if (!context) {
    throw new Error("useEncounter must be used within an EncounterProvider");
  }
  return context;
}
