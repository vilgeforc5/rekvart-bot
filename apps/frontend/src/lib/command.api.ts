import type {
  Command,
  CreateCommandDto,
  UpdateCommandDto,
} from "backend/src/command/command.dto";
import { toast } from "sonner";
import { fetcher, type FetchOptions } from "./api";

export type { Command, CreateCommandDto, UpdateCommandDto };

export type CommandFormData = CreateCommandDto;

export const commandApi = {
  getAll: (options?: FetchOptions) =>
    fetcher<Command[]>("/command", { ...options, method: "GET" }),

  create: async (data: CreateCommandDto, options?: FetchOptions) => {
    try {
      const result = await fetcher<Command>("/command", {
        ...options,
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Команда успешно создана");
      return result;
    } catch (error) {
      toast.error(
        `Ошибка при создании команды: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
      throw error;
    }
  },

  update: async (
    id: number,
    data: UpdateCommandDto,
    options?: FetchOptions
  ) => {
    try {
      const result = await fetcher<Command>(`/command/${id}`, {
        ...options,
        method: "PUT",
        body: JSON.stringify(data),
      });
      toast.success("Команда успешно обновлена");
      return result;
    } catch (error) {
      toast.error(
        `Ошибка при обновлении команды: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
      throw error;
    }
  },

  delete: async (id: number, options?: FetchOptions) => {
    try {
      const result = await fetcher<Command>(`/command/${id}`, {
        ...options,
        method: "DELETE",
      });
      toast.success("Команда успешно удалена");
      return result;
    } catch (error) {
      toast.error(
        `Ошибка при удалении команды: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
      throw error;
    }
  },
};
