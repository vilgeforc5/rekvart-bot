import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  portfolioApi,
  type CreatePortfolioDto,
  type Portfolio,
  type UpdatePortfolioDto,
} from "../lib/portfolio.api";

interface PortfolioFormData {
  title: string;
  description?: string;
  imgSrc: string[];
}

export function PortfolioPage() {
  const queryClient = useQueryClient();
  const [editingPortfolioId, setEditingPortfolioId] = useState<number | null>(
    null
  );
  const [imageInputs, setImageInputs] = useState<string[]>([""]);

  const { register, handleSubmit, reset, setValue } =
    useForm<PortfolioFormData>({
      defaultValues: {
        title: "",
        description: "",
        imgSrc: [],
      },
    });

  const { data: portfolioItems, isLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => portfolioApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePortfolioDto) => portfolioApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      reset();
      setImageInputs([""]);
      setEditingPortfolioId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePortfolioDto }) =>
      portfolioApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      reset();
      setImageInputs([""]);
      setEditingPortfolioId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => portfolioApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });

  const onSubmit = (formData: PortfolioFormData) => {
    const validImages = imageInputs.filter((url) => url.trim() !== "");

    if (validImages.length === 0) {
      alert("Добавьте хотя бы одно изображение");
      return;
    }

    const portfolioData: CreatePortfolioDto | UpdatePortfolioDto = {
      title: formData.title,
      description: formData.description?.trim() || null,
      imgSrc: validImages,
    };

    if (editingPortfolioId !== null) {
      updateMutation.mutate({
        id: editingPortfolioId,
        data: portfolioData as UpdatePortfolioDto,
      });
    } else {
      createMutation.mutate(portfolioData as CreatePortfolioDto);
    }
  };

  const handleEdit = (portfolio: Portfolio) => {
    setEditingPortfolioId(portfolio.id);
    setValue("title", portfolio.title);
    setValue("description", portfolio.description || "");
    setImageInputs(portfolio.imgSrc.length > 0 ? portfolio.imgSrc : [""]);
    const form = document.getElementById("portfolio-form");
    form?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    reset();
    setImageInputs([""]);
    setEditingPortfolioId(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Вы действительно хотите удалить этот проект?")) {
      deleteMutation.mutate(id);
    }
  };

  const addImageInput = () => {
    setImageInputs([...imageInputs, ""]);
  };

  const removeImageInput = (index: number) => {
    if (imageInputs.length > 1) {
      setImageInputs(imageInputs.filter((_, i) => i !== index));
    }
  };

  const updateImageInput = (index: number, value: string) => {
    const newInputs = [...imageInputs];
    newInputs[index] = value;
    setImageInputs(newInputs);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Портфолио</h2>
      <h3 className="text-sm text-gray-500 font-semibold mb-6">
        Управление проектами для команды /portfolio
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <form
            id="portfolio-form"
            onSubmit={handleSubmit(onSubmit)}
            className={`bg-white shadow rounded-lg p-6 space-y-4 ${
              editingPortfolioId !== null ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingPortfolioId !== null
                ? "Редактировать проект"
                : "Добавить проект"}
            </h3>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Название проекта <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title", { required: true })}
                id="title"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Введите название проекта"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Описание
              </label>
              <textarea
                {...register("description")}
                id="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Введите описание проекта (опционально)"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  URL изображений <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addImageInput}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Добавить изображение
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {imageInputs.map((img, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={img}
                      onChange={(e) => updateImageInput(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {imageInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageInput(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingPortfolioId !== null
                  ? updateMutation.isPending
                    ? "Обновление..."
                    : "Обновить проект"
                  : createMutation.isPending
                  ? "Создание..."
                  : "Создать проект"}
              </button>
              {editingPortfolioId !== null && (
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
          Существующие проекты
        </h3>
        <div className="max-w-5xl">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Загрузка...</div>
          ) : portfolioItems && portfolioItems.length > 0 ? (
            <div className="space-y-4">
              {portfolioItems.map((portfolio) => (
                <PortfolioItem
                  key={portfolio.id}
                  portfolio={portfolio}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Проекты не найдены
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PortfolioItem({
  portfolio,
  onEdit,
  onDelete,
  isDeleting,
}: {
  portfolio: Portfolio;
  onEdit: (portfolio: Portfolio) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <p className="text-gray-900 font-medium text-lg">
              {portfolio.title}
            </p>
            {portfolio.description && (
              <p className="text-gray-600 text-sm mt-1">
                {portfolio.description}
              </p>
            )}
          </div>
        </div>

        {portfolio.imgSrc.length > 0 && (
          <div className="mt-4 pl-4 border-l-2 border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
              Изображения ({portfolio.imgSrc.length})
            </p>
            <div className="grid grid-cols-2 gap-2">
              {portfolio.imgSrc.slice(0, 4).map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video bg-gray-100 rounded overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`${portfolio.title} ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.classList.add(
                        "flex",
                        "items-center",
                        "justify-center"
                      );
                      e.currentTarget.parentElement!.innerHTML =
                        '<span class="text-xs text-gray-400">Ошибка загрузки</span>';
                    }}
                  />
                </div>
              ))}
              {portfolio.imgSrc.length > 4 && (
                <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-sm text-gray-500">
                    +{portfolio.imgSrc.length - 4} еще
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onEdit(portfolio)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Редактировать
          </button>
          <button
            onClick={() => onDelete(portfolio.id)}
            disabled={isDeleting}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
