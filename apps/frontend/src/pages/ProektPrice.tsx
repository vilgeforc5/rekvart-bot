import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  proektPriceApi,
  type UpsertProektPriceContentData,
} from "../lib/proekt-price.api";

export function ProektPrice() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue } =
    useForm<UpsertProektPriceContentData>({
      defaultValues: {
        message: "",
      },
    });

  const { data: proektPriceContent } = useQuery({
    queryKey: ["proektPriceContent"],
    queryFn: () => proektPriceApi.get(),
  });

  const upsertMutation = useMutation({
    mutationFn: (data: UpsertProektPriceContentData) =>
      proektPriceApi.upsert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proektPriceContent"] });
    },
  });

  const onSubmit = (data: UpsertProektPriceContentData) => {
    upsertMutation.mutate(data);
  };

  useEffect(() => {
    if (proektPriceContent) {
      setValue("message", proektPriceContent.message);
    }
  }, [proektPriceContent, setValue]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Проект Прайс</h2>
      <h3 className="text-sm text-gray-500 font-semibold mb-6">
        Настройка контента для команды /proekt_price
      </h3>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow rounded-lg p-6 space-y-6"
      >
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Сообщение <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("message", { required: true })}
            id="message"
            rows={15}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
            placeholder="Введите текст сообщения, которое будет отправлено пользователю..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Сообщение, которое будет отправлено пользователю при вызове команды
            /proekt_price. После отправки сообщения автоматически создается
            топик для связи с пользователем (можно использовать HTML теги:
            &lt;b&gt;, &lt;i&gt;, и т.д.)
          </p>
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
