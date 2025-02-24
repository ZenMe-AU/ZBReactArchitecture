const baseUrl = process.env.BASE_URL || "http://localhost:7071";
const questionUrl = new URL("/api/question", baseUrl);

const createQuestion = (profileIdLookup) => {
  test.each(questionData())("create question $question_id", async (q) => {
    const response = await fetch(questionUrl, {
      method: "POST",
      body: JSON.stringify({
        profile_id: profileIdLookup.getProfileId(q.user_id),
        title: q.title,
        question: q.question,
        option: q.option,
      }),
    });

    let question = await response.json();
    let questionId = question.return.id;
    questionIdLookup.add(q.question_id, questionId);

    expect(response.ok).toBeTruthy();
  });
};

const questionIdLookup = {
  data: [],
  add: function (testId, questionId) {
    this.data.push({
      testId: testId,
      questionId: questionId,
    });
  },
  getQuestionId: function (id) {
    let obj = this.data.filter(({ testId }) => testId == id).pop();
    return obj ? obj.questionId : null;
  },
};

function questionData() {
  return [
    {
      user_id: 1,
      question_id: 1,
      title: "Taiwan's Capital City",
      question: "The capital city is situated in the north. What is it called?",
      option: ["Taipei", "Taichung", "Tainan", "Taidong"],
    },
    {
      user_id: 1,
      question_id: 2,
      title: "Taiwan's Tallest Peak",
      question: `Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters.
      What is the highest peak, meaning "Jade Mountain," in Taiwan at 3,952 meters?`,
      option: ["Alishan", "Chushan", "Tienmu", "Yushan"],
    },
    {
      user_id: 1,
      question_id: 3,
      title: "Sky Lantern Festival",
      question: `Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?`,
      option: ["Jiufen", "Pingxi", "Tamsui", "Kenting"],
    },
    {
      user_id: 1,
      question_id: 4,
      title: "Taiwan’s Indigenous Languages",
      question: `Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar?
      Which language family do Taiwan’s indigenous languages belong to?`,
      option: ["Min ", "Austro-Asiatic", "Austronesian", "Sino-Tibetan"],
    },
    {
      user_id: 1,
      question_id: 5,
      title: "Temple Culture in Taiwan",
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: ["Guanyin", "Mazu", "Sun Wukong", "Confucius"],
    },
    {
      user_id: 1,
      question_id: 6,
      title: "Language of Taiwan",
      question: "What is the official language of Taiwan?",
      option: null,
    },
  ];
}

module.exports = { createQuestion, questionIdLookup };
