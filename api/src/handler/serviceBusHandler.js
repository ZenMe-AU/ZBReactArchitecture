const {
  insertFollowUpCmd,
  insertFollowUpFilter,
  getFollowUpReceiver,
  shareQuestion,
  updateFollowUpCmdStatus,
  insertQuestionShareCmd,
  updateQuestionShareCmdStatus,
} = require("../service/questionService.js");

// todo: merge into questionHandler.js
async function SendFollowUpCmd(message, context) {
  context.log("Service bus queue function processed message:", message);

  try {
    // todo: change to insert / update / delete
    // await insertFollowUpCmd(message["profile_id"], message);
    const cmd = await insertFollowUpCmd(message["profile_id"], message);
    const filters = insertFollowUpFilter(message);
    const receiverIds = getFollowUpReceiver(message);
    const sharedQuestions = shareQuestion(message["new_question_id"], message["profile_id"], await receiverIds);

    const [resolvedFilters, resolvedSharedQuestions] = await Promise.all([filters, sharedQuestions]);

    await updateFollowUpCmdStatus(cmd["id"]);

    context.log(`resolvedFilters`, resolvedFilters);
    context.log(`resolvedSharedQuestions`, resolvedSharedQuestions);
    context.log(`✅ Succeed:`, message);
  } catch (error) {
    context.log(`❌ Failed:`, error);
    throw error;
  }
}

async function ShareQuestionCmd(message, context) {
  context.log("Service bus queue function processed message:", message);

  try {
    const cmd = await insertQuestionShareCmd(message["profile_id"], message);
    const sharedQuestions = await shareQuestion(message["new_question_id"], message["profile_id"], message["receiver_ids"]);

    await updateQuestionShareCmdStatus(cmd["id"]);
    context.log(`sharedQuestions:`, sharedQuestions);
    context.log(`✅ Succeed:`, message);
  } catch (error) {
    context.log(`❌ Failed:`, error);
    throw error;
  }
}

module.exports = {
  SendFollowUpCmd,
  ShareQuestionCmd,
};
