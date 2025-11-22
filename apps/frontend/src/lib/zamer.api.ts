import { toast } from "sonner";
import { fetcher, type FetchOptions } from "./api";

export interface ZamerVariant {
  id: number;
  text: string;
  order: number;
  needsPhone: boolean;
}

export interface ZamerQuestion {
  id: number;
  text: string;
  type: "select" | "text" | "phone";
  order: number;
  variants: ZamerVariant[];
}

export interface ZamerConfig {
  questions: ZamerQuestion[];
  summary: string;
}

export interface CreateZamerVariantDto {
  text: string;
  order: number;
  needsPhone?: boolean;
}

export interface UpdateZamerVariantDto {
  id?: number;
  text: string;
  order: number;
  needsPhone?: boolean;
}

export interface CreateZamerQuestionDto {
  text: string;
  type: string;
  order: number;
  variants?: CreateZamerVariantDto[];
}

export interface UpdateZamerQuestionDto {
  text?: string;
  type?: string;
  order?: number;
  variants?: UpdateZamerVariantDto[];
}

export const zamerApi = {
  getConfig: (options?: FetchOptions) =>
    fetcher<ZamerConfig>("/zamer/config", { ...options, method: "GET" }),

  getAllQuestions: (options?: FetchOptions) =>
    fetcher<ZamerQuestion[]>("/zamer/questions", { ...options, method: "GET" }),

  getQuestion: (id: number, options?: FetchOptions) =>
    fetcher<ZamerQuestion>(`/zamer/questions/${id}`, {
      ...options,
      method: "GET",
    }),

  createQuestion: async (
    data: CreateZamerQuestionDto,
    options?: FetchOptions
  ) => {
    try {
      const result = await fetcher<ZamerQuestion>("/zamer/questions", {
        ...options,
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Вопрос успешно создан");
      return result;
    } catch (error) {
      toast.error(
        `Ошибка при создании вопроса: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
      throw error;
    }
  },

  updateQuestion: async (
    id: number,
    data: UpdateZamerQuestionDto,
    options?: FetchOptions
  ) => {
    try {
      const result = await fetcher<ZamerQuestion>(`/zamer/questions/${id}`, {
        ...options,
        method: "PUT",
        body: JSON.stringify(data),
      });
      toast.success("Вопрос успешно обновлен");
      return result;
    } catch (error) {
      toast.error(
        `Ошибка при обновлении вопроса: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
      throw error;
    }
  },

  deleteQuestion: async (id: number, options?: FetchOptions) => {
    try {
      await fetcher<{ success: boolean }>(`/zamer/questions/${id}`, {
        ...options,
        method: "DELETE",
      });
      toast.success("Вопрос успешно удален");
    } catch (error) {
      toast.error(
        `Ошибка при удалении вопроса: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
      throw error;
    }
  },

  getSummary: (options?: FetchOptions) =>
    fetcher<{ message: string }>("/zamer/summary", {
      ...options,
      method: "GET",
    }),

  updateSummary: async (message: string, options?: FetchOptions) => {
    try {
      await fetcher<{ success: boolean }>("/zamer/summary", {
        ...options,
        method: "PUT",
        body: JSON.stringify({ message }),
      });
      toast.success("Итоговое сообщение успешно обновлено");
    } catch (error) {
      toast.error(
        `Ошибка при обновлении итогового сообщения: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
      throw error;
    }
  },
};
