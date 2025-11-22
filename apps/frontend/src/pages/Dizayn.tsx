import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { dizaynApi, type UpsertDizaynContentData } from "../lib/dizayn.api";

export function Dizayn() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue } = useForm<UpsertDizaynContentData>(
    {
      defaultValues: {
        title: "",
        description: "",
        telegramUrl: "",
        whatsappUrl: "",
        email: "",
      },
    }
  );

  const { data: dizaynContent } = useQuery({
    queryKey: ["dizaynContent"],
    queryFn: () => dizaynApi.get(),
  });

  const upsertMutation = useMutation({
    mutationFn: (data: UpsertDizaynContentData) => dizaynApi.upsert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dizaynContent"] });
    },
  });

  const onSubmit = (data: UpsertDizaynContentData) => {
    upsertMutation.mutate(data);
  };

  useEffect(() => {
    if (dizaynContent) {
      setValue("title", dizaynContent.title);
      setValue("description", dizaynContent.description);
      setValue("telegramUrl", dizaynContent.telegramUrl);
      setValue("whatsappUrl", dizaynContent.whatsappUrl);
      setValue("email", dizaynContent.email);
    }
  }, [dizaynContent, setValue]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Дизайн</h2>
      <h3 className="text-sm text-gray-500 font-semibold mb-6">
        Настройка контента для команды /dizayn
      </h3>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow rounded-lg p-6 space-y-6"
      >
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Заголовок <span className="text-red-500">*</span>
          </label>
          <input
            {...register("title", { required: true })}
            type="text"
            id="title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="🎨 Дизайн интерьеров от RecVart"
          />
          <p className="text-xs text-gray-500 mt-1">
            Заголовок сообщения (можно использовать HTML теги)
          </p>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Описание <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("description", { required: true })}
            id="description"
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
            placeholder="Описание услуг..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Описание услуг (можно использовать HTML теги: &lt;b&gt;, &lt;i&gt;,
            и т.д.)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="telegramUrl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Telegram URL <span className="text-red-500">*</span>
            </label>
            <input
              {...register("telegramUrl", { required: true })}
              type="url"
              id="telegramUrl"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://t.me/username"
            />
          </div>

          <div>
            <label
              htmlFor="whatsappUrl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              WhatsApp URL <span className="text-red-500">*</span>
            </label>
            <input
              {...register("whatsappUrl", { required: true })}
              type="url"
              id="whatsappUrl"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://wa.me/1234567890"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            {...register("email", { required: true })}
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="design@recvart.com"
          />
          <p className="text-xs text-gray-500 mt-1">
            Email отображается при нажатии на кнопку "📧 Email"
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
