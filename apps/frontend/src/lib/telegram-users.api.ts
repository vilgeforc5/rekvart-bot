import { fetcher, type FetchOptions } from "./api";

export interface TelegramUser {
  id: number;
  chatId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  autoMessageCount: number;
  isSubscribedToAutomessage: boolean;
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
  getAll: (
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string;
      hasPhone?: boolean;
      hasFormSubmissions?: boolean;
    },
    options?: FetchOptions
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.hasPhone !== undefined) {
      params.append("hasPhone", filters.hasPhone.toString());
    }
    if (filters?.hasFormSubmissions !== undefined) {
      params.append(
        "hasFormSubmissions",
        filters.hasFormSubmissions.toString()
      );
    }
    return fetcher<PaginatedTelegramUsers>(
      `/telegram-users?${params.toString()}`,
      { ...options, method: "GET" }
    );
  },

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
