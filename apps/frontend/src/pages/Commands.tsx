import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Tooltip } from "react-tooltip";
import {
  commandApi,
  type Command,
  type CommandFormData,
} from "../lib/command.api";

export function Commands() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<CommandFormData>({
    defaultValues: {
      command: "",
      description: "",
      enabled: true,
    },
  });

  const { data: commands, isLoading } = useQuery({
    queryKey: ["commands"],
    queryFn: () => commandApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CommandFormData) => commandApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commands"] });
      reset();
      setEditingId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CommandFormData>;
    }) => commandApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commands"] });
      reset();
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => commandApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commands"] });
    },
  });

  const onSubmit = (data: CommandFormData) => {
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (command: Command) => {
    setEditingId(command.id);
    setValue("command", command.command);
    setValue("description", command.description ?? "");
    setValue("enabled", command.enabled);
    const form = document.getElementById("command-form");
    form?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancel = () => {
    reset();
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Вы действительно хотите удалить эту команду?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 ">Список команд</h2>
      <h3 className="text-sm text-gray-500 font-semibold  mb-6">
        Отображаются в главном меню после /start
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId !== null ? "Редактировать команду" : "Добавить команду"}
          </h3>
          <form
            id="command-form"
            onSubmit={handleSubmit(onSubmit)}
            className={`bg-white shadow rounded-lg p-6 space-y-4 ${
              editingId !== null ? "ring-2 ring-blue-500 border-blue-500" : ""
            }`}
          >
            <div>
              <label
                htmlFor="command"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Команда
              </label>
              <input
                {...register("command", { required: true })}
                type="text"
                id="command"
                disabled={editingId !== null}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="ping"
              />
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
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Описание команды"
              />
            </div>

            <div className="flex items-center">
              <input
                {...register("enabled")}
                type="checkbox"
                id="enabled"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="enabled"
                className="ml-2 block text-sm text-gray-900"
              >
                Включена
              </label>
              <Info
                className="ml-2 w-4 h-4 text-gray-400 cursor-help"
                data-tooltip-id="enabled-tooltip"
              />
              <Tooltip
                id="enabled-tooltip"
                content="Если команда включена, она будет обрабатываться ботом. При выключении она удалится из главного меню и будет игнорироваться."
                className="max-w-[300px]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId !== null
                  ? updateMutation.isPending
                    ? "Обновление..."
                    : "Обновить команду"
                  : createMutation.isPending
                  ? "Создание..."
                  : "Создать команду"}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Отмена
                </button>
              )}
            </div>
          </form>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Существующие команды
          </h3>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Загрузка...</div>
          ) : commands && commands.length > 0 ? (
            <div className="space-y-4">
              {commands.map((command) => (
                <div
                  key={command.id}
                  className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {command.command}
                      </h4>
                      {command.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {command.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          command.enabled
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {command.enabled ? "Включена" : "Выключено"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(command)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(command.id)}
                      disabled={deleteMutation.isPending}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Команды не найдены
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
