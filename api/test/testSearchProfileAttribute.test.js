require("dotenv").config(); // Load environment variables

//npm run test:local testSearchProfileAttribute
//npm run test:prod testSearchProfileAttribute

const baseUrl = process.env.BASE_URL || "http://localhost:7071";
const profileUrl = new URL("/api/profile", baseUrl);
let testResult = getTestResult();
const writeLogs = false;

beforeAll(() => {
  return new Promise(async (resolve) => {
    await Promise.all(
      testResult.map(async (r, i) => {
        const response = await fetch(
          profileUrl +
            "?" +
            new URLSearchParams({
              attributes: r.searchAttributes.join(","),
              fuzzySearch: !r.exactMatch,
            }).toString(),
          {
            method: "get",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
        const resultData = await response.json();
        testResult[i].initCount = resultData.return.profile.length;
        if (writeLogs) console.log("Found %d for %s", testResult[i].initCount, testResult[i].searchAttributes);
      })
    );
    resolve();
  });
});

describe("test profile attribute search", () => {
  test.each(getTestData())(
    `Writing profile - user id: $id attr: $attributes`,
    async (t) => {
      var response;
      var writeProfile = async function () {
        response = await fetch(profileUrl, {
          method: "POST",
          body: JSON.stringify({
            name: t.id,
            avatar: t.avatar,
            attributes: t.attributes,
          }),
        });
        if (writeLogs) console.log("Written ID %s with attributes %s", t.id, t.attributes);
        expect(response.ok).toBeTruthy();
      };
      //if (t.id == 2) await new Promise((resolve) => setTimeout(resolve, 10000)); //Use this if you want to introduce a delay.
      await writeProfile();
    },
    20000
  );

  test.each(testResult)("Verify results for attributes: $searchAttributes.", async (r) => {
    const currentIndex = getTestResult()
      .map((e) => [e.searchAttributes.join(","), e.exactMatch.toString()].join(";"))
      .indexOf([r.searchAttributes.join(","), r.exactMatch.toString()].join(";"));
    //const initCount = initCountLookup.getInitCount(currentIndex);
    const response = await fetch(
      profileUrl +
        "?" +
        new URLSearchParams({
          attributes: r.searchAttributes.join(","),
          fuzzySearch: !r.exactMatch,
        }).toString(),
      {
        method: "get",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
    const resultData = await response.json();

    if (writeLogs)
      console.log(
        "%s, Found %d of expected %d + %d users with %s on attributes: %s.",
        resultData.return.profile.length == r.count + r.initCount ? "Success" : "FAIL",
        resultData.return.profile.length,
        r.initCount,
        r.count,
        r.exactMatch ? "Exact match" : "Fuzzy match",
        r.searchAttributes
      );
    expect(resultData.return.profile.length).toBe(r.count + r.initCount);
  });
});

/**
 * The data will be written in the database in this test
 * minDistance: The limit of the nearest distance from the coordinates
 * maxDistance: The limit of the farthest distance from the coordinates
 * id: The user's device id.
 **/
function getTestData() {
  return [
    {
      id: 1,
      avatar: "avatar_1.jpg",
      attributes: ["blond", "gray", "female", "lady", "woman", "brown eyes", "Caucasian"],
    },
    {
      id: 2,
      avatar: "",
      attributes: ["brunette", "female", "tall", "brown eyes"],
    },
    {
      id: "delaythisuser",
      avatar: "",
      attributes: ["black hair", "female", "brown eyes"],
    },
    {
      id: 4,
      avatar: "",
      attributes: ["blond", "female", "tall", "green eyes"],
    },
    {
      id: 5,
      avatar: "",
      attributes: ["blond", "female", "tall", "green eyes"],
    },
    {
      id: 6,
      avatar: "",
      attributes: ["brunette", "male", "blue eyes"],
    },
  ];
}

// let userIdLookup = [
//   {
//     id: 1,
//     dbid: 5,
//   },
//   {
//     id: 2,
//     dbid: 6,
//   },
// ];

/**
 * The expected result of the test.
 * distance: The distance from the coordinates.
 * searchAttributes: The attributes to search for.
 * count: The number of users within a certain distance
 **/
//TODO: how to structure the search string so that multiple attributes can be searched?
function getTestResult() {
  return [
    {
      searchAttributes: ["blond"],
      exactMatch: true,
      count: 3,
      initCount: 0,
    },
    {
      searchAttributes: ["o"],
      exactMatch: false,
      count: 5,
      initCount: 0,
    },
    {
      searchAttributes: ["tal"],
      exactMatch: false,
      count: 4,
      initCount: 0,
    },
    {
      searchAttributes: ["male"],
      exactMatch: true,
      count: 2,
      initCount: 0,
    },
    {
      searchAttributes: ["male"],
      exactMatch: false,
      count: 6,
      initCount: 0,
    },
    {
      searchAttributes: ["female"],
      exactMatch: true,
      count: 4,
      initCount: 0,
    },
    {
      searchAttributes: ["blond", "male"],
      exactMatch: true,
      count: 1,
      initCount: 0,
    },
  ];
}

// const initCountLookup = {
//   data: [],
//   add: function (index, number) {
//     this.data.push({
//       index: index,
//       initCount: number,
//     });
//   },
//   getInitCount: function (i) {
//     let obj = this.data.filter(({ index }) => index == i).pop();
//     return obj ? obj.initCount : null;
//   },
// };
// startingCount: 0,
