import { getRepository } from "../repository/getRepository.mjs";
import type { QuestionRecord } from "../repository/contracts.mjs";

type RequestWithQuestionId = {
  params: {
    id: string;
  };
};

type HandlerResponse = {
  return: {
    detail: QuestionRecord | null;
  };
};

export async function GetQuestionById(request: RequestWithQuestionId, context: unknown): Promise<HandlerResponse> {
  const { id: questionId } = request.params;
  const questionnaire: QuestionRecord | null = await getRepository().getById(questionId);
  return { return: { detail: questionnaire } };
}
