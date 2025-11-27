import { toast } from "sonner";
import { fetcher, type FetchOptions } from "./api";

export interface ProektPriceContent {
  id: number;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertProektPriceContentData {
  message: string;
}

export const proektPriceApi = {
  get: (options?: FetchOptions) =>
    fetcher<ProektPriceContent | null>("/api/proekt-price", {
      ...options,
      method: "GET",
    }),

  upsert: async (
    data: UpsertProektPriceContentData,
    options?: FetchOptions
  ) => {
    try {
      const result = await fetcher<ProektPriceContent>("/api/proekt-price", {
        ...options,
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Контент успешно сохранен");
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
