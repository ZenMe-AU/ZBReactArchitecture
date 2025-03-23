const baseUrl = process.env.BASE_URL || "http://localhost:7071";
const profileUrl = new URL("/api/profile", baseUrl);

const checkShareQuestion = (profileIdLookup) => {
  test.each(shareQuestionData())("check shared question by user $user_id", async (shared) => {
    const response = await fetch(profileUrl + "/" + profileIdLookup.getProfileId(shared.user_id) + "/sharedQuestion", { method: "GET" });

    let resultData = await response.json();
    const qty = resultData.return.list.length;
    expect(qty).toBe(shared.count);
  });
};

function shareQuestionData() {
  return [
    { user_id: 2, count: 1 },
    { user_id: 3, count: 5 },
    { user_id: 4, count: 3 },
    { user_id: 5, count: 3 },
    { user_id: 6, count: 5 },
    { user_id: 7, count: 4 },
    { user_id: 8, count: 2 },
    { user_id: 9, count: 4 },
    { user_id: 10, count: 4 },
    { user_id: 11, count: 3 },
    { user_id: 12, count: 4 },
    { user_id: 13, count: 3 },
    { user_id: 14, count: 2 },
    { user_id: 15, count: 3 },
    { user_id: 16, count: 5 },
    { user_id: 17, count: 4 },
    { user_id: 18, count: 4 },
    { user_id: 19, count: 3 },
    { user_id: 20, count: 4 },
  ];
}

module.exports = { checkShareQuestion };
