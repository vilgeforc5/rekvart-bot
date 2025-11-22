import { toast } from "sonner";
import { fetcher, type FetchOptions } from "./api";

export interface DizaynContent {
  id: number;
  title: string;
  description: string;
  telegramUrl: string;
  whatsappUrl: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertDizaynContentData {
  title: string;
  description: string;
  telegramUrl: string;
  whatsappUrl: string;
  email: string;
}

export const dizaynApi = {
  get: (options?: FetchOptions) =>
    fetcher<DizaynContent | null>("/api/dizayn", {
      ...options,
      method: "GET",
    }),

  upsert: async (data: UpsertDizaynContentData, options?: FetchOptions) => {
    try {
      const result = await fetcher<DizaynContent>("/api/dizayn", {
        ...options,
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Контент дизайна успешно сохранен");
      return result;
    } catch (error) {
      toast.error(
        `Ошибка при сохранении: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
      throw error;
    }
  },
};
