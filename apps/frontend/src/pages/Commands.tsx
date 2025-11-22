import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GripVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  commandApi,
  type Command,
  type CommandFormData,
} from "../lib/command.api";
import {
  startContentApi,
  type UpsertStartContentData,
} from "../lib/start-content.api";

export function Commands() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<CommandFormData>({
    defaultValues: {
      command: "",
      title: "",
      description: "",
      index: 0,
    },
  });

  const {
    register: registerStart,
    handleSubmit: handleSubmitStart,
    setValue: setValueStart,
  } = useForm<UpsertStartContentData>({
    defaultValues: {
      content: "",
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: commands, isLoading } = useQuery({
    queryKey: ["commands"],
    queryFn: () => commandApi.getAll(),
  });

  const { data: startContent } = useQuery({
    queryKey: ["startContent"],
    queryFn: () => startContentApi.get(),
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

  const upsertStartContentMutation = useMutation({
    mutationFn: (data: UpsertStartContentData) => startContentApi.upsert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["startContent"] });
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
    setValue("title", command.title ?? "");
    setValue("description", command.description ?? "");
    setValue("index", command.index ?? 0);
    const form = document.getElementById("command-form");
    form?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = commands!.findIndex((cmd) => cmd.id === active.id);
      const newIndex = commands!.findIndex((cmd) => cmd.id === over.id);

      const reorderedCommands = arrayMove(commands!, oldIndex, newIndex);

      queryClient.setQueryData(["commands"], reorderedCommands);

      try {
        await Promise.all(
          reorderedCommands.map((cmd, index) =>
            commandApi.update(cmd.id, { index })
          )
        );
      } catch {
        queryClient.invalidateQueries({ queryKey: ["commands"] });
      }
    }
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

  const onSubmitStartContent = (data: UpsertStartContentData) => {
    upsertStartContentMutation.mutate(data);
  };

  useEffect(() => {
    if (startContent) {
      setValueStart("content", startContent.content);
    }
  }, [startContent, setValueStart]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Главное меню</h2>
      <h3 className="text-sm text-gray-500 font-semibold mb-6">
        Настройка текста /start и кнопок главного меню
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <form
            onSubmit={handleSubmitStart(onSubmitStartContent)}
            className="bg-white shadow rounded-lg p-6 space-y-4 h-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Текст /start
            </h3>
            <div>
              <label
                htmlFor="start-content"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Текст сообщения
              </label>
              <textarea
                {...registerStart("content", { required: true })}
                id="start-content"
                rows={14}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
                placeholder="Введите текст сообщения для команды /start"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={upsertStartContentMutation.isPending}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {upsertStartContentMutation.isPending
                  ? "Сохранение..."
                  : "Сохранить текст"}
              </button>
            </div>
          </form>
        </div>

        <div>
          <form
            id="command-form"
            onSubmit={handleSubmit(onSubmit)}
            className={`bg-white shadow rounded-lg p-6 space-y-4 h-full ${
              editingId !== null ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId !== null
                ? "Редактировать команду"
                : "Добавить команду"}
            </h3>
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
                placeholder="Текст кнопки"
              />
              <p className="text-xs text-gray-500 mt-1">
                Текст кнопки в главном меню
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
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Описание команды"
              />
              <p className="text-xs text-gray-500 mt-1">Текст в Menu</p>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={
                  // editingId === null ||
                  createMutation.isPending || updateMutation.isPending
                }
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
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 ">
          Существующие команды
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Перетащите команды для изменения порядка
        </p>
        <div className="max-w-3xl">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Загрузка...</div>
          ) : commands && commands.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={commands.map((cmd) => cmd.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {commands.map((command) => (
                    <SortableCommandItem
                      key={command.id}
                      command={command}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isDeleting={deleteMutation.isPending}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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

function SortableCommandItem({
  command,
  onEdit,
  onDelete,
  isDeleting,
}: {
  command: Command;
  onEdit: (command: Command) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: command.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500"
    >
      <div className="flex gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing shrink-0 text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">{command.title}</h4>
                <span className="text-xs text-gray-500">
                  /{command.command}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {command.description}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => onEdit(command)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Редактировать
            </button>
            <button
              onClick={() => onDelete(command.id)}
              disabled={isDeleting}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
