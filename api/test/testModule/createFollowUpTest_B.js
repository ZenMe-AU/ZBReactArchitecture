const baseUrl = process.env.BASE_URL || "http://localhost:7071";
const profileUrl = new URL("/api/profile", baseUrl);
const eventUrl = new URL("/api/getEventByCorrelationId", baseUrl);
const followUpQuestionQty = 5;

const checkShareQuestion = (profileIdLookup, testCorrelationId) => {
  test.each(shareQuestionData())("check shared question by user $user_id", async (shared) => {
    let qty = 0;
    for (let i = 0; i < 5; i++) {
      const response = await fetch(profileUrl + "/" + profileIdLookup.getProfileId(shared.user_id) + "/sharedQuestion", { method: "GET" });
      let resultData = await response.json();
      qty = resultData.return.list.length;
      if (qty === shared.count) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    expect(qty).toBe(shared.count);
  });
};

const checkFollowUpQty = (testCorrelationId) => {
  test("check follow up question by Correlation Id:" + testCorrelationId, async () => {
    let qty = 0;
    for (let i = 0; i < 5; i++) {
      const response = await fetch(eventUrl + "/FollowUpCmd/" + testCorrelationId, { method: "GET" });
      if (!response.ok) {
        console.error(`Error: ${response.status} - ${response.statusText}`);
        break;
      }
      let resultData = await response.json();
      qty = resultData.return.qty;
      if (qty === followUpQuestionQty) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    expect(qty).toBe(followUpQuestionQty);
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

module.exports = { checkShareQuestion, checkFollowUpQty };
