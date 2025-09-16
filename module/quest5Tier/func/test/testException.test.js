require("dotenv").config(); // Load environment variables

//npm run test:local testException
//npm run test:prod testException

const baseUrl = process.env.BASE_URL;
const shareQuestionCmdUrl = new URL("/shareQuestionCmd", baseUrl);
const questionUrl = new URL("/question", baseUrl);
const testCorrelationId = crypto.randomUUID().replace(/-/g, "");
// beforeAll(async () => {
//   }, 60000);
console.log(testCorrelationId);
describe("test question data", () => {
  test("get not exist question", async () => {
    const response = await fetch(questionUrl + "/" + crypto.randomUUID(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        "X-Correlation-Id": testCorrelationId,
      },
    });

    expect(response.ok).toBeTruthy();
  });

  test("invalidInput", async () => {
    const response = await fetch(shareQuestionCmdUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "X-Correlation-Id": testCorrelationId,
      },
      body: JSON.stringify({
        profileId: "7a232055-5355-422a-9ca7-b7e567103fdb",
      }),
    });

    expect(response.ok).not.toBeTruthy();
  });
  test("share question cmd", async () => {
    const response = await fetch(shareQuestionCmdUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "X-Correlation-Id": testCorrelationId,
      },
      body: JSON.stringify({
        profileId: "7a232055-5355-422a-9ca7-b7e567103fdb",
        newQuestionId: "12c9a107-53c2-4b77-8cf7-d58856a582db",
        receiverIds: ["76c527d3-9f37-4605-aac6-65527f7392db"],
      }),
    });

    expect(response.ok).toBeTruthy();
  });
});
