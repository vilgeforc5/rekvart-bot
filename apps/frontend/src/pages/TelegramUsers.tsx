import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ExpandedState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { telegramUsersApi, type TelegramUser } from "../lib/telegram-users.api";

const columnHelper = createColumnHelper<TelegramUser>();

const columns = [
  columnHelper.display({
    id: "expander",
    header: "",
    cell: ({ row }) => {
      const submissionsCount = row.original._count?.formSubmissions || 0;
      if (submissionsCount === 0) return null;

      return (
        <button
          onClick={row.getToggleExpandedHandler()}
          className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded"
        >
          {row.getIsExpanded() ? (
            <ChevronDown size={18} />
          ) : (
            <ChevronRight size={18} />
          )}
        </button>
      );
    },
  }),
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("chatId", {
    header: "Chat ID",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("username", {
    header: "Имя пользователя",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("firstName", {
    header: "Имя",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("lastName", {
    header: "Фамилия",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("phone", {
    header: "Телефон",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("autoMessageCount", {
    header: "Авто-сообщения",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("isSubscribedToAutomessage", {
    header: "Подписка",
    cell: (info) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          info.getValue()
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {info.getValue() ? "✓ Подписан" : "✗ Отписан"}
      </span>
    ),
  }),
  columnHelper.accessor("_count.formSubmissions", {
    header: "Заявки",
    cell: (info) => info.getValue() || 0,
  }),
  columnHelper.accessor("createdAt", {
    header: "Дата создания",
    cell: (info) => new Date(info.getValue()).toLocaleString("ru-RU"),
  }),
];

function SubmissionsRow({ userId }: { userId: number }) {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ["user-submissions", userId],
    queryFn: () => telegramUsersApi.getUserSubmissions(userId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return <div className="text-gray-500 text-center py-4">Нет заявок</div>;
  }

  return (
    <div className="p-4 max-h-96 overflow-y-auto space-y-3">
      {submissions.map((submission) => (
        <div
          key={submission.id}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="inline-block px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-full">
                {submission.commandName.toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(submission.createdAt).toLocaleString("ru-RU")}
            </span>
          </div>
          <div className="space-y-2">
            {Object.entries(submission.data).map(([key, value]) => (
              <div key={key} className="flex gap-2 text-sm">
                <span className="font-medium text-gray-700">
                  {key === "-1" ? "📞 Телефон" : `Вопрос ${key}`}:
                </span>
                <span className="text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TelegramUsers() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [searchText, setSearchText] = useState("");
  const [hasPhone, setHasPhone] = useState<boolean | null>(null);
  const [hasFormSubmissions, setHasFormSubmissions] = useState<boolean | null>(
    null
  );

  const filters = {
    search: searchText || undefined,
    hasPhone: hasPhone !== null ? hasPhone : undefined,
    hasFormSubmissions:
      hasFormSubmissions !== null ? hasFormSubmissions : undefined,
  };

  useEffect(() => {
    setPage(1);
  }, [searchText, hasPhone, hasFormSubmissions]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["telegram-users", page, limit, filters],
    queryFn: () => telegramUsersApi.getAll(page, limit, filters),
  });

  const table = useReactTable({
    data: data?.users ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages ?? 0,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getRowCanExpand: (row) => (row.original._count?.formSubmissions || 0) > 0,
  });

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Ошибка загрузки пользователей Telegram
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Пользователи Telegram
        </h1>
        <p className="text-gray-600 mt-2">
          Просмотр всех пользователей, взаимодействовавших с ботом
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Поиск по имени пользователя или имени..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchText && (
                  <button
                    onClick={() => setSearchText("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setHasPhone(hasPhone === true ? null : true)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    hasPhone === true
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  С телефоном
                </button>
                <button
                  onClick={() =>
                    setHasFormSubmissions(
                      hasFormSubmissions === true ? null : true
                    )
                  }
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    hasFormSubmissions === true
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  С заявками
                </button>
                {(hasPhone !== null ||
                  hasFormSubmissions !== null ||
                  searchText) && (
                  <button
                    onClick={() => {
                      setHasPhone(null);
                      setHasFormSubmissions(null);
                      setSearchText("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Сбросить фильтры
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row) => (
                    <>
                      <tr key={row.id} className="hover:bg-gray-50">
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                      {row.getIsExpanded() && (
                        <tr key={`${row.id}-expanded`}>
                          <td colSpan={columns.length} className="bg-gray-100">
                            <SubmissionsRow userId={row.original.id} />
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 shadow-md rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Страница {data?.page} из {data?.totalPages} (всего {data?.total}{" "}
                пользователей)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Назад
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(data?.totalPages ?? 1, p + 1))
                }
                disabled={page === data?.totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперёд
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
