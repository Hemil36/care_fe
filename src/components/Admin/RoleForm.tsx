import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import mutate from "@/Utils/request/mutate";
import query from "@/Utils/request/query";
import { Permission } from "@/types/emr/permission/permission";
import permissionApi from "@/types/emr/permission/permissionApi";
import { Role } from "@/types/emr/role/role";
import roleApi from "@/types/emr/role/roleApi";

interface RoleFormProps {
  role?: Role;
  onSubmitSuccess?: () => void;
}

const roleFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  permissions: z
    .array(z.string())
    .min(1, "At least one permission is required"),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

export default function RoleForm({ role, onSubmitSuccess }: RoleFormProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEditMode = !!role?.id;
  const isSystemRole = role?.is_system;

  // Fetch all available permissions using the permissions API
  const { data: permissionsResponse, isLoading: isLoadingPermissions } =
    useQuery({
      queryKey: ["permissions"],
      queryFn: query(permissionApi.listPermissions, {
        queryParams: { limit: 1000 },
      }),
    });

  const permissions = permissionsResponse?.results || [];

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  useEffect(() => {
    if (role && isEditMode) {
      form.reset({
        name: role.name,
        description: role.description,
        permissions: role.permissions.map((p) => p.slug),
      });
    }
  }, [role, form, isEditMode]);

  const { mutate: createRole, isPending: isCreating } = useMutation({
    mutationFn: mutate(roleApi.createRole),
    onSuccess: () => {
      toast.success(t("role_created_successfully"));
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      form.reset();
      onSubmitSuccess?.();
    },
    onError: (_error) => {
      toast.error(t("failed_to_create_role"));
    },
  });

  const { mutate: updateRole, isPending: isUpdating } = useMutation({
    mutationFn: mutate(roleApi.updateRole, {
      pathParams: { external_id: role?.id || "" },
    }),
    onSuccess: () => {
      toast.success(t("role_updated_successfully"));
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      onSubmitSuccess?.();
    },
    onError: (_error) => {
      toast.error(t("failed_to_update_role"));
    },
  });

  const onSubmit = (data: RoleFormValues) => {
    const payload = {
      name: data.name,
      description: data.description,
      permissions: data.permissions,
    };

    if (isEditMode) {
      updateRole(payload);
    } else {
      createRole(payload);
    }
  };

  const isPending = isCreating || isUpdating;
  const isDisabled = isPending || isSystemRole;

  if (isLoadingPermissions) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading_permissions")}</p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isSystemRole && (
          <Alert>
            <AlertDescription>{t("system_role_edit_warning")}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("enter_role_name")}
                  {...field}
                  disabled={isDisabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("description")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("enter_role_description")}
                  {...field}
                  disabled={isDisabled}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="permissions"
          render={() => (
            <FormItem>
              <FormLabel>{t("permissions")}</FormLabel>
              <div className="space-y-3 max-h-64 overflow-y-auto border rounded-md p-4">
                {permissions.length > 0 ? (
                  permissions.map((permission: Permission) => (
                    <FormField
                      key={permission.slug}
                      control={form.control}
                      name="permissions"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={permission.slug}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(permission.slug)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...field.value,
                                        permission.slug,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== permission.slug,
                                        ),
                                      );
                                }}
                                disabled={isDisabled}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                {permission.name}
                              </FormLabel>
                              {permission.description && (
                                <p className="text-xs text-muted-foreground">
                                  {permission.description}
                                </p>
                              )}
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    {t("no_permissions_available")}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="submit"
            disabled={isDisabled || !form.formState.isValid}
            className="gap-2"
          >
            <Plus className="size-4" />
            {isPending
              ? isEditMode
                ? t("updating")
                : t("creating")
              : isEditMode
                ? t("update_role")
                : t("create_role")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
