import { toast } from "sonner";
import { fetcher, type FetchOptions } from "./api";

export interface CalculateVariant {
  id: number;
  text: string;
  order: number;
  needsPhone: boolean;
}

export interface CalculateQuestion {
  id: number;
  text: string;
  type: "select" | "text" | "phone";
  order: number;
  variants: CalculateVariant[];
}

export interface CalculateConfig {
  questions: CalculateQuestion[];
  summary: string;
}

export interface CreateCalculateVariantDto {
  text: string;
  order: number;
  needsPhone?: boolean;
}

export interface UpdateCalculateVariantDto {
  id?: number;
  text: string;
  order: number;
  needsPhone?: boolean;
}

export interface CreateCalculateQuestionDto {
  text: string;
  type: string;
  order: number;
  variants?: CreateCalculateVariantDto[];
}

export interface UpdateCalculateQuestionDto {
  text?: string;
  type?: string;
  order?: number;
  variants?: UpdateCalculateVariantDto[];
}

export const calculateApi = {
  getConfig: (options?: FetchOptions) =>
    fetcher<CalculateConfig>("/calculate/config", {
      ...options,
      method: "GET",
    }),

  getAllQuestions: (options?: FetchOptions) =>
    fetcher<CalculateQuestion[]>("/calculate/questions", {
      ...options,
      method: "GET",
    }),

  getQuestion: (id: number, options?: FetchOptions) =>
    fetcher<CalculateQuestion>(`/calculate/questions/${id}`, {
      ...options,
      method: "GET",
    }),

  createQuestion: async (
    data: CreateCalculateQuestionDto,
    options?: FetchOptions
  ) => {
    try {
      const result = await fetcher<CalculateQuestion>("/calculate/questions", {
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
    data: UpdateCalculateQuestionDto,
    options?: FetchOptions
  ) => {
    try {
      const result = await fetcher<CalculateQuestion>(
        `/calculate/questions/${id}`,
        {
          ...options,
          method: "PUT",
          body: JSON.stringify(data),
        }
      );
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
      await fetcher<{ success: boolean }>(`/calculate/questions/${id}`, {
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
    fetcher<{ message: string }>("/calculate/summary", {
      ...options,
      method: "GET",
    }),

  updateSummary: async (message: string, options?: FetchOptions) => {
    try {
      await fetcher<{ success: boolean }>("/calculate/summary", {
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
