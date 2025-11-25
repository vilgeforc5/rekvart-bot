import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  topicContentApi,
  type UpsertTopicContentData,
} from "../lib/topic-content.api";

export function TopicContent() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue } = useForm<UpsertTopicContentData>({
    defaultValues: {
      operatorConnectedMessage: "",
      operatorDisconnectedMessage: "",
    },
  });

  const { data: topicContent } = useQuery({
    queryKey: ["topicContent"],
    queryFn: () => topicContentApi.get(),
  });

  const upsertMutation = useMutation({
    mutationFn: (data: UpsertTopicContentData) => topicContentApi.upsert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topicContent"] });
    },
  });

  const onSubmit = (data: UpsertTopicContentData) => {
    upsertMutation.mutate(data);
  };

  useEffect(() => {
    if (topicContent) {
      setValue(
        "operatorConnectedMessage",
        topicContent.operatorConnectedMessage
      );
      setValue(
        "operatorDisconnectedMessage",
        topicContent.operatorDisconnectedMessage
      );
    }
  }, [topicContent, setValue]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Диалоги с оператором
      </h2>
      <h3 className="text-sm text-gray-500 font-semibold mb-6">
        Настройка сообщений для топиков диалогов
      </h3>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow rounded-lg p-6 space-y-6"
      >
        <div>
          <label
            htmlFor="operatorConnectedMessage"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Сообщение при подключении оператора{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("operatorConnectedMessage", { required: true })}
            id="operatorConnectedMessage"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
            placeholder="👋 Здравствуйте! К вам подключился оператор. Сейчас я отвечу на все ваши вопросы."
          />
        </div>

        <div>
          <label
            htmlFor="operatorDisconnectedMessage"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Сообщение при отключении оператора{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("operatorDisconnectedMessage", { required: true })}
            id="operatorDisconnectedMessage"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
            placeholder="👋 Оператор отключился от диалога."
          />
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={upsertMutation.isPending}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {upsertMutation.isPending ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </form>
    </div>
  );
}
