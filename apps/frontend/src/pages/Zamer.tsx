import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QuestionFormManager } from "../components/QuestionFormManager";
import { zamerApi, type UpdateZamerQuestionDto } from "../lib/zamer.api";

export function Zamer() {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["zamer-config"],
    queryFn: () => zamerApi.getConfig(),
  });

  const updateQuestionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateZamerQuestionDto }) =>
      zamerApi.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zamer-config"] });
    },
  });

  const updateSummaryMutation = useMutation({
    mutationFn: (message: string) => zamerApi.updateSummary(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zamer-config"] });
    },
  });

  const handleUpdateQuestion = async (
    id: number,
    data: UpdateZamerQuestionDto
  ) => {
    return updateQuestionMutation.mutateAsync({ id, data });
  };

  const handleUpdateSummary = async (message: string) => {
    return updateSummaryMutation.mutateAsync(message);
  };

  return (
    <QuestionFormManager
      title="Замер"
      commandName="/zamer"
      config={config}
      isLoading={isLoading}
      onUpdateQuestion={handleUpdateQuestion}
      onUpdateSummary={handleUpdateSummary}
      updateSummaryMutation={updateSummaryMutation}
      updateQuestionMutation={updateQuestionMutation}
    />
  );
}
