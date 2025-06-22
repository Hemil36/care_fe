import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Edit, Plus, XCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import RoleForm from "@/components/Admin/RoleForm";
import Page from "@/components/Common/Page";

import useFilters from "@/hooks/useFilters";

import query from "@/Utils/request/query";
import { Role } from "@/types/emr/role/role";
import roleApi from "@/types/emr/role/roleApi";

export default function PermissionsIndex() {
  const { t } = useTranslation();
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { qParams, Pagination, resultsPerPage } = useFilters({
    limit: 15,
    disableCache: true,
  });
  const { data: response } = useQuery({
    queryKey: ["roles", qParams],
    queryFn: query(roleApi.listRoles, {
      queryParams: {
        limit: resultsPerPage,
        offset: ((qParams.page ?? 1) - 1) * resultsPerPage,
        name: qParams.name,
      },
    }),
  });

  const roles = response?.results || [];
  const allPermissions = roles.reduce(
    (acc, role) => {
      role.permissions.forEach((permission) => {
        if (!acc.find((p) => p.slug === permission.slug)) {
          acc.push(permission);
        }
      });
      return acc;
    },
    [] as (typeof roles)[0]["permissions"],
  );

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
  };

  const handleCloseEditSheet = () => {
    setEditingRole(null);
  };

  return (
    <Page title={t("roles")}>
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600 px-3 md:px-0">
          {t("manage_and_view_roles")}
        </p>
        <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              {t("create_role")}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{t("create_role")}</SheetTitle>
              <SheetDescription>
                {t("create_role_description")}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <RoleForm
                onSubmitSuccess={() => {
                  setIsCreateSheetOpen(false);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="overflow-auto h-[calc(100vh-12rem)] md:h-[calc(100vh-9rem)]">
        <div className="relative w-full p-1">
          <table className="w-full caption-bottom text-sm rounded-lg shadow-md z-20">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky top-0 left-0 z-20 whitespace-nowrap bg-white font-semibold">
                  {t("permission")}
                </TableHead>
                {roles.map((role) => (
                  <TableHead
                    key={role.id}
                    className="whitespace-nowrap h-32 max-w-8 min-w-8 sticky top-0 z-10 bg-white font-semibold"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-sm transform -rotate-90 w-24 px-2 -translate-x-1/3">
                        {role.name}
                      </div>
                      {!role.is_system && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-gray-100"
                          onClick={() => handleEditRole(role)}
                          title={t("edit_role")}
                        >
                          <Edit className="size-3" />
                        </Button>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPermissions.map((permission) => (
                <TableRow
                  key={permission.slug}
                  className="even:bg-gray-100 odd:bg-gray-50 hover:bg-gray-100"
                >
                  <TableCell className="sticky left-0 z-10 max-w-48 font-semibold bg-inherit whitespace-normal">
                    {permission.name}
                  </TableCell>
                  {roles.map((role) => {
                    const hasPermission = role.permissions.some(
                      (p) => p.slug === permission.slug,
                    );

                    return (
                      <TableCell key={role.id}>
                        <div className="w-8 flex items-center justify-center">
                          {hasPermission ? (
                            <CheckCircle2 className="size-5 text-green-500" />
                          ) : (
                            <XCircle className="size-5 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </table>
        </div>
      </div>

      {/* Edit Role Sheet */}
      <Sheet open={!!editingRole} onOpenChange={handleCloseEditSheet}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("edit_role")}</SheetTitle>
            <SheetDescription>{t("edit_role_description")}</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {editingRole && (
              <RoleForm
                role={editingRole}
                onSubmitSuccess={handleCloseEditSheet}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Pagination totalCount={response?.count ?? 0} />
    </Page>
  );
}
