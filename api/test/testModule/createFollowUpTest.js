const baseUrl = process.env.BASE_URL || "http://localhost:7071";
const sendFollowUpCmdUrl = new URL("/api/sendFollowUpCmd", baseUrl);

const createFollowUp = (profileIdLookup, questionIdLookup, testCorrelationId) => {
  test.each(followUpData())("send follow-up question by user $user_id", async (followUp) => {
    const response = await fetch(sendFollowUpCmdUrl, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        profile_id: profileIdLookup.getProfileId(followUp.user_id),
        new_question_id: questionIdLookup.getQuestionId(followUp.new_question_id),
        question: [
          {
            question_id: questionIdLookup.getQuestionId(followUp.question_id),
            option: [followUp.option],
          },
        ],
        save: followUp.save,
        correlationId: testCorrelationId,
      }),
    });

    expect(response.ok).toBeTruthy();
  });
};

function followUpData() {
  return [
    // Question 1: Taiwan's Capital City
    {
      user_id: 1,
      new_question_id: 2,
      question_id: 1,
      option: "Taipei",
      save: true,
    },
    // Question 2: Taiwan's Tallest Peak
    {
      user_id: 1,
      new_question_id: 3,
      question_id: 2,
      option: "Yushan",
      save: true,
    },
    // Question 3: Sky Lantern Festival
    {
      user_id: 1,
      new_question_id: 4,
      question_id: 3,
      option: "Pingxi",
      save: true,
    },
    // Question 4: Taiwan’s Indigenous Languages
    {
      user_id: 1,
      new_question_id: 5,
      question_id: 4,
      option: "Austronesian",
      save: true,
    },
    // Question 5: Temple Culture in Taiwan
    {
      user_id: 1,
      new_question_id: 1,
      question_id: 5,
      option: "Mazu",
      save: true,
    },
  ];
}

module.exports = { createFollowUp };
