import {
  ChevronRight,
  EllipsisVerticalIcon,
  LogOut,
  SquarePen,
  User2Icon,
} from "lucide-react";
import { Link } from "raviger";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Avatar } from "@/components/Common/Avatar";

import useAuthUser, { useAuthContext } from "@/hooks/useAuthUser";

import { formatDisplayName } from "@/Utils/utils";
import { getOrgLabel } from "@/types/organization/organization";

export default function UserDashboard() {
  const user = useAuthUser();
  const { signOut } = useAuthContext();
  const facilities = user.facilities || [];
  const { t } = useTranslation();

  const organizations = user.organizations || [];
  const associations =
    organizations.filter((org) => org.org_type === "role") || [];
  const administrations =
    organizations.filter((org) => org.org_type === "govt") || [];

  const [activeTab, setActiveTab] = useState("My Facilities");
  const tabs = ["My Facilities", "Associations", "Administrations"];

  return (
    <div className="container mx-auto space-y-4 md:space-y-8 max-w-5xl px-4 py-4 md:p-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between gap-4 bg-card p-4 md:p-6 rounded-lg border shadow-sm w-full  mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Avatar
              name={formatDisplayName(user)}
              imageUrl={user.read_profile_picture_url}
              className="h-20 w-20 md:h-24 md:w-24 rounded-full"
            />
            <div className="space-y-1 text-center sm:text-left">
              <div>
                <p className="text-sm md:text-base text-gray-500">
                  {t("welcome_back")}
                </p>
                <h1 className="text-xl md:text-2xl">
                  {user.user_type === "doctor"
                    ? t("welcome_dr", { name: user.first_name })
                    : user.first_name}
                </h1>
              </div>
              <p className="text-sm md:text-base text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              {t("sign_out")}
            </Button>
            {user.is_superuser && (
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                asChild
              >
                <Link
                  href="/admin/questionnaire"
                  className="gap-2 text-inherit flex items-center"
                >
                  <User2Icon className="h-4 w-4" />
                  {t("admin_dashboard")}
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              asChild
            >
              <Link
                href={`/users/${user.username}`}
                className="gap-2 text-inherit flex items-center"
              >
                <SquarePen className="h-4 w-4" />
                {t("edit_profile")}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto
              asChild"
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {user.user_type === "doctor" && (
          <div className="flex items-center justify-center py-1 md:py-2 bg-card bg-indigo-50 text-indigo-900 rounded-lg border border-indigo-200 shadow-sm w-full  mx-auto">
            {t("welcome_dr_banner")}
          </div>
        )}
      </div>

      {/* Tabs Section */}
      <div className="w-full">
        {/* Tabs Headings */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-md font-medium transition-all duration-75 ${
                activeTab === tab
                  ? "border-b-2 border-green-600 text-green-700"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tabs Content */}
        <div className="mt-4">
          {/* Facilities Section */}
          {activeTab === "My Facilities" && facilities.length > 0 && (
            <section className="space-y-3 md:space-y-4">
              <p className="text-sm text-gray-800 font-normal px-1">
                {t("dashboard_tab_facilities")}
              </p>
              <div
                className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                data-cy="facility-list"
              >
                {facilities.map((facility) => (
                  <Link
                    key={facility.id}
                    href={`/facility/${facility.id}/overview`}
                  >
                    <Card className="transition-all hover:shadow-md hover:border-primary/20">
                      <CardContent className="flex items-center gap-3 p-3 md:p-4">
                        <Avatar
                          name={facility.name}
                          className="h-12 w-12 md:h-14 md:w-14"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate text-sm md:text-base">
                            {facility.name}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-500 truncate">
                            {t("view_facility_details")}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/*Associations Section*/}
          {activeTab === "Associations" && associations.length > 0 && (
            <section className="space-y-3 md:space-y-4">
              <p className="text-sm text-gray-800 font-normal px-1">
                {t("dashboard_tab_associations")}
              </p>
              <div
                className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                data-cy="organization-list"
              >
                {associations.map((association) => (
                  <Link
                    key={association.id}
                    href={`/organization/${association.id}`}
                  >
                    <Card className="transition-all hover:shadow-md hover:border-primary/20">
                      <CardContent className="flex items-center gap-3 p-3 md:p-4">
                        <Avatar
                          name={association.name}
                          className="h-12 w-12 md:h-14 md:w-14"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate text-sm md:text-base">
                            {association.name}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-500 truncate">
                            {getOrgLabel(
                              association.org_type,
                              association.metadata,
                            )}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/*Administrations Section*/}
          {activeTab === "Administrations" && administrations.length > 0 && (
            <section className="space-y-3 md:space-y-4">
              <p className="text-sm text-gray-800 font-normal px-1">
                {t("dashboard_tab_administrations")}
              </p>
              <div
                className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                data-cy="organization-list"
              >
                {administrations.map((administration) => (
                  <Link
                    key={administration.id}
                    href={`/organization/${administration.id}`}
                  >
                    <Card className="transition-all hover:shadow-md hover:border-primary/20">
                      <CardContent className="flex items-center gap-3 p-3 md:p-4">
                        <Avatar
                          name={administration.name}
                          className="h-12 w-12 md:h-14 md:w-14"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate text-sm md:text-base">
                            {administration.name}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-500 truncate">
                            {getOrgLabel(
                              administration.org_type,
                              administration.metadata,
                            )}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
