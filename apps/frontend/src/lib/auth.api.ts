import { fetcher } from "./api";

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return fetcher<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
