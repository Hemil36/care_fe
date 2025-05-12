import { HttpMethod, Type } from "@/Utils/request/api";

import { FileUploadQuestion } from "./files";

export const fileApi = {
  upload: {
    method: HttpMethod.POST,
    path: "/api/v1/files/upload-file/",
    TRes: Type<FileUploadQuestion>(),
  },
};
