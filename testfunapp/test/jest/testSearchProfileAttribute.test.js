require("dotenv").config(); // Load environment variables

//npm run test:local testUserSearch2
//npm run test:prod testUserSearch2

const baseUrl = process.env.BASE_URL || "http://localhost:7071";
const profileUrl = new URL("/api/profile", baseUrl);
let testResult = getTestResult();

testResult.forEach(async (r, i) => {
  // await getTestResult().forEach(async (r, i) => {
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
  initCountLookup.add(i, resultData.return.profile.length);
});

// beforeAll(async () => {}, 60000);

describe("test attribute data", () => {
  test.each(getTestData())(`Writing profile data - user id: $id attr: $attributes`, async (t) => {
    const response = await fetch(profileUrl, {
      method: "POST",
      body: JSON.stringify({
        name: "user" + t.id,
        avatar: t.avatar,
        attributes: t.attributes,
      }),
    });
    expect(response.ok).toBeTruthy();
  });
  test.each(testResult)("There should be $initCount + $count user(s) exactly ($exactMatch) matching attributes: $searchAttributes.", async (r) => {
    const currentIndex = getTestResult()
      .map((e) => [e.searchAttributes.join(","), e.exactMatch.toString()].join(";"))
      .indexOf([r.searchAttributes.join(","), r.exactMatch.toString()].join(";"));
    const initCount = initCountLookup.getInitCount(currentIndex);
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
    expect(resultData.return.profile.length).toBe(r.count + initCount);
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
      avatar: "",
      attributes: ["blond", "male", "tall", "blue eyes"],
    },
    {
      id: 2,
      avatar: "",
      attributes: ["brunette", "female", "tall", "brown eyes"],
    },
    {
      id: 3,
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
    },
    {
      searchAttributes: ["o"],
      exactMatch: false,
      count: 5,
    },
    {
      searchAttributes: ["tal"],
      exactMatch: false,
      count: 4,
    },
    {
      searchAttributes: ["male"],
      exactMatch: true,
      count: 2,
    },
    {
      searchAttributes: ["male"],
      exactMatch: false,
      count: 6,
    },
    {
      searchAttributes: ["female"],
      exactMatch: true,
      count: 4,
    },
    {
      searchAttributes: ["blond", "male"],
      exactMatch: true,
      count: 4,
    },
  ];
}

const initCountLookup = {
  data: [],
  add: function (index, number) {
    this.data.push({
      index: index,
      initCount: number,
    });
  },
  getInitCount: function (i) {
    let obj = this.data.filter(({ index }) => index == i).pop();
    return obj ? obj.initCount : null;
  },
};
// startingCount: 0,
