import { toast } from "sonner";
import { fetcher, type FetchOptions } from "./api";

export interface ConsultacyaVariant {
  id: number;
  text: string;
  order: number;
  needsPhone: boolean;
}

export interface ConsultacyaQuestion {
  id: number;
  text: string;
  order: number;
  variants: ConsultacyaVariant[];
}

export interface ConsultacyaConfig {
  questions: ConsultacyaQuestion[];
  summary: string;
}

export interface CreateConsultacyaVariantDto {
  text: string;
  order: number;
  needsPhone?: boolean;
}

export interface UpdateConsultacyaVariantDto {
  id?: number;
  text: string;
  order: number;
  needsPhone?: boolean;
}

export interface CreateConsultacyaQuestionDto {
  text: string;
  order: number;
  variants?: CreateConsultacyaVariantDto[];
}

export interface UpdateConsultacyaQuestionDto {
  text?: string;
  order?: number;
  variants?: UpdateConsultacyaVariantDto[];
}

export const consultacyaApi = {
  getConfig: (options?: FetchOptions) =>
    fetcher<ConsultacyaConfig>("/consultacya/config", {
      ...options,
      method: "GET",
    }),

  getAllQuestions: (options?: FetchOptions) =>
    fetcher<ConsultacyaQuestion[]>("/consultacya/questions", {
      ...options,
      method: "GET",
    }),

  getQuestion: (id: number, options?: FetchOptions) =>
    fetcher<ConsultacyaQuestion>(`/consultacya/questions/${id}`, {
      ...options,
      method: "GET",
    }),

  createQuestion: async (
    data: CreateConsultacyaQuestionDto,
    options?: FetchOptions
  ) => {
    try {
      const result = await fetcher<ConsultacyaQuestion>(
        "/consultacya/questions",
        {
          ...options,
          method: "POST",
          body: JSON.stringify(data),
        }
      );
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
    data: UpdateConsultacyaQuestionDto,
    options?: FetchOptions
  ) => {
    try {
      const result = await fetcher<ConsultacyaQuestion>(
        `/consultacya/questions/${id}`,
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
      await fetcher<{ success: boolean }>(`/consultacya/questions/${id}`, {
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
    fetcher<{ message: string }>("/consultacya/summary", {
      ...options,
      method: "GET",
    }),

  updateSummary: async (message: string, options?: FetchOptions) => {
    try {
      await fetcher<{ success: boolean }>("/consultacya/summary", {
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
