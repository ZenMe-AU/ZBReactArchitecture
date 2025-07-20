require("dotenv").config(); // Load environment variables

//npm run test:local testSearchProfileAttribute
//npm run test:prod testSearchProfileAttribute

const baseUrl = process.env.PROFILE_URL || "http://localhost:7072";
const profileUrl = new URL("/profile", baseUrl);
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
}, 60000);

describe("test profile attribute search", () => {
  test.each(getTestData())(
    `Writing profile - user id: $id attr: $attributes`,
    async (t) => {
      var response;
      var writeProfile = async function () {
        response = await fetch(profileUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      avatar: "pic/avatar_1.jpg",
      attributes: ["gray hair", "female", "lady", "woman", "brown eyes", "Caucasian"],
    },
    {
      id: 2,
      avatar: "pic/avatar_2.jpg",
      attributes: ["brown hair", "female", "lady", "woman", "brown eyes", "Caucasian"],
    },
    {
      id: 3,
      avatar: "pic/avatar_3.jpg",
      attributes: ["black hair", "curly hair", "bun hair", "female", "lady", "woman", "Black"],
    },
    {
      id: 4,
      avatar: "pic/avatar_4.jpg",
      attributes: ["black hair", "curly hair", "female", "lady", "woman", "Caucasian"],
    },
    {
      id: 5,
      avatar: "pic/avatar_5.jpg",
      attributes: ["black hair", "buzz cut", "male", "man", "beard", "brown eyes", "Black"],
    },
    {
      id: 6,
      avatar: "pic/avatar_6.jpg",
      attributes: ["brown hair", "shoulder-length hair", "male", "man", "goatee beard", "brown eyes", "Caucasian"],
    },
    //   {
    //     id: 7,
    //     avatar: "pic/avatar_7.jpg",
    //     attributes: ["blonde hair", "long hair", "straight hair", "female", "girl", "oval face", "brown eyes", "Caucasian", "smiling"],
    //   },
    //   {
    //     id: 8,
    //     avatar: "pic/avatar_8.jpg",
    //     attributes: ["brown hair", "long hair", "straight hair", "female", "woman", "rounded face", "brown eyes", "Caucasian"],
    //   },
    //   {
    //     id: 9,
    //     avatar: "pic/avatar_9.jpg",
    //     attributes: ["durag", "big earrings", "female", "woman", "brown eyes", "Black"],
    //   },
    //   {
    //     id: 10,
    //     avatar: "pic/avatar_10.jpg",
    //     attributes: ["brown hair", "short hair", "male", "boy", "kid", "oval face", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 11,
    //     avatar: "pic/avatar_11.jpg",
    //     attributes: ["brown hair", "long hair", "wavy hair", "female", "woman", "red sunglasses", "brown eyes", "Caucasian"],
    //   },
    //   {
    //     id: 12,
    //     avatar: "pic/avatar_12.jpg",
    //     attributes: ["brown hair", "short hair", "male", "man", "stubble beard", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 13,
    //     avatar: "pic/avatar_13.jpg",
    //     attributes: ["black hat", "male", "man", "chin strap beard", "brown eyes", "Black"],
    //   },
    //   {
    //     id: 14,
    //     avatar: "pic/avatar_14.jpg",
    //     attributes: ["blonde hair", "female", "lady", "woman", "brown eyes", "Caucasian"],
    //   },
    //   {
    //     id: 15,
    //     avatar: "pic/avatar_15.jpg",
    //     attributes: ["black hair", "curly hair", "bun hair", "female", "lady", "woman", "brown eyes", "Black"],
    //   },
    //   {
    //     id: 16,
    //     avatar: "pic/avatar_16.jpg",
    //     attributes: ["black hair", "curly hair", "male", "man", "mustache", "brown eyes", "Black"],
    //   },
    //   {
    //     id: 17,
    //     avatar: "pic/avatar_17.jpg",
    //     attributes: ["brown hair", "long hair", "straight hair", "female", "lady", "woman", "oval face", "green eyes", "Caucasian"],
    //   },
    //   {
    //     id: 18,
    //     avatar: "pic/avatar_18.jpg",
    //     attributes: ["blond hair", "shoulder-length hair", "wavy hair", "female", "lady", "woman", "red sunglasses", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 19,
    //     avatar: "pic/avatar_19.jpg",
    //     attributes: ["black hair", "buzz cut", "male", "man", "mustache", "brown eyes", "green eyeshadow", "stud earrings", "Black"],
    //   },
    //   {
    //     id: 20,
    //     avatar: "pic/avatar_20.jpg",
    //     attributes: ["blonde hair", "long hair", "straight hair", "female", "lady", "woman", "oval face", "brown eyes", "Caucasian"],
    //   },
    //   {
    //     id: 21,
    //     avatar: "pic/avatar_21.jpg",
    //     attributes: ["gray hair", "short hair", "male", "man", "stubble beard", "brown eyes", "Caucasian"],
    //   },
    //   {
    //     id: 22,
    //     avatar: "pic/avatar_22.jpg",
    //     attributes: ["straw hat", "red hair", "curly hair", "female", "lady", "woman", "oval face", "brown eyes", "Caucasian", "smiling"],
    //   },
    //   {
    //     id: 23,
    //     avatar: "pic/avatar_23.jpg",
    //     attributes: ["gray beanie", "male", "man", "mustache", "brown eyes", "stud earrings", "Black"],
    //   },
    //   {
    //     id: 24,
    //     avatar: "pic/avatar_24.jpg",
    //     attributes: ["brown hair", "long hair", "straight hair", "female", "lady", "woman", "thick eyebrows", "brown eyes", "Caucasian"],
    //   },
    //   {
    //     id: 25,
    //     avatar: "pic/avatar_25.jpg",
    //     attributes: ["blonde hair", "long hair", "wavy hair", "female", "lady", "woman", "gold glasses", "brown eyes", "Caucasian"],
    //   },
    //   {
    //     id: 26,
    //     avatar: "pic/avatar_26.jpg",
    //     attributes: ["gray hair", "short hair", "male", "man", "stubble beard", "brown eyes", "glasses", "Caucasian"],
    //   },
    //   {
    //     id: 27,
    //     avatar: "pic/avatar_27.jpg",
    //     attributes: ["black hair", "tied-up hair", "female", "lady", "woman", "Caucasian"],
    //   },
    //   {
    //     id: 28,
    //     avatar: "pic/avatar_28.jpg",
    //     attributes: ["denim cap", "brown hair", "short hair", "male", "man", "stubble beard", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 29,
    //     avatar: "pic/avatar_29.jpg",
    //     attributes: ["surgical cap", "surgical mask", "female", "lady", "woman", "gray eyes", "Caucasian"],
    //   },
    //   {
    //     id: 30,
    //     avatar: "pic/avatar_30.jpg",
    //     attributes: ["black hair", "short hair", "curly hair", "male", "man", "beard", "brown eyes", "Black"],
    //   },
    //   {
    //     id: 31,
    //     avatar: "pic/avatar_31.jpg",
    //     attributes: ["brown hair", "long straight hair", "female", "lady", "woman", "brown eyes", "Caucasian"],
    //   },
    //   {
    //     id: 32,
    //     avatar: "pic/avatar_32.jpg",
    //     attributes: ["black hair", "short hair", "male", "man", "gray eyes", "Caucasian"],
    //   },
    //   {
    //     id: 33,
    //     avatar: "pic/avatar_33.jpg",
    //     attributes: ["yellow hard hat", "brown hair", "ponytail", "female", "lady", "woman", "safety goggles", "Caucasian"],
    //   },
    //   {
    //     id: 34,
    //     avatar: "pic/avatar_34.jpg",
    //     attributes: ["bald", "male", "man", "beard", "brown eyes", "downturned eyes", "Caucasian"],
    //   },
    //   {
    //     id: 35,
    //     avatar: "pic/avatar_35.jpg",
    //     attributes: ["black hair", "shoulder-length curly hair", "female", "lady", "woman", "brown eyes", "Black"],
    //   },
    //   {
    //     id: 36,
    //     avatar: "pic/avatar_36.jpg",
    //     attributes: ["brown hair", "short hair", "male", "man", "stubble beard", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 37,
    //     avatar: "pic/avatar_37.jpg",
    //     attributes: ["black hair", "wavy hair", "female", "lady", "woman", "brown eyes"],
    //   },
    //   {
    //     id: 38,
    //     avatar: "pic/avatar_38.jpg",
    //     attributes: ["black hair", "short hair", "male", "man", "brown eyes", "Caucasian"],
    //   },
    //   {
    //     id: 39,
    //     avatar: "pic/avatar_39.jpg",
    //     attributes: ["black hair", "long straight hair", "female", "lady", "woman", "brown eyes", "stud earrings", "Caucasian"],
    //   },
    //   {
    //     id: 40,
    //     avatar: "pic/avatar_40.jpg",
    //     attributes: ["red cap", "brown hair", "short hair", "male", "man", "stubble beard", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 41,
    //     avatar: "pic/avatar_41.jpg",
    //     attributes: ["brown hair", "ponytail", "female", "lady", "woman", "brown eyes", "Caucasian"],
    //   },
    //   {
    //     id: 42,
    //     avatar: "pic/avatar_42.jpg",
    //     attributes: ["white hard hat", "black hair", "short hair", "male", "man", "beard", "brown eyes", "Black"],
    //   },
    //   {
    //     id: 43,
    //     avatar: "pic/avatar_43.jpg",
    //     attributes: ["blonde hair", "shoulder-length wavy hair", "female", "lady", "woman", "nose ring", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 44,
    //     avatar: "pic/avatar_44.jpg",
    //     attributes: ["gray hair", "short hair", "male", "man", "stubble beard", "brown eyes", "glasses", "Caucasian"],
    //   },
    //   {
    //     id: 45,
    //     avatar: "pic/avatar_45.jpg",
    //     attributes: ["blonde hair", "long wavy hair", "female", "lady", "woman", "stud earrings", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 46,
    //     avatar: "pic/avatar_46.jpg",
    //     attributes: ["gray hair", "short hair", "male", "man", "pointy ears", "blue eyes", "hooded eyes", "Caucasian"],
    //   },
    //   {
    //     id: 47,
    //     avatar: "pic/avatar_47.jpg",
    //     attributes: ["brown hair", "long wavy hair", "female", "lady", "woman", "thick eyebrows", "brown eyes", "Caucasian"],
    //   },
    //   {
    //     id: 48,
    //     avatar: "pic/avatar_48.jpg",
    //     attributes: ["black hair", "short hair", "male", "man", "stubble beard", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 49,
    //     avatar: "pic/avatar_49.jpg",
    //     attributes: ["brown hair", "long straight hair", "female", "lady", "woman", "brown eyes", "black glasses", "Caucasian"],
    //   },
    //   {
    //     id: 50,
    //     avatar: "pic/avatar_50.jpg",
    //     attributes: ["gray hair", "short hair", "male", "man", "pointy ears", "blue eyes", "droopy eyes", "Caucasian"],
    //   },
    //   {
    //     id: 51,
    //     avatar: "pic/avatar_51.jpg",
    //     attributes: ["black hair", "buzz cut", "male", "man", "beard", "brown eyes", "Black"],
    //   },
    //   {
    //     id: 52,
    //     avatar: "pic/avatar_52.jpg",
    //     attributes: ["red hair", "tie-up hair", "female", "lady", "woman", "earrings", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 53,
    //     avatar: "pic/avatar_53.jpg",
    //     attributes: ["blonde hair", "tie-up hair", "female", "lady", "woman", "nose ring", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 54,
    //     avatar: "pic/avatar_54.jpg",
    //     attributes: ["blonde hair", "long straight hair", "female", "lady", "woman", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 55,
    //     avatar: "pic/avatar_55.jpg",
    //     attributes: ["blonde hair", "long wavy hair", "female", "lady", "woman", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 56,
    //     avatar: "pic/avatar_56.jpg",
    //     attributes: ["brown hair", "long straight hair", "female", "lady", "woman", "blue eyes", "black glasses", "Caucasian"],
    //   },
    //   {
    //     id: 57,
    //     avatar: "pic/avatar_57.jpg",
    //     attributes: ["blond hair", "tie-up hair", "female", "lady", "woman", "earrings", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 58,
    //     avatar: "pic/avatar_58.jpg",
    //     attributes: ["black hair", "short hair", "male", "man", "pointy ears", "stubble beard", "brown eyes", "Caucasian"],
    //   },
    //   {
    //     id: 59,
    //     avatar: "pic/avatar_59.jpg",
    //     attributes: ["blond hair", "short hair", "male", "man", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 60,
    //     avatar: "pic/avatar_60.jpg",
    //     attributes: ["brown hair", "tie-up hair", "female", "lady", "woman", "brown eyes", "Caucasian"],
    //   },
    //   {
    //     id: 61,
    //     avatar: "pic/avatar_61.jpg",
    //     attributes: ["blonde hair", "long straight hair", "female", "lady", "woman", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 62,
    //     avatar: "pic/avatar_62.jpg",
    //     attributes: ["black hair", "short hair", "male", "man", "stubble beard", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 63,
    //     avatar: "pic/avatar_63.jpg",
    //     attributes: ["blond hair", "shoulder-length hair", "male", "man", "glasses", "brown eyes", "Caucasian"],
    //   },
    //   {
    //     id: 64,
    //     avatar: "pic/avatar_64.jpg",
    //     attributes: ["brown hair", "short hair", "male", "man", "black glasses", "beard", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 65,
    //     avatar: "pic/avatar_65.jpg",
    //     attributes: ["brown hair", "tie-up hair", "female", "lady", "woman", "earrings", "brown eyes", "Caucasian"],
    //   },
    //   {
    //     id: 66,
    //     avatar: "pic/avatar_66.jpg",
    //     attributes: ["black hair", "curly hair", "male", "man", "beard", "goatee", "brown eyes", "Black"],
    //   },
    //   {
    //     id: 67,
    //     avatar: "pic/avatar_67.jpg",
    //     attributes: ["black hair", "short hair", "male", "man", "beard", "brown eyes", "Caucasian"],
    //   },
    //   {
    //     id: 68,
    //     avatar: "pic/avatar_68.jpg",
    //     attributes: ["brown hair", "long straight hair", "female", "lady", "woman", "brown eyes", "Caucasian"],
    //   },
    //   {
    //     id: 69,
    //     avatar: "pic/avatar_69.jpg",
    //     attributes: ["brown hair", "tie-up hair", "female", "lady", "woman", "necklace", "earrings", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 70,
    //     avatar: "pic/avatar_70.jpg",
    //     attributes: ["blonde hair", "short curly hair", "female", "lady", "woman", "earrings", "glasses", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 71,
    //     avatar: "pic/avatar_71.jpg",
    //     attributes: ["straw hat", "black hair", "short hair", "male", "man", "stubble beard", "sunglasses", "Caucasian"],
    //   },
    //   {
    //     id: 72,
    //     avatar: "pic/avatar_72.jpg",
    //     attributes: ["blond hair", "long wavy hair", "female", "lady", "woman", "glasses", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 73,
    //     avatar: "pic/avatar_73.jpg",
    //     attributes: ["black hair", "short curly hair", "male", "man", "stubble beard", "brown eyes", "thick eyebrows", "glasses", "Caucasian"],
    //   },
    //   {
    //     id: 74,
    //     avatar: "pic/avatar_74.jpg",
    //     attributes: ["brown hair", "curly bun hair", "female", "lady", "woman", "white glasses", "hazel eyes", "Caucasian"],
    //   },
    //   {
    //     id: 75,
    //     avatar: "pic/avatar_75.jpg",
    //     attributes: ["brown hair", "short hair", "male", "man", "beard", "blue eyes", "black glasses", "Caucasian"],
    //   },
    //   {
    //     id: 76,
    //     avatar: "pic/avatar_76.jpg",
    //     attributes: ["brown hair", "long straight hair", "female", "lady", "woman", "brown eyes", "black glasses", "Caucasian"],
    //   },
    //   {
    //     id: 77,
    //     avatar: "pic/avatar_77.jpg",
    //     attributes: ["black hair", "short hair", "male", "man", "stubble beard", "brown eyes", "glasses", "Caucasian"],
    //   },
    //   {
    //     id: 78,
    //     avatar: "pic/avatar_78.jpg",
    //     attributes: ["blonde hair", "shoulder-length straight hair", "female", "lady", "woman", "black glasses", "hazel eyes", "Caucasian"],
    //   },
    //   {
    //     id: 79,
    //     avatar: "pic/avatar_79.jpg",
    //     attributes: ["white cap", "black hair", "short hair", "male", "man", "brown eyes", "black glasses", "Asian"],
    //   },
    //   {
    //     id: 80,
    //     avatar: "pic/avatar_80.jpg",
    //     attributes: ["gray hair", "short hair", "male", "man", "stubble beard", "brown eyes", "pointy ears", "Caucasian"],
    //   },
    //   {
    //     id: 81,
    //     avatar: "pic/avatar_81.jpg",
    //     attributes: ["black hair", "long straight hair", "female", "lady", "woman", "earrings", "brown eyes", "Asian"],
    //   },
    //   {
    //     id: 82,
    //     avatar: "pic/avatar_82.jpg",
    //     attributes: ["black hair", "curly hair", "long hair", "female", "girl", "kid", "earrings", "brown eyes", "Black"],
    //   },
    //   {
    //     id: 83,
    //     avatar: "pic/avatar_83.jpg",
    //     attributes: ["black hair", "buzz cut", "male", "man", "beard", "brown eyes", "Black"],
    //   },
    //   {
    //     id: 84,
    //     avatar: "pic/avatar_84.jpg",
    //     attributes: ["brown hair", "short hair", "male", "man", "stubble beard", "blue eyes", "Caucasian"],
    //   },
    //   {
    //     id: 85,
    //     avatar: "pic/avatar_85.jpg",
    //     attributes: ["blonde hair", "female", "lady", "woman", "brown eyes", "Caucasian"],
    //   },
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
      searchAttributes: ["brown eyes"],
      exactMatch: true,
      count: 4,
      initCount: 0,
    },
    {
      searchAttributes: ["o"],
      exactMatch: false,
      count: 6,
      initCount: 0,
    },
    {
      searchAttributes: ["air"],
      exactMatch: false,
      count: 6,
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
      searchAttributes: ["brown hair", "male"],
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
