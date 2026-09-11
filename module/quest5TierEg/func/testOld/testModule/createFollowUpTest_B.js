/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const baseUrl = process.env.BASE_URL;
const qryUrl = new URL("/questionQry", baseUrl);
const cmdUrl = new URL("/questionCmd", baseUrl);
const funcClientFactory = require("../../funcClient/factory.js");
const followUpQuestionQty = 5;

const checkShareQuestion = (profileIdLookup, testCorrelationId) => {
  let client = funcClientFactory.getClient();
  test.each(shareQuestionData())("check shared question by user $userId", async (shared) => {
    let qty = 0;
    for (let i = 0; i < 5; i++) {
      const response = await client.fetch(qryUrl + "/getSharedQuestions/" + profileIdLookup.getProfileId(shared.userId), { method: "GET" });
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
  let client = funcClientFactory.getClient();
  test(
    "check follow up question by Correlation Id:" + testCorrelationId,
    async () => {
      let qty = 0;
      for (let i = 0; i < 5; i++) {
        const response = await client.fetch(qryUrl + "/getFollowUpEvents/" + testCorrelationId, { method: "GET" });
        console.log("❤️ Follow up events response:", response);
        if (!response.ok) {
          console.error(`Error: ${response.status} - ${response.statusText}`);
          break;
        }
        let resultData = await response.json();
        console.log("❤️ Follow up events response:", resultData);
        qty = resultData.return.qty;

        if (qty === followUpQuestionQty) {
          break;
        } else {
          console.log(`Retrying... expected qty: ${followUpQuestionQty}, current qty: ${qty}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      expect(qty).toBe(followUpQuestionQty);
    },
    100000
  );
};

function shareQuestionData() {
  return [
    { userId: 2, count: 1 + 1 },
    { userId: 3, count: 5 },
    { userId: 4, count: 3 },
    { userId: 5, count: 3 },
    { userId: 6, count: 5 },
    { userId: 7, count: 4 },
    { userId: 8, count: 2 },
    { userId: 9, count: 4 },
    { userId: 10, count: 4 },
    { userId: 11, count: 3 },
    { userId: 12, count: 4 },
    { userId: 13, count: 3 },
    { userId: 14, count: 2 },
    { userId: 15, count: 3 },
    { userId: 16, count: 5 },
    { userId: 17, count: 4 },
    { userId: 18, count: 4 },
    { userId: 19, count: 3 },
    { userId: 20, count: 4 },
  ];
}

module.exports = { checkShareQuestion, checkFollowUpQty };
