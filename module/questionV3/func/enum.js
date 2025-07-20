const AGGREGATE_TYPE = Object.freeze({
  FOLLOW_UP: "followUp",
  QUESTION: "question",
  QUESTION_ANSWER: "questionAnswer",
  QUESTION_SHARE: "questionShare",
});

const ACTION_TYPE = Object.freeze({
  CREATE: "create",
  UPDATE: "update",
});

const STATUS = Object.freeze({
  PENDING: 0,
  SUCCESS: 1,
});

module.exports = {
  AGGREGATE_TYPE,
  ACTION_TYPE,
  STATUS,
};
