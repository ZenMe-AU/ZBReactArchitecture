import Model from "../repository/model/index.mjs";
const model = Model;
export async function GetQuestionById(request, context) {
    const { id: questionId } = request.params;
    const questionnaire = await getById(questionId);
    return { return: { detail: questionnaire } };
}
export async function getById(questionId) {
    try {
        const question = await model.Question.findByPk(questionId);
        if (!question) {
            return null;
        }
        const { id, title, questionText, option, profileId } = question.dataValues;
        return { id, title, questionText, option, profileId };
    }
    catch (err) {
        console.log(err);
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to retrieve question for questionId: ${questionId}; ${message}`, { cause: err });
    }
}
