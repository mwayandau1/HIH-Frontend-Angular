export interface Document {
  id: string;
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  documentType: string;
  description: string;
  uploadedBy: string;
  uploadDate: Date;
  downloadUrl: string;
}

export interface UploadData {
  file: File;
  documentType: string;
  patientId: string;
}
