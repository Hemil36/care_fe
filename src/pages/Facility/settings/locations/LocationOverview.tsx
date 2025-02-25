import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import CareIcon from "@/CAREUI/icons/CareIcon";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CardGridSkeleton } from "@/components/Common/SkeletonLoading";

import query from "@/Utils/request/query";
import { LocationList as LocationListType } from "@/types/location/location";
import locationApi from "@/types/location/locationApi";

import LocationList from "./LocationList";
import LocationMap from "./LocationMap";
import LocationSheet from "./LocationSheet";

export default function LocationOverview(props: { facilityId: string }) {
  const { facilityId } = props;
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] =
    useState<LocationListType | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["locations", facilityId],
    queryFn: query.debounced(locationApi.list, {
      pathParams: { facility_id: facilityId },
      queryParams: {
        parent: "",
        offset: 0,
        limit: 12,
        name: searchQuery || undefined,
      },
    }),
  });

  const { data: mappedData, isLoading: isMapLoading } = useQuery({
    queryKey: ["locations-map", facilityId],
    queryFn: query(locationApi.getMapped, {
      pathParams: { facility_id: facilityId },
      queryParams: {
        parent: "",
      },
    }),
  });

  const handleEditLocation = (location: LocationListType) => {
    setSelectedLocation(location);
    setIsSheetOpen(true);
  };
  const handleAddLocation = () => {
    setSelectedLocation(null);
    setIsSheetOpen(true);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setSelectedLocation(null);
  };

  return (
    <div>
      <Tabs defaultValue="list">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{t("locations")}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <TabsList className="bg-gray-200 py-0 w-fit">
              <TabsTrigger value="list" className="gap-2">
                <CareIcon icon="l-list-ul" />
                {t("list")}
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-2">
                <CareIcon icon="l-sitemap" />
                {t("map")}
              </TabsTrigger>
            </TabsList>
            <Input
              className="w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search_by_name")}
            />
            <Button variant="primary" onClick={handleAddLocation}>
              <CareIcon icon="l-plus" className="h-4 w-4 mr-2" />
              {t("add_location")}
            </Button>
          </div>
        </div>
        <div>
          <TabsContent value="list">
            {isLoading ? (
              <CardGridSkeleton count={6} />
            ) : (
              <LocationList
                locations={data?.results || []}
                onEdit={handleEditLocation}
              />
            )}
          </TabsContent>
          <TabsContent value="map">
            {isMapLoading ? (
              <Skeleton className="h-4 w-[250px]" />
            ) : (
              <LocationMap locations={mappedData || []} />
            )}
          </TabsContent>
        </div>
      </Tabs>
      <LocationSheet
        open={isSheetOpen}
        onOpenChange={handleSheetClose}
        facilityId={facilityId}
        location={selectedLocation || undefined}
      />
    </div>
  );
}
