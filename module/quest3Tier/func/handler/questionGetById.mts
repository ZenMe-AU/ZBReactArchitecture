import {getById} from "../repository/model/index.mjs"; //TODO: This should be calling the repository layer instead of directly accessing the model.
import type { Question } from "../repository/interfaces.ts";

type Questionnaire = {
  dataValues: Question;
};

type RequestWithQuestionId = {
  params: {
    id: string;
  };
};

type HandlerResponse = {
  return: {
    detail: Question | null;
  };
};

export async function GetQuestionById(request: RequestWithQuestionId, context: unknown): Promise<HandlerResponse> {
  const { id: questionId } = request.params;
  const questionnaire: Question | null = await getById(questionId);
  return { return: { detail: questionnaire } };
}
