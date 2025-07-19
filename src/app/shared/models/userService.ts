export interface ChangeUserPassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface FetchParams {
  sort?: string[];
  page?: number;
  size?: number;
  department?: string;
  role?: string;
  active?: boolean;
  search?: string;
}
