import { navigate } from "raviger";

import QuestionnaireEditor from "@/components/Questionnaire/QuestionnaireEditor";
import { QuestionnaireList } from "@/components/Questionnaire/QuestionnaireList";
import { ValueSetEditor } from "@/components/ValueSet/ValueSetEditor";
import { ValueSetList } from "@/components/ValueSet/ValueSetList";

import { AppRoutes } from "@/Routers/AppRouter";
import PermissionsIndex from "@/pages/Admin/Role/PermissionsIndex";

const AdminRoutes: AppRoutes = {
  "/admin/questionnaire": () => <QuestionnaireList />,
  "/admin/questionnaire/create": () => <QuestionnaireEditor />,
  "/admin/questionnaire/:id/edit": ({ id }) => <QuestionnaireEditor id={id} />,
  "/admin/valuesets": () => <ValueSetList />,
  "/admin/valuesets/create": () => (
    <ValueSetEditor onSuccess={() => navigate(`/admin/valuesets`)} />
  ),
  "/admin/valuesets/:slug/edit": ({ slug }) => <ValueSetEditor slug={slug} />,
  "/admin/roles": () => <PermissionsIndex />,
};

export default AdminRoutes;
