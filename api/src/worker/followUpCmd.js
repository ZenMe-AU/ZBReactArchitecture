const { Worker } = require("bullmq");

const env = process.env.NODE_ENV || "development";
const config = require("../../config/config.json")[env];
const { getAnswerListByQuestionId } = require("../service/questionService.js");
const { FollowUpCmd, FollowUpFilter, FollowUpShare } = require("../Repository/models.js");

const worker = new Worker(
  "followUpCmdQueue",
  async (job) => {
    const tasks = job.data.tasks;
    const ansList = await getAnswerListByQuestionId(tasks[0].refQuestionId);
    const profileIdGroup = ansList.reduce((acc, ans) => {
      const optionGroup = acc.find(({ option }) => option === ans.optionId);
      if (optionGroup) {
        optionGroup.profileIds.push(ans.profileId);
      } else {
        acc.push({
          option: ans.optionId,
          profileIds: [ans.profileId],
        });
      }
      return acc;
    }, []);
    const createData = tasks.reduce(
      (acc, task) => {
        if (task.isSave) {
          acc.filter.push({
            profileId: task.profileId,
            refQuestionId: task.refQuestionId,
            questionId: task.questionId,
            option: task.option,
          });
        }
        profileIdGroup
          .filter(({ option }) => task.option.includes(option))
          .map(({ profileIds }) => {
            profileIds.map((profileId) => {
              acc.share.push({
                senderId: task.profileId,
                receiverId: profileId,
                refQuestionId: task.refQuestionId,
                questionId: task.questionId,
              });
            });
          });
        return acc;
      },
      { share: [], filter: [] }
    );
    // console.log(ansList);
    // console.log(profileIdGroup);
    // console.log(createData);
    await Promise.all([FollowUpFilter.bulkCreate(createData.filter), FollowUpShare.bulkCreate(createData.share)]);
    await FollowUpCmd.update(
      // todo: enum
      { status: 1 },
      {
        where: {
          id: tasks.map(({ id }) => id),
        },
        individualHooks: true,
      }
    );
  },
  {
    connection: config.redis,
  }
);

worker.on("completed", (job) => {
  console.log(`✅ Task completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Task failed: ${job.id}`, err);
});

module.exports = worker;
