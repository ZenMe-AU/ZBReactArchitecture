const { requestHandler, eventGridHandler } = require("./handler/handlerWrapper.js");
const apiCmdHandler = require("./handler/apiCmdHandler.js");
const apiQryHandler = require("./handler/apiQryHandler.js");
const queueCmdHandler = require("./handler/queueCmdHandler.js");
const sendFollowUpCmdSchema = require("./schema/sendFollowUpCmdSchema");
const shareQuestionCmdSchema = require("./schema/shareQuestionCmdSchema");

class GetQuestion {
  static funcName = "GetQuestion";
  static route = "questionQry/getQuestion/{questionId}";
  static methods = ["GET"];
  static authLevel = "anonymous";
  static handler = requestHandler(apiQryHandler.GetQuestionById);
}

class GetAnswer {
  static funcName = "GetAnswer";
  static route = "questionQry/getAnswer/{answerId}";
  static methods = ["GET"];
  static authLevel = "anonymous";
  static handler = requestHandler(apiQryHandler.GetAnswerById);
}

class GetQuestionList {
  static funcName = "GetQuestionList";
  static route = "questionQry/getQuestions/{profileId}";
  static methods = ["GET"];
  static authLevel = "anonymous";
  static handler = requestHandler(apiQryHandler.GetQuestionListByUser);
}

class GetAnswerList {
  static funcName = "GetAnswerList";
  static route = "questionQry/getAnswers/{questionId}";
  static methods = ["GET"];
  static authLevel = "anonymous";
  static handler = requestHandler(apiQryHandler.GetAnswerListByQuestionId);
}

class GetSharedQuestionList {
  static funcName = "GetSharedQuestionList";
  static route = "questionQry/getSharedQuestions/{profileId}";
  static methods = ["GET"];
  static authLevel = "anonymous";
  static handler = requestHandler(apiQryHandler.GetSharedQuestionListByUser);
}

class GetQuestionShareEventList {
  static funcName = "GetQuestionShareEventList";
  static route = "questionQry/getQuestionShareEvents/{correlationId}";
  static methods = ["GET"];
  static authLevel = "anonymous";
  static handler = requestHandler(apiQryHandler.GetEventByCorrelationId, {
    customParams: { tableName: "QuestionShareEvent" },
  });
}

class GetFollowUpEventList {
  static funcName = "GetFollowUpEventList";
  static route = "questionQry/getFollowUpEvents/{correlationId}";
  static methods = ["GET"];
  static authLevel = "anonymous";
  static handler = requestHandler(apiQryHandler.GetEventByCorrelationId, {
    customParams: { tableName: "followUp" },
  });
}

class CreateQuestionCmd {
  static funcName = "CreateQuestion"; //azure function name
  static route = "questionCmd/createQuestion"; //api path
  static methods = ["POST"]; //api http method
  static authLevel = "anonymous"; //azure function auth level
  static handler = requestHandler(apiCmdHandler.CreateQuestion); //azure function handler
  static queueFuncName = "CreateQuestionQueue"; //event subscription azure function name
  static queueHandler = eventGridHandler(queueCmdHandler.CreateQuestion); //event subscription azure function handler
  static subscriptionFilter = "createQuestionCmd"; //event subscription name and filter
  static eventQueueName = "questionCreatedEvent"; //event to publish when command is processed
}

class UpdateQuestionCmd {
  static funcName = "UpdateQuestion";
  static route = "questionCmd/updateQuestion/{questionId}";
  static methods = ["POST"];
  static authLevel = "anonymous";
  static handler = requestHandler(apiCmdHandler.UpdateQuestion);
  static queueFuncName = "UpdateQuestionQueue";
  static queueHandler = eventGridHandler(queueCmdHandler.UpdateQuestion);
  static subscriptionFilter = "updateQuestionCmd";
  static eventQueueName = "questionUpdatedEvent";
}

class CreateAnswerCmd {
  static funcName = "CreateAnswer";
  static route = "questionCmd/createAnswer/{questionId}";
  static methods = ["POST"];
  static authLevel = "anonymous";
  static handler = requestHandler(apiCmdHandler.CreateAnswer);
  static queueFuncName = "CreateAnswerQueue";
  static queueHandler = eventGridHandler(queueCmdHandler.CreateAnswer);
  static subscriptionFilter = "createAnswerCmd";
  static eventQueueName = "answerCreatedEvent";
}

class SendFollowUpCmd {
  static funcName = "SendFollowUp";
  static route = "questionCmd/sendFollowUp";
  static methods = ["POST"];
  static authLevel = "anonymous";
  static handler = requestHandler(apiCmdHandler.SendFollowUp, {
    schemas: [sendFollowUpCmdSchema],
  });
  static queueFuncName = "SendFollowUpQueue";
  static queueHandler = eventGridHandler(queueCmdHandler.SendFollowUp);
  static subscriptionFilter = "sendFollowUpCmd";
  static eventQueueName = "followUpSentEvent";
}

class ShareQuestionCmd {
  static funcName = "ShareQuestion";
  static route = "questionCmd/shareQuestion";
  static methods = ["POST"];
  static authLevel = "anonymous";
  static handler = requestHandler(apiCmdHandler.ShareQuestion, {
    schemas: [shareQuestionCmdSchema],
  });
  static queueFuncName = "ShareQuestionQueue";
  static queueHandler = eventGridHandler(queueCmdHandler.ShareQuestion);
  static subscriptionFilter = "shareQuestionCmd";
  static eventQueueName = "questionSharedEvent";
}

module.exports = class ListFunctions {
  static queries = Object.freeze([
    GetQuestion,
    GetAnswer,
    GetQuestionList,
    GetAnswerList,
    GetSharedQuestionList,
    GetQuestionShareEventList,
    GetFollowUpEventList,
  ]);
  static commands = Object.freeze([CreateQuestionCmd, UpdateQuestionCmd, CreateAnswerCmd, SendFollowUpCmd, ShareQuestionCmd]);
  static {
    const all = [...this.queries, ...this.commands];
    this.allFunctions = Object.freeze(Object.fromEntries(all.map((fn) => [fn.name, fn])));
  }

  //   static #cachedAllFunctions = null;
  //   static get allFunctions() {
  //     if (!this.#cachedAllFunctions) {
  //       const all = [...this.queries, ...this.commands];
  //       this.#cachedAllFunctions = Object.freeze(Object.fromEntries(all.map((fn) => [fn.name, fn])));
  //     }
  //     return this.#cachedAllFunctions;
  //   }
};

// class ListFunctions {
//   static queries = Object.freeze([
//     GetQuestion,
//     GetAnswer,
//     GetQuestionList,
//     GetAnswerList,
//     GetSharedQuestionList,
//     GetQuestionShareEventList,
//     GetFollowUpEventList,
//   ]);
//   static commands = Object.freeze([CreateQuestionCmd, UpdateQuestionCmd, CreateAnswerCmd, SendFollowUpCmd, ShareQuestionCmd]);
//   static allFunctions = Object.freeze([...this.queries, ...this.commands]);
// }

// console.log(ListFunctions.commands[0].eventQueueName);
// console.log(ListFunctions.allFunctions[0].route);

// module.exports = {
//   GetQuestion,
//   GetAnswer,
//   GetQuestionList,
//   GetAnswerList,
//   GetSharedQuestionList,
//   GetQuestionShareEventList,
//   GetFollowUpEventList,
//   CreateQuestionCmd,
//   UpdateQuestionCmd,
//   CreateAnswerCmd,
//   SendFollowUpCmd,
//   ShareQuestionCmd,
// };
