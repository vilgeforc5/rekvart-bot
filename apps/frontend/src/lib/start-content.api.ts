import { toast } from "sonner";
import { fetcher, type FetchOptions } from "./api";

export interface StartContent {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertStartContentData {
  content: string;
}

export const startContentApi = {
  get: (options?: FetchOptions) =>
    fetcher<StartContent | null>("/api/start-content", {
      ...options,
      method: "GET",
    }),

  upsert: async (data: UpsertStartContentData, options?: FetchOptions) => {
    try {
      const result = await fetcher<StartContent>("/api/start-content", {
        ...options,
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Текст /start успешно сохранен");
      return result;
    } catch (error) {
      toast.error(
        `Ошибка при сохранении текста: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
      throw error;
    }
  },
};
