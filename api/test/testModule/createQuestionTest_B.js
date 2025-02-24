const baseUrl = process.env.BASE_URL || "http://localhost:7071";
// const questionUrl = new URL("/api/question", baseUrl);
const profileUrl = new URL("/api/profile", baseUrl);

const checkQuestion = (profileIdLookup) => {
  test.each(getQuestionTestResult())("There should be $count questions by user $user_id.", async (r) => {
    const response = await fetch(profileUrl + "/" + profileIdLookup.getProfileId(r.user_id) + "/question", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
    const resultData = await response.json();
    const qty = resultData.return.list.length;
    expect(qty).toBe(r.count);
  });
};

function getQuestionTestResult() {
  return [
    {
      user_id: 1,
      count: 6,
    },
  ];
}

module.exports = { checkQuestion };
