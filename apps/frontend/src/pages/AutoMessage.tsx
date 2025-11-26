import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  autoMessageApi,
  type UpdateAutoMessageConfigDto,
} from "../lib/auto-message.api";

export function AutoMessage() {
  const queryClient = useQueryClient();
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const { register, handleSubmit, setValue, watch } =
    useForm<UpdateAutoMessageConfigDto>({
      defaultValues: {
        scheduleHour: 9,
        scheduleMinute: 0,
        notificationText: "",
        unsubscribeButtonText: "",
        unsubscribeSuccessText: "",
        resubscribeSuccessText: "",
        resubscribeButtonText: "",
        unsubscribeToggleText: "",
        errorText: "",
      },
    });

  const { data: config } = useQuery({
    queryKey: ["autoMessageConfig"],
    queryFn: () => autoMessageApi.getConfig(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateAutoMessageConfigDto) =>
      autoMessageApi.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["autoMessageConfig"] });
      toast.success("Настройки автоматических сообщений сохранены");
    },
    onError: () => {
      toast.error("Ошибка при сохранении настроек");
    },
  });

  const broadcastMutation = useMutation({
    mutationFn: () => autoMessageApi.testBroadcast(),
    onSuccess: (data) => {
      toast.success(
        `Рассылка завершена: отправлено ${data.sent}, ошибок ${data.failed}, показано уведомлений об отписке ${data.unsubscribeShown}`
      );
      setIsBroadcasting(false);
    },
    onError: () => {
      toast.error("Ошибка при тестовой рассылке");
      setIsBroadcasting(false);
    },
  });

  const onSubmit = (data: UpdateAutoMessageConfigDto) => {
    updateMutation.mutate(data);
  };

  const handleTestBroadcast = () => {
    setIsBroadcasting(true);
    broadcastMutation.mutate();
  };

  useEffect(() => {
    if (config) {
      setValue("scheduleHour", config.scheduleHour);
      setValue("scheduleMinute", config.scheduleMinute);
      setValue("notificationText", config.notificationText);
      setValue("unsubscribeButtonText", config.unsubscribeButtonText);
      setValue("unsubscribeSuccessText", config.unsubscribeSuccessText);
      setValue("resubscribeSuccessText", config.resubscribeSuccessText);
      setValue("resubscribeButtonText", config.resubscribeButtonText);
      setValue("unsubscribeToggleText", config.unsubscribeToggleText);
      setValue("errorText", config.errorText);
    }
  }, [config, setValue]);

  const scheduleHour = watch("scheduleHour");
  const scheduleMinute = watch("scheduleMinute");

  const formatTime = (hour: number, minute: number) => {
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Автоматические сообщения
      </h2>
      <h3 className="text-sm text-gray-500 font-semibold mb-6">
        Настройка автоматической рассылки сохраненных сообщений
      </h3>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            ℹ️ Как это работает:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>
              Последнее текстовое сообщение от оператора автоматически
              сохраняется
            </li>
            <li>
              В указанное время система отправит это сообщение всем активным
              пользователям
            </li>
            <li>
              Каждые 5 автоматических сообщений пользователь увидит уведомление
              об отписке
            </li>
            <li>Часовой пояс: Москва (GMT+3)</li>
          </ul>
        </div>

        {config?.lastSentAt && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Последняя рассылка:</span>{" "}
              {new Date(config.lastSentAt).toLocaleString("ru-RU", {
                timeZone: "Europe/Moscow",
              })}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Время автоматической рассылки{" "}
              <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="scheduleHour"
                  className="block text-xs text-gray-600 mb-1"
                >
                  Час (0-23)
                </label>
                <input
                  {...register("scheduleHour", {
                    required: true,
                    min: 0,
                    max: 23,
                    valueAsNumber: true,
                  })}
                  id="scheduleHour"
                  type="number"
                  min="0"
                  max="23"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="scheduleMinute"
                  className="block text-xs text-gray-600 mb-1"
                >
                  Минуты (0-59)
                </label>
                <input
                  {...register("scheduleMinute", {
                    required: true,
                    min: 0,
                    max: 59,
                    valueAsNumber: true,
                  })}
                  id="scheduleMinute"
                  type="number"
                  min="0"
                  max="59"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-3 text-center">
              <p className="text-lg font-semibold text-gray-700">
                Время рассылки:{" "}
                <span className="text-blue-600">
                  {formatTime(scheduleHour || 0, scheduleMinute || 0)}
                </span>{" "}
                (МСК)
              </p>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">
              Текстовые сообщения
            </h4>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="notificationText"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Текст уведомления об отписке (каждые 5 сообщений)
                </label>
                <textarea
                  {...register("notificationText")}
                  id="notificationText"
                  rows={2}
                  placeholder="✉️ Вы получаете автоматические сообщения. Если хотите отписаться, нажмите кнопку ниже."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="unsubscribeButtonText"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Текст кнопки отписки (в уведомлении)
                </label>
                <input
                  {...register("unsubscribeButtonText")}
                  id="unsubscribeButtonText"
                  type="text"
                  placeholder="🔕 Отписаться от рассылки"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="unsubscribeSuccessText"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Сообщение при отписке
                </label>
                <input
                  {...register("unsubscribeSuccessText")}
                  id="unsubscribeSuccessText"
                  type="text"
                  placeholder="✅ Вы отписались от автоматических сообщений."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="resubscribeSuccessText"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Сообщение при повторной подписке
                </label>
                <input
                  {...register("resubscribeSuccessText")}
                  id="resubscribeSuccessText"
                  type="text"
                  placeholder="✅ Вы снова подписаны на автоматические сообщения."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="resubscribeButtonText"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Текст кнопки повторной подписки
                </label>
                <input
                  {...register("resubscribeButtonText")}
                  id="resubscribeButtonText"
                  type="text"
                  placeholder="🔔 Подписаться снова"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="unsubscribeToggleText"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Текст кнопки отписки (в переключателе)
                </label>
                <input
                  {...register("unsubscribeToggleText")}
                  id="unsubscribeToggleText"
                  type="text"
                  placeholder="🔕 Отписаться"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="errorText"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Текст ошибки
                </label>
                <input
                  {...register("errorText")}
                  id="errorText"
                  type="text"
                  placeholder="❌ Произошла ошибка. Попробуйте позже."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
            </button>

            <button
              type="button"
              onClick={handleTestBroadcast}
              disabled={isBroadcasting}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBroadcasting ? "Отправка..." : "🚀 Новая рассылка"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
