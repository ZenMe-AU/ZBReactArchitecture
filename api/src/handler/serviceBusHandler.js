const { addFollowUpCmd } = require("../service/questionService.js");

async function FollowUpCmd(message, context) {
  context.log("Service bus queue function processed message:", message);
  await addFollowUpCmd(message["profile_id"], "create", message);

  try {
    context.log(`✅ Succeed:`, message);
  } catch (error) {
    context.log(`❌ Failed:`, error);
    throw error;
  }
}

module.exports = { FollowUpCmd };
