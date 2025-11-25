import { toast } from "sonner";
import { fetcher, type FetchOptions } from "./api";

export interface TopicContent {
  id: number;
  operatorConnectedMessage: string;
  operatorDisconnectedMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertTopicContentData {
  operatorConnectedMessage: string;
  operatorDisconnectedMessage: string;
}

export const topicContentApi = {
  get: (options?: FetchOptions) =>
    fetcher<TopicContent | null>("/api/topic-content", {
      ...options,
      method: "GET",
    }),

  upsert: async (data: UpsertTopicContentData, options?: FetchOptions) => {
    try {
      const result = await fetcher<TopicContent>("/api/topic-content", {
        ...options,
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Сообщения диалогов успешно сохранены");
      return result;
    } catch (error) {
      toast.error(
        `Ошибка при сохранении сообщений: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
      throw error;
    }
  },
};
