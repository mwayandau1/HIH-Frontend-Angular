export interface PermissionsResponse {
  success: boolean;
  message: string;
  data: Permission[];
}
export interface Permission {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}
