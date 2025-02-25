import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";

import { LocationList as LocationListType } from "@/types/location/location";

import { LocationCard } from "./components/LocationCard";

interface Props {
  locations: LocationListType[];
  onEdit: (location: LocationListType) => void;
}

export default function LocationList(props: Props) {
  const { locations, onEdit } = props;
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {locations?.length ? (
        locations.map((location) => (
          <LocationCard key={location.id} location={location} onEdit={onEdit} />
        ))
      ) : (
        <Card className="col-span-full">
          <CardContent className="p-6 text-center text-gray-500">
            {t("no_locations_found")}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
