import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QuestionFormManager } from "../components/QuestionFormManager";
import {
  consultacyaApi,
  type UpdateConsultacyaQuestionDto,
} from "../lib/consultacya.api";

export function Consultacya() {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["consultacya-config"],
    queryFn: () => consultacyaApi.getConfig(),
  });

  const updateQuestionMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateConsultacyaQuestionDto;
    }) => consultacyaApi.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultacya-config"] });
    },
  });

  const updateSummaryMutation = useMutation({
    mutationFn: (message: string) => consultacyaApi.updateSummary(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultacya-config"] });
    },
  });

  const handleUpdateQuestion = async (
    id: number,
    data: UpdateConsultacyaQuestionDto
  ) => {
    return updateQuestionMutation.mutateAsync({ id, data });
  };

  const handleUpdateSummary = async (message: string) => {
    return updateSummaryMutation.mutateAsync(message);
  };

  return (
    <QuestionFormManager
      title="Консультация"
      commandName="/consultacya"
      config={config}
      isLoading={isLoading}
      onUpdateQuestion={handleUpdateQuestion}
      onUpdateSummary={handleUpdateSummary}
      updateSummaryMutation={updateSummaryMutation}
      updateQuestionMutation={updateQuestionMutation}
      disableDragAndDrop={true}
    />
  );
}
