import { getQuestionById } from "../repository/table/questionRepository.mjs";
import type { Question } from "./interfaces.ts";

type RequestWithQuestionId = {
  params: {
    id: string;
  };
  userData: {
    profileId: string;
  };
};

type HandlerResponse = {
  return: {
    detail: (Question & { isOwner: boolean }) | null;
  };
};

export async function GetQuestionById(request: RequestWithQuestionId, context: unknown): Promise<HandlerResponse> {
  const { id: questionId } = request.params;
  const questionnaire: Question | null = await getById(questionId);
  return { return: { detail: questionnaire && { ...questionnaire, isOwner: questionnaire.profileId === request.userData.profileId } } };
}

export async function getById(questionId: string): Promise<Question | null> {
  try {
    return await getQuestionById(questionId);
  } catch (err) {
    console.log(err);
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to retrieve question for questionId: ${questionId}; ${message}`, { cause: err });
  }
}
