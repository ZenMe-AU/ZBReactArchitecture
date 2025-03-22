const { Op, Sequelize } = require("sequelize");
const {
  Question,
  QuestionAnswer,
  QuestionShare,
  QuestionShareCmd,
  QuestionAction,
  FollowUpCmd,
  FollowUpFilter,
} = require("../../../Repository/models.js");
const { followUpCmdQueue } = require("../../../queue/index.js");
const { v4: uuidv4 } = require("uuid");

async function create(profileId, title = null, question = null, option = null) {
  try {
    return await Question.create({
      profileId: profileId,
      title: title,
      questionText: question,
      option: option,
    });
  } catch (err) {
    console.log(err);
    return;
  }
}

async function updateById(questionId, title = null, questionText = null, option = null) {
  try {
    return await Question.update(
      {
        title: title,
        questionText: questionText,
        option: option,
      },
      {
        where: {
          id: questionId,
        },
        individualHooks: true,
      }
    );
  } catch (err) {
    console.log(err);
    return;
  }
}

async function getById(questionId) {
  try {
    // return await Questionnaires.findOne({ where: { id: questionId } });
    return await Question.findByPk(questionId);
  } catch (err) {
    console.log(err);
    return;
  }
}

async function getListByUser(profileId) {
  try {
    return await Question.findAll({ where: { profileId: profileId } });
  } catch (err) {
    console.log(err);
    return;
  }
}

async function getCombinationListByUser(profileId) {
  try {
    return await Question.findAll({
      where: {
        [Op.or]: [
          { profileId: profileId },
          {
            "$question_shares.receiverId$": profileId,
          },
        ],
      },
      include: [
        {
          model: QuestionShare,
          attributes: [],
          group: ["questionId"],
        },
      ],
    });
  } catch (err) {
    console.log(err);
    return;
  }
}

async function addAnswerByQuestionId(questionId, profileId, duration, answer = null, option = null) {
  try {
    return await QuestionAnswer.create({
      questionId: questionId,
      profileId: profileId,
      answerText: answer,
      optionId: option,
      duration: duration,
    });
  } catch (err) {
    console.log(err);
    return;
  }
}

async function getAnswerById(questionId, answerId) {
  try {
    return await QuestionAnswer.findOne({ where: { id: answerId, questionId: questionId } });
  } catch (err) {
    console.log(err);
    return;
  }
}

