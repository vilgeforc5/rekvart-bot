import { useQuery } from "@tanstack/react-query";
import type { HealthResponse } from "backend/src/health/health.dto";
import { useState } from "react";
import { fetcher } from "../lib/api";

export function HealthBadge() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: health,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      try {
        return await fetcher<HealthResponse>("/health");
      } catch (error) {
        const errorMessage = `Не удалось подключиться: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`;
        return {
          status: "error" as const,
          timestamp: new Date().toISOString(),
          checks: {
            database: {
              status: "error" as const,
              message: errorMessage,
            },
            bot: {
              status: "error" as const,
              message: errorMessage,
            },
          },
        } satisfies HealthResponse;
      }
    },
    refetchInterval: 30000,
  });

  const statusColor =
    health?.status === "ok"
      ? "bg-green-500"
      : health?.status === "error"
      ? "bg-red-500"
      : "bg-gray-500";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${statusColor} text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2`}
        title="Проверка здоровья"
      >
        <div
          className={`w-2 h-2 rounded-full ${
            isLoading ? "animate-pulse bg-white" : "bg-white"
          }`}
        />
        <span className="text-sm font-medium">
          {health?.status === "ok"
            ? "ОК"
            : health?.status === "error"
            ? "Ошибка"
            : "Проверка..."}
        </span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">Состояние системы</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  База данных
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    health?.checks.database.status === "ok"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {health?.checks.database.status === "ok" ? "ОК" : "ОШИБКА"}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {health?.checks.database.message}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Telegram бот
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    health?.checks.bot.status === "ok"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {health?.checks.bot.status === "ok" ? "ОК" : "ОШИБКА"}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {health?.checks.bot.message}
              </p>
            </div>

            {health?.timestamp && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Последняя проверка:{" "}
                  {new Date(health.timestamp).toLocaleTimeString("ru-RU")}
                </p>
              </div>
            )}

            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="w-full mt-2 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Проверка..." : "Обновить"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
