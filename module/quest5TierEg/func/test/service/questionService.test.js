const { createQuestion } = require("../../service/questionService");
const { withTransaction } = require("./dbUtils");
const CmdRepo = require("../../repository/cmdRepository");
const QuestionRepo = require("../../repository/questionRepository");
const EventRepo = require("../../repository/eventRepository");
const AnswerRepo = require("../../repository/questionAnswerRepository");
const ShareRepo = require("../../repository/questionShareRepository");
const AGGREGATE_TYPE = require("../../enum/aggregateType");
const ACTION_TYPE = require("../../enum/actionType");
const STATUS = require("../../enum/status");
const { sequelize } = require("../../db/index");
const { getFollowUpReceiver } = require("../../service/function");
const { v4: uuidv4 } = require("uuid");

jest.mock("../../repository/CmdRepository");
jest.mock("../../repository/QuestionRepository");
jest.mock("../../repository/EventRepository");
jest.mock("../../src/utils/transactionUtil");

describe("createQuestion", () => {
  const fakeCmd = { id: uuidv4() };
  const fakeQuestion = { id: uuidv4() };
  const fakeEvent = { id: uuidv4() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call all repository functions inside transaction", async () => {
    CmdRepo.insertCmd.mockResolvedValue(fakeCmd);
    QuestionRepo.insertQuestion.mockResolvedValue(fakeQuestion);
    EventRepo.insertEvent.mockResolvedValue(fakeEvent);
    CmdRepo.updateCmd.mockResolvedValue(undefined);

    withTransaction.mockImplementation(async (_sequelize, cb) => {
      return cb({ transaction: "mockTransaction" });
    });

    await createQuestion("msg1", "profile1", {}, "corr-id", "Title", "Text", ["A", "B"]);

    expect(CmdRepo.insertCmd).toHaveBeenCalledTimes(1);
    expect(QuestionRepo.insertQuestion).toHaveBeenCalledTimes(1);
    expect(EventRepo.insertEvent).toHaveBeenCalledTimes(1);
    expect(CmdRepo.updateCmd).toHaveBeenCalledTimes(1);

    expect(CmdRepo.insertCmd).toHaveBeenCalledWith(expect.objectContaining({ transaction: "mockTransaction" }));
  });
});
