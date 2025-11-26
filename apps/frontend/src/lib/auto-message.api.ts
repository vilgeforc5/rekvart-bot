import { fetcher, type FetchOptions } from "./api";

export interface AutoMessageConfig {
  id: number;
  scheduleHour: number;
  scheduleMinute: number;
  lastSentAt: string | null;
  notificationText: string;
  unsubscribeButtonText: string;
  unsubscribeSuccessText: string;
  resubscribeSuccessText: string;
  resubscribeButtonText: string;
  unsubscribeToggleText: string;
  errorText: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAutoMessageConfigDto {
  scheduleHour: number;
  scheduleMinute: number;
  notificationText?: string;
  unsubscribeButtonText?: string;
  unsubscribeSuccessText?: string;
  resubscribeSuccessText?: string;
  resubscribeButtonText?: string;
  unsubscribeToggleText?: string;
  errorText?: string;
}

export interface BroadcastResult {
  sent: number;
  failed: number;
  unsubscribeShown: number;
}

export const autoMessageApi = {
  getConfig: (options?: FetchOptions) =>
    fetcher<AutoMessageConfig | null>("/api/auto-message/config", {
      ...options,
      method: "GET",
    }),

  updateConfig: (data: UpdateAutoMessageConfigDto, options?: FetchOptions) =>
    fetcher<AutoMessageConfig>("/api/auto-message/config", {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  testBroadcast: (options?: FetchOptions) =>
    fetcher<BroadcastResult>("/api/auto-message/broadcast", {
      ...options,
      method: "POST",
    }),
};
