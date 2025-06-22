import { Permission } from "@/types/emr/permission/permission";

export interface Role {
  meta: Record<string, string>;
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  permissions: Permission[];
}
