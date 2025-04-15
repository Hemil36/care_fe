import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  CalendarRange,
  CheckCircle,
  ChevronLeft,
  Download,
  FileText,
  XCircle,
} from "lucide-react";
import { Link, usePathParams } from "raviger";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import CareIcon from "@/CAREUI/icons/CareIcon";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import Loading from "@/components/Common/Loading";
import Page from "@/components/Common/Page";
import PageHeadTitle from "@/components/Common/PageHeadTitle";
import { FileUploadModel } from "@/components/Patient/models";

import useFileManager from "@/hooks/useFileManager";

import routes from "@/Utils/request/api";
import query from "@/Utils/request/query";
import { formatDateTime } from "@/Utils/utils";
import consentApi from "@/types/consent/consentApi";

export function ConsentDetailPage() {
  const { t } = useTranslation();
  const { facilityId, patientId, encounterId, consentId } =
    usePathParams(
      "/facility/:facilityId/patient/:patientId/encounter/:encounterId/consents/:consentId",
    ) ?? {};

  // Load consent data
  const { data: consent, isLoading: isLoadingConsent } = useQuery({
    queryKey: ["consent", consentId],
    queryFn: query(consentApi.retrieve, {
      pathParams: { patientId: patientId!, id: consentId! },
    }),
    enabled: !!consentId && !!patientId,
  });

  // Load encounter data for permissions
  const { isLoading: isLoadingEncounter } = useQuery({
    queryKey: ["encounter", encounterId],
    queryFn: query(routes.encounter.get, {
      pathParams: { id: encounterId! },
      queryParams: { patient: patientId! },
    }),
    enabled: !!encounterId && !!patientId,
  });

  // Load file data for the primary attachment
  const attachmentId = consent?.source_attachments[0]?.id;
  const { data: fileData, isLoading: isLoadingFile } = useQuery({
    queryKey: ["file_upload", attachmentId],
    queryFn: query(routes.retrieveUpload, {
      pathParams: { id: attachmentId! },
    }),
    enabled: !!attachmentId,
  });

  const fileManager = useFileManager({
    type: "consent",
    uploadedFiles:
      consent?.source_attachments.map((attachment) => {
        if (fileData && fileData.id === attachment.id) {
          return fileData;
        }
        return attachment;
      }) || [],
    onArchive: () => {},
    onEdit: () => {},
  });

  const isLoading = isLoadingConsent || isLoadingFile || isLoadingEncounter;

  if (isLoading) {
    return <Loading />;
  }

  if (!consent) {
    return (
      <Page title={t("consent_not_found")}>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <FileText className="size-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {t("consent_not_found")}
          </h2>
          <p className="text-gray-500 mb-4">
            {t("consent_not_found_description")}
          </p>
          <Link
            href={`/facility/${facilityId}/patient/${patientId}/encounter/${encounterId}`}
            className="text-primary hover:underline flex items-center gap-2"
          >
            <ChevronLeft className="size-4" />
            {t("back_to_encounter")}
          </Link>
        </div>
      </Page>
    );
  }

  const attachment = consent.source_attachments[0];
  const associatingId = consent.id;

  const DetailButtons = ({ file }: { file: FileUploadModel }) => {
    return (
      <div className="flex flex-row gap-2 justify-end">
        {fileManager.isPreviewable(file) && (
          <Button
            variant="secondary"
            onClick={() => fileManager.viewFile(file, associatingId)}
          >
            <span className="flex flex-row items-center gap-1">
              <CareIcon icon="l-eye" />
              {t("view")}
            </span>
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => fileManager.downloadFile(file, associatingId)}
        >
          <span className="flex flex-row items-center gap-1">
            <Download className="size-4 mr-1" />
            {t("download")}
          </span>
        </Button>
      </div>
    );
  };

  return (
    <Page title={t("consent_details")}>
      <div className="mb-4 flex justify-between items-center">
        <Link
          href={`/facility/${facilityId}/patient/${patientId}/encounter/${encounterId}/consents`}
          className="flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="mr-1 size-4" />
          {t("back")}
        </Link>
      </div>
      <PageHeadTitle title={t("consent_details")} />
      <div className="container mx-auto py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {consent.source_attachments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  {t("supporting_documents")}
                </h3>
                <Card>
                  <div className="p-4">
                    <div className="divide-y">
                      {consent.source_attachments.map((attachment, index) => {
                        const isActive =
                          fileData && fileData.id === attachment.id;
                        return (
                          <div
                            key={attachment.id}
                            className={cn(
                              "py-3 flex items-center justify-between",
                              isActive && "bg-primary-50",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium",
                                )}
                              >
                                {index + 1}
                              </div>
                              <div>
                                <p className="text-sm font-medium break-all">
                                  {attachment.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDateTime(attachment.created_date)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {fileData && (
                                <div className="mt-4 flex justify-end">
                                  {fileData && (
                                    <DetailButtons file={fileData} />
                                  )}
                                  {fileManager.Dialogues}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Right column - Consent details */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {t("consent_details")}
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("category")}
                  </h3>
                  <Badge
                    variant="outline"
                    className="mt-1 border border-gray-700"
                  >
                    <span className="font-semibold text-sm text-gray-700">
                      {t(`consent_category__${consent.category}`)}
                    </span>
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("consent_date")}
                  </h3>
                  <p className="flex items-center gap-2 mt-1">
                    <Calendar className="size-4 text-gray-500" />
                    <span>{formatDateTime(consent.date, "MMMM D, YYYY")}</span>
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("consent_period")}
                  </h3>
                  <p className="flex items-center gap-2 mt-1">
                    <CalendarRange className="size-4 text-gray-500" />
                    <span>
                      {consent.period.start
                        ? formatDateTime(consent.period.start, "MMMM D, YYYY")
                        : t("NA")}
                      {" - "}
                      {consent.period.end
                        ? formatDateTime(consent.period.end, "MMMM D, YYYY")
                        : t("NA")}
                    </span>
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("decision")}
                  </h3>
                  <div className="mt-1">
                    {consent.decision === "permit" ? (
                      <Badge
                        className="flex gap-1 items-center py-1"
                        variant="primary"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {t("permitted")}
                      </Badge>
                    ) : (
                      <Badge
                        variant="destructive"
                        className="flex gap-1 items-center py-1"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        {t("denied")}
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {t("status")}
                  </h3>
                  <Badge
                    variant={
                      consent.status === "active" ? "primary" : "secondary"
                    }
                    className="mt-1"
                  >
                    {t(`consent_status__${consent.status}`)}
                  </Badge>
                </div>

                {attachment && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      {t("file")}
                    </h3>
                    <p className="text-sm mt-1 break-all">{attachment.name}</p>
                  </div>
                )}

                {consent.note && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {t("note")}
                      </h3>
                      <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {consent.note}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {consent.verification_details &&
                  consent.verification_details.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          {t("verification_details")}
                        </h3>
                        <div className="mt-2 space-y-2">
                          {consent.verification_details.map(
                            (verification, index) => (
                              <div
                                key={index}
                                className="p-3 bg-gray-50 border border-gray-200 rounded-md"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    {formatDateTime(
                                      verification.verification_date,
                                    )}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {t(
                                      `consent_verification_type__${verification.verification_type}`,
                                    )}
                                  </Badge>
                                </div>
                                <p className="text-sm mt-1">
                                  {t("verified_by")}:{" "}
                                  {verification.verified_by.username}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </>
                  )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Page>
  );
}
