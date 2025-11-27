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
import { GripVertical, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  calculateApi,
  type CalculateQuestion,
  type CalculateVariant,
  type CreateCalculateQuestionDto,
  type UpdateCalculateQuestionDto,
} from "../lib/calculate.api";
import { getQuestionTypeLabel } from "../lib/question-utils";

interface QuestionFormData {
  text: string;
  type: "select" | "text" | "phone";
  name?: string;
}

interface VariantFormData {
  text: string;
  needsPhone: boolean;
}

export function Calculate() {
  const queryClient = useQueryClient();
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null
  );
  const [editingVariants, setEditingVariants] = useState<
    (VariantFormData & { id?: number })[]
  >([]);

  const {
    register: registerQuestion,
    handleSubmit: handleSubmitQuestion,
    reset: resetQuestion,
    setValue: setQuestionValue,
    watch: watchQuestion,
  } = useForm<QuestionFormData>({
    defaultValues: {
      text: "",
      type: "select",
      name: "",
    },
  });

  const {
    register: registerSummary,
    handleSubmit: handleSubmitSummary,
    setValue: setSummaryValue,
  } = useForm<{ message: string }>({
    defaultValues: {
      message: "",
    },
  });

  const questionType = watchQuestion("type");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: config, isLoading } = useQuery({
    queryKey: ["calculate-config"],
    queryFn: () => calculateApi.getConfig(),
  });

  const createQuestionMutation = useMutation({
    mutationFn: (data: CreateCalculateQuestionDto) =>
      calculateApi.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calculate-config"] });
      resetQuestion();
      setEditingVariants([]);
      setEditingQuestionId(null);
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateCalculateQuestionDto;
    }) => calculateApi.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calculate-config"] });
      resetQuestion();
      setEditingVariants([]);
      setEditingQuestionId(null);
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (id: number) => calculateApi.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calculate-config"] });
    },
  });

  const updateSummaryMutation = useMutation({
    mutationFn: (message: string) => calculateApi.updateSummary(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calculate-config"] });
    },
  });

  const onSubmitQuestion = (formData: QuestionFormData) => {
    const maxOrder =
      config?.questions.reduce((max, q) => Math.max(max, q.order), 0) || 0;

    const questionData:
      | CreateCalculateQuestionDto
      | UpdateCalculateQuestionDto = {
      text: formData.text,
      type: formData.type,
      name: formData.name || undefined,
      order: editingQuestionId !== null ? undefined : maxOrder + 1,
      variants:
        formData.type === "select"
          ? editingVariants.map((v, idx) => ({
              id: v.id,
              text: v.text,
              order: idx + 1,
              needsPhone: v.needsPhone,
            }))
          : undefined,
    };

    if (editingQuestionId !== null) {
      updateQuestionMutation.mutate({
        id: editingQuestionId,
        data: questionData as UpdateCalculateQuestionDto,
      });
    } else {
      createQuestionMutation.mutate(questionData as CreateCalculateQuestionDto);
    }
  };

  const handleEditQuestion = (question: CalculateQuestion) => {
    setEditingQuestionId(question.id);
    setQuestionValue("text", question.text);
    setQuestionValue("type", question.type as "select" | "text" | "phone");
    setQuestionValue("name", question.name || "");
    setEditingVariants(
      question.variants.map((v) => ({
        id: v.id,
        text: v.text,
        needsPhone: v.needsPhone,
      }))
    );
    const form = document.getElementById("question-form");
    form?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetQuestion();
    setEditingVariants([]);
    setEditingQuestionId(null);
  };

  const handleDeleteQuestion = (id: number) => {
    if (confirm("Вы действительно хотите удалить этот вопрос?")) {
      deleteQuestionMutation.mutate(id);
    }
  };

  const handleDragEndQuestions = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = config!.questions.findIndex((q) => q.id === active.id);
      const newIndex = config!.questions.findIndex((q) => q.id === over.id);

      const reorderedQuestions = arrayMove(
        config!.questions,
        oldIndex,
        newIndex
      );

      queryClient.setQueryData(["calculate-config"], {
        ...config,
        questions: reorderedQuestions,
      });

      try {
        await Promise.all(
          reorderedQuestions.map((q, index) =>
            calculateApi.updateQuestion(q.id, { order: index + 1 })
          )
        );
      } catch {
        queryClient.invalidateQueries({ queryKey: ["calculate-config"] });
      }
    }
  };

  const handleDragEndVariants = async (
    event: DragEndEvent,
    questionId: number
  ) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const question = config!.questions.find((q) => q.id === questionId);
      if (!question) return;

      const oldIndex = question.variants.findIndex((v) => v.id === active.id);
      const newIndex = question.variants.findIndex((v) => v.id === over.id);

      const reorderedVariants = arrayMove(
        question.variants,
        oldIndex,
        newIndex
      );

      const updatedQuestions = config!.questions.map((q) =>
        q.id === questionId ? { ...q, variants: reorderedVariants } : q
      );

      queryClient.setQueryData(["calculate-config"], {
        ...config,
        questions: updatedQuestions,
      });

      try {
        await calculateApi.updateQuestion(questionId, {
          variants: reorderedVariants.map((v, idx) => ({
            id: v.id,
            text: v.text,
            order: idx + 1,
            needsPhone: v.needsPhone,
          })),
        });
      } catch {
        queryClient.invalidateQueries({ queryKey: ["calculate-config"] });
      }
    }
  };

  const addVariant = () => {
    setEditingVariants([...editingVariants, { text: "", needsPhone: false }]);
  };

  const removeVariant = (index: number) => {
    setEditingVariants(editingVariants.filter((_, i) => i !== index));
  };

  const updateVariant = (
    index: number,
    field: keyof VariantFormData,
    value: string | boolean
  ) => {
    const newVariants = [...editingVariants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setEditingVariants(newVariants);
  };

  const onSubmitSummary = (data: { message: string }) => {
    updateSummaryMutation.mutate(data.message);
  };

  useEffect(() => {
    if (config) {
      setSummaryValue("message", config.summary);
    }
  }, [config, setSummaryValue]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Замер</h2>
      <h3 className="text-sm text-gray-500 font-semibold mb-6">
        Настройка вопросов и итогового сообщения для команды /calculate
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <form
            onSubmit={handleSubmitSummary(onSubmitSummary)}
            className="bg-white shadow rounded-lg p-6 space-y-4 h-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Итоговое сообщение
            </h3>
            <div>
              <label
                htmlFor="summary"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Текст сообщения
              </label>
              <textarea
                {...registerSummary("message", { required: true })}
                id="summary"
                rows={14}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
                placeholder="Введите итоговое сообщение после прохождения замера"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updateSummaryMutation.isPending}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateSummaryMutation.isPending
                  ? "Сохранение..."
                  : "Сохранить сообщение"}
              </button>
            </div>
          </form>
        </div>

        <div>
          <form
            id="question-form"
            onSubmit={handleSubmitQuestion(onSubmitQuestion)}
            className={`bg-white shadow rounded-lg p-6 space-y-4 ${
              editingQuestionId !== null ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingQuestionId !== null
                ? "Редактировать вопрос"
                : "Добавить вопрос"}
            </h3>

            <div>
              <label
                htmlFor="question-text"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Текст вопроса <span className="text-red-500">*</span>
              </label>
              <textarea
                {...registerQuestion("text", { required: true })}
                id="question-text"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Введите текст вопроса"
              />
            </div>

            <div>
              <label
                htmlFor="question-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Имя поля (для API)
              </label>
              <input
                {...registerQuestion("name")}
                id="question-name"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Например: razmer, phone, address"
              />
              <p className="mt-1 text-xs text-gray-500">
                Опционально. Если указано, данные будут возвращаться с этим
                именем вместо номера вопроса.
              </p>
            </div>

            <div>
              <label
                htmlFor="question-type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Тип вопроса <span className="text-red-500">*</span>
              </label>
              <select
                {...registerQuestion("type", { required: true })}
                id="question-type"
                disabled={editingQuestionId !== null}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="select">Выбор варианта</option>
                <option value="text">Текстовый ответ</option>
                <option value="phone">Номер телефона</option>
              </select>
            </div>

            {questionType === "select" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Варианты ответа
                  </label>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Добавить вариант
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {editingVariants.map((variant, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-start p-3 border border-gray-200 rounded-md bg-gray-50"
                    >
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={variant.text}
                          onChange={(e) =>
                            updateVariant(index, "text", e.target.value)
                          }
                          placeholder="Текст варианта"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={variant.needsPhone}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "needsPhone",
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          Запросить номер телефона
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {editingVariants.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Нажмите "Добавить вариант" чтобы создать варианты ответа
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={
                  createQuestionMutation.isPending ||
                  updateQuestionMutation.isPending
                }
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingQuestionId !== null
                  ? updateQuestionMutation.isPending
                    ? "Обновление..."
                    : "Обновить вопрос"
                  : createQuestionMutation.isPending
                  ? "Создание..."
                  : "Создать вопрос"}
              </button>
              {editingQuestionId !== null && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Существующие вопросы
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Перетащите вопросы для изменения порядка
        </p>
        <div className="max-w-5xl">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Загрузка...</div>
          ) : config && config.questions.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEndQuestions}
            >
              <SortableContext
                items={config.questions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {config.questions.map((question) => (
                    <SortableQuestionItem
                      key={question.id}
                      question={question}
                      onEdit={handleEditQuestion}
                      onDelete={handleDeleteQuestion}
                      onDragEndVariants={handleDragEndVariants}
                      isDeleting={deleteQuestionMutation.isPending}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Вопросы не найдены
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SortableQuestionItem({
  question,
  onEdit,
  onDelete,
  onDragEndVariants,
  isDeleting,
}: {
  question: CalculateQuestion;
  onEdit: (question: CalculateQuestion) => void;
  onDelete: (id: number) => void;
  onDragEndVariants: (event: DragEndEvent, questionId: number) => void;
  isDeleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: question.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {getQuestionTypeLabel(question.type)}
                </span>
                <span className="text-xs text-gray-400">
                  Порядок: {question.order}
                </span>
              </div>
              <p className="text-gray-900 font-medium">{question.text}</p>
            </div>
          </div>

          {question.type === "select" && question.variants.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                Варианты ответа
              </p>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => onDragEndVariants(event, question.id)}
              >
                <SortableContext
                  items={question.variants.map((v) => v.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {question.variants.map((variant) => (
                      <SortableVariantItem key={variant.id} variant={variant} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onEdit(question)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Редактировать
            </button>
            <button
              onClick={() => onDelete(question.id)}
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

function SortableVariantItem({ variant }: { variant: CalculateVariant }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: variant.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-50 rounded p-2 flex items-center gap-2 text-sm"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing shrink-0 text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <span className="text-gray-700">{variant.text}</span>
        {variant.needsPhone && (
          <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            📱 Запрос телефона
          </span>
        )}
      </div>
    </div>
  );
}
