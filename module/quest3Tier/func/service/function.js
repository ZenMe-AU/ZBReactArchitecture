const { Op, Sequelize } = require("sequelize");
// const { Op } = require("../shared/db").sequelize;

// const {
//   Question,
//   QuestionAnswer,
//   QuestionShare,
//   QuestionShareCmd,
//   QuestionAction,
//   FollowUpCmd,
//   FollowUpFilter,
//   FollowUpEvent,
//   QuestionShareEvent,
// } = require("../db/model");
const Model = require("../repository/model/index.js");
const { v4: uuidv4 } = require("uuid");
const cmdName = require("../enum/cmdName.js");

async function create(profileId, title = null, question = null, option = null) {
  try {
    return await Model.Question.create({
      profileId: profileId,
      title: title,
      questionText: question,
      option: option,
    });
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function updateById(questionId, title = null, questionText = null, option = null) {
  try {
    return await Model.Question.update(
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
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function getById(questionId) {
  try {
    // return await Questionnaires.findOne({ where: { id: questionId } });
    return await Model.Question.findByPk(questionId);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function getListByUser(profileId) {
  try {
    return await Model.Question.findAll({ where: { profileId: profileId } });
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function getCombinationListByUser(profileId) {
  try {
    return await Model.Question.findAll({
      where: {
        [Op.or]: [
          { profileId: profileId },
          {
            "$questionShares.receiverProfileId$": profileId,
          },
        ],
      },
      include: [
        {
          model: Model.QuestionShare,
          attributes: [],
          group: ["newQuestionId"],
        },
      ],
    });
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function addAnswerByQuestionId(questionId, profileId, duration, answer = null, option = null) {
  try {
    return await Model.QuestionAnswer.create({
      questionId: questionId,
      profileId: profileId,
      answerText: answer,
      optionId: option,
      duration: duration,
    });
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function getAnswerById(questionId, answerId) {
  try {
    return await Model.QuestionAnswer.findOne({ where: { id: answerId, questionId: questionId } });
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
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
    return await Model.QuestionAnswer.sequelize.query(
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
          FROM "questionAnswer"
          WHERE "questionId" = :questionId
          ORDER BY "profileId", "createdAt" DESC;
        `,
      {
        replacements: { questionId },
        type: Model.QuestionAnswer.sequelize.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function shareQuestion(newQuestionId, senderId, receiverIds) {
  try {
    console.log("shareQuestion data:", newQuestionId, senderId, receiverIds);
    const addData = receiverIds.map(function (receiverId) {
      return {
        newQuestionId: newQuestionId,
        senderProfileId: senderId,
        receiverProfileId: receiverId,
      };
    });
    return await Model.QuestionShare.bulkCreate(addData);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function addFollowUpByQuestionId(newQuestionId, senderId, questionList, isSave) {
  try {
    const addData = questionList.map(function (question) {
      return {
        senderProfileId: senderId,
        refQuestionId: question.questionId,
        refOption: question.option,
        newQuestionId: newQuestionId,
        isSave: isSave,
      };
    });
    const list = await Model.FollowUpCmd.bulkCreate(addData);
    // await followUpCmdQueue.add("processFollowUpCmd", { tasks: list });
    // console.log(list.map(({ id }) => id));
    // await followUpCmdQueue.add("processFollowUpCmd", { tasks: list.map(({ id }) => id) });
    return list;
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function insertFollowUpCmd(cmdId, senderId, cmdData, correlationId) {
  try {
    return await Model.FollowUpCmd.create({
      id: cmdId,
      senderProfileId: senderId,
      action: "create",
      data: cmdData,
      correlationId: correlationId,
    });
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
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
          senderProfileId: cmdData["profileId"],
          refQuestionId: filter.questionId,
          refOption: filter.option,
          newQuestionId: cmdData.newQuestionId,
        };
      });
      return await Model.FollowUpFilter.bulkCreate(filterDataAry);
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
        const ansList = await getAnswerListByQuestionId(filter.questionId);
        return ansList.reduce((acc, ans) => {
          if (ans.profileId !== cmdData["profileId"] && filter.option.includes(ans.optionId)) {
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
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function updateFollowUpCmdStatus(id) {
  try {
    return await Model.FollowUpCmd.update({ status: 1 }, { where: { id: id }, individualHooks: true });
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function insertQuestionShareCmd(cmdId, senderId, cmdData, correlationId) {
  try {
    return await Model.QuestionShareCmd.create({
      id: cmdId,
      senderProfileId: senderId,
      action: "create",
      data: cmdData,
      correlationId: correlationId,
    });
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function updateQuestionShareCmdStatus(id) {
  try {
    return await Model.QuestionShareCmd.update({ status: 1 }, { where: { id: id }, individualHooks: true });
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

// async function insertFollowUpCmd(senderId, action, cmdData) {
//   try {
//     const newQuestionId = cmdData.newQuestionId;
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
//           refQuestionId: filter.questionId,
//           refOption: filter.option,
//           newQuestionId: newQuestionId,
//         };
//       });
//       await FollowUpFilter.bulkCreate(filterDataAry);
//     }
//     // save to share
//     const filterReceiverIdAry = await Promise.all(
//       cmdData.question.map(async function (filter) {
//         const ansList = await getAnswerListByQuestionId(filter.questionId);
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
    return await Model.QuestionShare.findAll({
      where: { receiverId: profileId },
      include: [
        {
          model: Model.Question,
          attributes: ["title", "questionText", "option"],
        },
      ],
    });
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function patchById(questionId, action, profileId) {
  try {
    return await Model.QuestionAction.create({ questionId, profileId, action });
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function getEventByCorrelationId(name, correlationId) {
  let model;
  switch (name) {
    case cmdName.FollowUpCmd:
      model = Model.FollowUpEvent;
      break;
    case cmdName.QuestionShareCmd:
      model = Model.QuestionShareEvent;
      break;
    default:
      throw new Error("unknown eventName");
  }
  try {
    return await model.findAll({
      where: {
        correlationId,
      },
    });
  } catch (err) {
    console.log(err);
    throw new Error("can't get event by correlationId");
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
  getEventByCorrelationId,
};
