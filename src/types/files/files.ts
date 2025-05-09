import { HttpMethod, Type } from "@/Utils/request/api";

export interface FileUploadQuestion {
  original_name: string;
  file_data: File;
  name: string;
  associating_id: string;
  file_type: string;
  file_category: string;
}

export const fileApi = {
  upload: {
    method: HttpMethod.POST,
    path: "/api/v1/files/upload-file/",
    TRes: Type<FileUploadQuestion>(),
  },
};