async function getAnswerListByQuestionId(questionId) {
  try {
    // return await QuestionAnswer.findAll({ where: { questionId: questionId }, order: [["createdAt", "DESC"]] });
    // return await QuestionAnswer.findAll({
    //   attributes: [
    //     "profileId",
    //     [Sequelize.fn("MAX", Sequelize.col("createdAt")), "latestCreatedAt"],
    //     [Sequelize.fn("COUNT", Sequelize.col("id")), "answerCount"],
    //     [Sequelize.literal(`FIRST_VALUE("answerText") OVER (PARTITION BY "profileId" ORDER BY "createdAt" DESC)`), "answerText"],
    //     [Sequelize.literal(`FIRST_VALUE("optionId") OVER (PARTITION BY "profileId" ORDER BY "createdAt" DESC)`), "optionId"],
    //    ],
    //   where: { questionId },
    //   group: ["profileId"],
    //   order: [[Sequelize.fn("MAX", Sequelize.col("createdAt")), "DESC"]],
    //   raw: true,
    // });
    return await await QuestionAnswer.sequelize.query(
      `
          SELECT DISTINCT ON ("profileId")
            "id",
            "profileId",
            "createdAt",
            COUNT("id") OVER (PARTITION BY "profileId") AS "answerCount",
            "questionId",
            "answerText",
            "optionId",
            "duration"
          FROM "question_answer"
          WHERE "questionId" = :questionId
          ORDER BY "profileId", "createdAt" DESC;
        `,
      {
        replacements: { questionId },
        type: QuestionAnswer.sequelize.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    console.log(err);
    return;
  }
}

async function shareQuestion(questionId, senderId, receiverIds) {
  try {
    console.log("shareQuestion data:", questionId, senderId, receiverIds);
    const addData = receiverIds.map(function (receiverId) {
      return {
        questionId: questionId,
        senderId: senderId,
        receiverId: receiverId,
      };
    });
    return await QuestionShare.bulkCreate(addData);
  } catch (err) {
    console.log(err);
    return;
  }
}

async function addFollowUpByQuestionId(newQuestionId, senderId, questionList, isSave) {
  try {
    const addData = questionList.map(function (question) {
      return {
        senderProfileId: senderId,
        refQuestionId: question.question_id,
        refOption: question.option,
        newQuestionId: newQuestionId,
        isSave: isSave,
      };
    });
    const list = await FollowUpCmd.bulkCreate(addData);
    await followUpCmdQueue.add("processFollowUpCmd", { tasks: list });
    console.log(list.map(({ id }) => id));
    // await followUpCmdQueue.add("processFollowUpCmd", { tasks: list.map(({ id }) => id) });
    return list;
  } catch (err) {
    console.log(err);
    return;
  }
}

async function insertFollowUpCmd(senderId, cmdData) {
  try {
    return await FollowUpCmd.create({
      senderProfileId: senderId,
      action: "create",
      data: cmdData,
    });
  } catch (err) {
    console.log(err);
    return;
  }
}

async function insertFollowUpFilter(cmdData) {
  try {
    if (cmdData.save) {
      const filterId = uuidv4();
      const filterDataAry = cmdData.question.map(function (filter, i) {
        return {
          id: filterId,
          order: i + 1,
          senderProfileId: cmdData["profile_id"],
          refQuestionId: filter.question_id,
          refOption: filter.option,
          newQuestionId: cmdData.new_question_id,
        };
      });
      return await FollowUpFilter.bulkCreate(filterDataAry);
    }
  } catch (err) {
    console.log(err);
  }
  return;
}

async function getFollowUpReceiver(cmdData) {
  try {
    const filterReceiverIdAry = await Promise.all(
      cmdData.question.map(async function (filter) {
        const ansList = await getAnswerListByQuestionId(filter.question_id);
        return ansList.reduce((acc, ans) => {
          if (ans.profileId !== cmdData["profile_id"] && filter.option.includes(ans.optionId)) {
            acc.push(ans.profileId);
          }
          return acc;
        }, []);
      })
    );
    console.log(filterReceiverIdAry);
    return filterReceiverIdAry.reduce((acc, arr) => {
      const set = new Set(arr);
      return acc.filter((item) => set.has(item));
    });
  } catch (err) {
    console.log(err);
    return;
  }
}

async function updateFollowUpCmdStatus(id) {
  try {
    return await FollowUpCmd.update({ status: 1 }, { where: { id: id }, individualHooks: true });
  } catch (err) {
    console.log(err);
    return;
  }
}

async function insertQuestionShareCmd(senderId, cmdData) {
  try {
    return await QuestionShareCmd.create({
      senderProfileId: senderId,
      action: "create",
      data: cmdData,
    });
  } catch (err) {
    console.log(err);
    return;
  }
}

async function updateQuestionShareCmdStatus(id) {
  try {
    return await QuestionShareCmd.update({ status: 1 }, { where: { id: id }, individualHooks: true });
  } catch (err) {
    console.log(err);
    return;
  }
}

// async function insertFollowUpCmd(senderId, action, cmdData) {
//   try {
//     const newQuestionId = cmdData.new_question_id;
//     const cmd = await FollowUpCmd.create({
//       senderProfileId: senderId,
//       action: action,
//       data: cmdData,
//     });
//     // save to filter
//     if (cmdData.save) {
//       const filterId = uuidv4();
//       const filterDataAry = cmdData.question.map(function (filter, i) {
//         return {
//           id: filterId,
//           order: i + 1,
//           senderProfileId: senderId,
//           refQuestionId: filter.question_id,
//           refOption: filter.option,
//           newQuestionId: newQuestionId,
//         };
//       });
//       await FollowUpFilter.bulkCreate(filterDataAry);
//     }
//     // save to share
//     const filterReceiverIdAry = await Promise.all(
//       cmdData.question.map(async function (filter) {
//         const ansList = await getAnswerListByQuestionId(filter.question_id);
//         return ansList.reduce((acc, ans) => {
//           if (ans.profileId !== senderId && filter.option.includes(ans.optionId)) {
//             acc.push(ans.profileId);
//           }
//           return acc;
//         }, []);
//       })
//     );
//     console.log(filterReceiverIdAry);
//     const receiverIds = filterReceiverIdAry.reduce((acc, arr) => {
//       const set = new Set(arr);
//       return acc.filter((item) => set.has(item));
//     });
//     console.log(receiverIds);
//     if (receiverIds.length > 0) {
//       await addShareByQuestionId(newQuestionId, senderId, receiverIds);
//       // await FollowUpShare.bulkCreate(
//       //   receiverIds.map(function (receiverId) {
//       //     return {
//       //       senderProfileId: senderId,
//       //       receiverProfileId: receiverId,
//       //       newQuestionId: newQuestionId,
//       //       // -------------------------------------
//       //       refQuestionId: senderId,
//       //     };
//       //   })
//       // );
//     }

//     // todo: enum
//     await cmd.update({ status: 1 });
//     return cmd;
//   } catch (err) {
//     console.log(err);
//     return;
//   }
// }

async function getSharedQuestionListByUser(profileId) {
  try {
    return await QuestionShare.findAll({
      where: { receiverId: profileId },
      include: [
        {
          model: Question,
          attributes: ["title", "questionText", "option"],
        },
      ],
    });
  } catch (err) {
    console.log(err);
    return;
  }
}

async function patchById(questionId, action, profileId) {
  try {
    return await QuestionAction.create({ questionId, profileId, action });
  } catch (err) {
    console.log(err);
    return;
  }
}

module.exports = {
  create,
  updateById,
  getById,
  getListByUser,
  getCombinationListByUser,
  addAnswerByQuestionId,
  getAnswerById,
  getAnswerListByQuestionId,
  shareQuestion,
  addFollowUpByQuestionId,
  getSharedQuestionListByUser,
  patchById,
  insertFollowUpCmd,
  insertFollowUpFilter,
  getFollowUpReceiver,
  updateFollowUpCmdStatus,
  insertQuestionShareCmd,
  updateQuestionShareCmdStatus,
};
