import type { Question } from "./interfaces.ts";
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
export declare function GetQuestionById(request: RequestWithQuestionId, context: unknown): Promise<HandlerResponse>;
export declare function getById(questionId: string): Promise<Question | null>;
export {};
