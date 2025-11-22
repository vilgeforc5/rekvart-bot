export function getQuestionTypeLabel(type: string | null | undefined): string {
  switch (type) {
    case "select":
      return "Выбор варианта";
    case "text":
      return "Текстовый ответ";
    case "phone":
      return "Номер телефона";
    case "location":
      return "Адрес или локация";
    default:
      return "Выбор варианта";
  }
}
