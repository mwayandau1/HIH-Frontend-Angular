export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  id: string;
  name: string;
  roles: Role[];
}

export interface LoginRequest {
  email: string;
  password: string;
}
export interface Role {
  id: number;
  name: string;
  description: string;
}
