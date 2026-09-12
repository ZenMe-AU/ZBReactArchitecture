import Model from "../repository/model/index.mjs";
import type { Question } from "./interfaces.ts";

type Questionnaire = {
  dataValues: Question;
};

const model = Model as {
  Question: {
    findByPk(questionId: string): Promise<Questionnaire | null>;
  };
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

export async function getById(questionId: string): Promise<Question | null> {
  try {
    const question = await model.Question.findByPk(questionId);
    if (!question) {
      return null;
    }
    const { id, title, questionText, option, profileId } = question.dataValues;
    return { id, title, questionText, option, profileId };
  } catch (err) {
    console.log(err);
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to retrieve question for questionId: ${questionId}; ${message}`, { cause: err });
  }
}