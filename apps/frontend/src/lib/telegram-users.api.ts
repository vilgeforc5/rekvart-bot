import { fetcher, type FetchOptions } from "./api";

export interface TelegramUser {
  id: number;
  chatId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    formSubmissions: number;
  };
}

export interface FormSubmission {
  id: number;
  commandName: string;
  data: Record<string, string>;
  telegramUserId: number;
  createdAt: string;
}

export interface PaginatedTelegramUsers {
  users: TelegramUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const telegramUsersApi = {
  getAll: (page: number = 1, limit: number = 10, options?: FetchOptions) =>
    fetcher<PaginatedTelegramUsers>(
      `/telegram-users?page=${page}&limit=${limit}`,
      { ...options, method: "GET" }
    ),

  getOne: (id: number, options?: FetchOptions) =>
    fetcher<TelegramUser>(`/telegram-users/${id}`, {
      ...options,
      method: "GET",
    }),

  getUserSubmissions: (userId: number, options?: FetchOptions) =>
    fetcher<FormSubmission[]>(`/telegram-users/${userId}/submissions`, {
      ...options,
      method: "GET",
    }),
};
