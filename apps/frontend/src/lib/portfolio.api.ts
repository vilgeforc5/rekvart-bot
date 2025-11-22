import { toast } from "sonner";
import { fetcher, type FetchOptions } from "./api";

export interface Portfolio {
  id: number;
  title: string;
  description: string | null;
  imgSrc: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePortfolioDto {
  title: string;
  description?: string | null;
  imgSrc: string[];
}

export interface UpdatePortfolioDto {
  title?: string;
  description?: string | null;
  imgSrc?: string[];
}

export const portfolioApi = {
  getAll: (options?: FetchOptions) =>
    fetcher<Portfolio[]>("/portfolio", { ...options, method: "GET" }),

  getOne: (id: number, options?: FetchOptions) =>
    fetcher<Portfolio>(`/portfolio/${id}`, { ...options, method: "GET" }),

  create: async (data: CreatePortfolioDto, options?: FetchOptions) => {
    try {
      const result = await fetcher<Portfolio>("/portfolio", {
        ...options,
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Проект успешно создан");
      return result;
    } catch (error) {
      toast.error(
        `Ошибка при создании проекта: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
      throw error;
    }
  },

  update: async (
    id: number,
    data: UpdatePortfolioDto,
    options?: FetchOptions
  ) => {
    try {
      const result = await fetcher<Portfolio>(`/portfolio/${id}`, {
        ...options,
        method: "PUT",
        body: JSON.stringify(data),
      });
      toast.success("Проект успешно обновлен");
      return result;
    } catch (error) {
      toast.error(
        `Ошибка при обновлении проекта: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
      throw error;
    }
  },

  delete: async (id: number, options?: FetchOptions) => {
    try {
      await fetcher<void>(`/portfolio/${id}`, {
        ...options,
        method: "DELETE",
      });
      toast.success("Проект успешно удален");
    } catch (error) {
      toast.error(
        `Ошибка при удалении проекта: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
      throw error;
    }
  },
};
