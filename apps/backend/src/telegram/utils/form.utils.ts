interface QuestionWithName {
  order: number;
  name: string | null;
}

export function transformAnswersToNamedKeys(
  answers: { [key: number]: string },
  questions: QuestionWithName[],
): { [key: string]: string } {
  const result: { [key: string]: string } = {};

  for (const [key, value] of Object.entries(answers)) {
    const numKey = parseInt(key);

    if (numKey === -1) {
      result['phone'] = value;
    } else if (!isNaN(numKey) && numKey > 0) {
      const question = questions.find((q) => q.order === numKey);
      if (question?.name) {
        result[question.name] = value;
      } else {
        result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}
