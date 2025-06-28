require("dotenv").config(); // Load environment variables

//npm run test:local testSearchLocationAttribute
//npm run test:prod testSearchLocationAttribute

// test.todo("Testing User Search with BASE_URL=" + process.env.BASE_URL);
const baseUrl = process.env.BASE_URL || "http://localhost:7073";
const profileBaseUrl = process.env.PROFILE_URL || "http://localhost:7072";
const locationWriteUrl = new URL("/LocationWrite", baseUrl);
const getUsersQtyUrl = new URL("/SearchAtLocationQty", baseUrl);
// const writeAttributesUrl = new URL("/attributes", baseUrl);
const profileUrl = new URL("/profile", profileBaseUrl);

const initCoord = {
  lon: getRandomInRange(-180, 180, 15),
  lat: getRandomInRange(-90, 90, 15),
}; // The Random Coordinate at the beginning

const timeInterval = 5; // Search time range in minutes

const maxTotalRange = getMaxRange();
var coordSet;
beforeAll(async () => {
  coordSet = createCoord(maxTotalRange);
  // console.log(locationWriteUrl, getUsersQtyUrl);
  await findStartingCoords(); //Find random location where there are no users to start from.
}, 60000);

describe("test attribute data", () => {
  test("Starting location test", async () => {
    let coord = coordSet.getCoord();
    let qty = await checkUsersQty(getUsersQtyUrl, {
      lon: coord.lon,
      lat: coord.lat,
      interval: timeInterval,
      distance: maxTotalRange,
    });
    expect(qty).toBe(0);
  });

  test.each(getTestData())("$command  $userId", async (t) => {
    var response;
    switch (t.command) {
      case "createUser":
        response = await fetch(profileUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "user" + t.userId,
            avatar: t.avatar,
            attributes: t.attributes,
          }),
        });

        let profile = await response.json();
        let profileId = profile.return.id;
        profileIdLookup.add(t.userId, profileId);
        break;
      case "writeLocation":
        let coord = coordSet.getCoord();
        let nCoord = genRandomLocation(coord.lon, coord.lat, t.maxDistance, t.minDistance);
        response = await fetch(locationWriteUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: "owntracks/test/genbtn",
            _type: "location",
            lon: nCoord.lon,
            lat: nCoord.lat,
            tid: profileIdLookup.getProfileId(t.userId),
          }),
        });
        break;
    }

    expect(response.ok).toBeTruthy();
  });

  test.each(getTestResult())(
    "There should be $count users at a distance of $distance meters with search attributes: $searchAttributes.",
    async (r) => {
      let coord = coordSet.getCoord();
      let urlParams = {
        lon: coord.lon,
        lat: coord.lat,
        interval: timeInterval,
        distance: r.distance,
        attributes: r.searchAttributes.join(","),
        fuzzySearch: !r.exactMatch,
      };
      const response = await fetch(getUsersQtyUrl + "?" + new URLSearchParams(urlParams).toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      const resultData = await response.json();
      const qty = resultData.return.qty;
      expect(qty).toBe(r.count);
    }
  );
});

// Get the random integer
function getRandomInRange(from, to, fixed) {
  return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
}
// Count the number of users within a certain distance
async function checkUsersQty(url, urlParams) {
  let response = await fetch(url + "?" + new URLSearchParams(urlParams).toString(), {
    method: "get",
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
  let data = await response.json();
  return data.return.qty;
}

function createCoord(range) {
  let coord = initCoord;
  let coordSwitch = true;
  return {
    change: () => {
      coord.lon += (coordSwitch ? range : 0) * 0.00000901;
      coord.lat += (coordSwitch ? 0 : range) * 0.00000901;
      coordSwitch = !coordSwitch;
    },
    getCoord: () => coord,
  };
}
// Find the starting coordinates from a random origin, if there are users present then shift the coordinates by the max range of the test data.
async function findStartingCoords() {
  var searchUsers = true;
  while (searchUsers) {
    let coord = coordSet.getCoord();
    let qty = await checkUsersQty(getUsersQtyUrl, {
      lon: coord.lon,
      lat: coord.lat,
      interval: timeInterval,
      distance: maxTotalRange,
    });
    if (qty === 0) {
      searchUsers = false;
    } else {
      coordSet.change();
    }
  }
}

function genRandomLocation(longitude, latitude, max, min = 0) {
  const EARTH_RADIUS = 6371 * 1000; // earth radius in meters
  const DEGREE = (EARTH_RADIUS * 2 * Math.PI) / 360; // 1° latitude length in meters
  const r = (max - min) * Math.random() ** 0.5 + min;
  const theta = Math.random() * 2 * Math.PI; // random angle

  const dy = r * Math.sin(theta);
  const dx = r * Math.cos(theta);

  let newLatitude = latitude + dy / DEGREE;
  let newLongitude = longitude + dx / (DEGREE * Math.cos(latitude * (Math.PI / 180)));

  return { lon: newLongitude, lat: newLatitude };
}

// Get the maximum distance
function getMaxRange() {
  let maxRange = 0;
  for (const dataToInsert of getTestData()) {
    maxRange = Math.max(maxRange, dataToInsert.maxDistance);
  }
  return maxRange;
}

/**
 * The data will be written in the database in this test
 * minDistance: The limit of the nearest distance from the coordinates
 * maxDistance: The limit of the farthest distance from the coordinates
 * id: The user's device id.
 **/
function getTestData() {
  return [
    {
      command: "createUser",
      userId: 1,
      avatar: "pic/avatar_1.jpg",
      attributes: ["gray hair", "female", "lady", "woman", "brown eyes", "Caucasian"],
    },
    {
      command: "writeLocation",
      userId: 1,
      minDistance: 0,
      maxDistance: 0,
    },
    {
      command: "createUser",
      userId: 2,
      avatar: "pic/avatar_2.jpg",
      attributes: ["brown hair", "female", "lady", "woman", "brown eyes", "Caucasian"],
    },
    {
      command: "writeLocation",
      userId: 2,
      minDistance: 1,
      maxDistance: 2,
    },
    {
      command: "createUser",
      userId: 3,
      avatar: "pic/avatar_3.jpg",
      attributes: ["black hair", "curly hair", "bun hair", "female", "lady", "woman", "Black"],
    },
    {
      command: "writeLocation",
      userId: 3,
      minDistance: 2,
      maxDistance: 5,
    },
    {
      command: "createUser",
      userId: 4,
      avatar: "pic/avatar_4.jpg",
      attributes: ["black hair", "curly hair", "female", "lady", "woman", "Caucasian"],
    },
    {
      command: "writeLocation",
      userId: 4,
      minDistance: 0,
      maxDistance: 1,
    },
    {
      command: "createUser",
      userId: 5,
      avatar: "pic/avatar_5.jpg",
      attributes: ["black hair", "buzz cut", "male", "man", "beard", "brown eyes", "Black"],
    },
    {
      command: "writeLocation",
      userId: 5,
      minDistance: 2,
      maxDistance: 5,
    },

    // {
    //   id: 1,
    //   minDistance: 0,
    //   maxDistance: 0,
    //   avatar: "",
    //   attributes: ["blond", "male", "tall", "blue eyes"],
    // },
    // {
    //   id: 2,
    //   minDistance: 0,
    //   maxDistance: 0,
    //   avatar: "",
    //   attributes: ["blond", "male", "tall", "blue eyes"],
    // },
    // {
    //   id: 3,
    //   minDistance: 1,
    //   maxDistance: 2,
    //   avatar: "",
    //   attributes: ["blond", "male", "tall", "green eyes"],
    // },
    // {
    //   id: 4,
    //   minDistance: 2,
    //   maxDistance: 5,
    //   avatar: "",
    //   attributes: ["blond", "male", "tall", "blue eyes"],
    // },
    // {
    //   id: 5,
    //   minDistance: 0,
    //   maxDistance: 1,
    //   avatar: "",
    //   attributes: ["blond", "male", "tall", "green eyes"],
    // },
    // {
    //   id: 6,
    //   minDistance: 0,
    //   maxDistance: 0,
    //   avatar: "",
    //   attributes: ["blond", "male", "tall", "blue eyes"],
    // },
  ];
}

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
      distance: 0,
      searchAttributes: ["gray hair"],
      exactMatch: true,
      count: 1,
    },
    {
      distance: 3,
      searchAttributes: ["ow"],
      exactMatch: false,
      count: 2,
    },
    {
      distance: 5,
      searchAttributes: ["air"],
      exactMatch: false,
      count: 5,
    },
    {
      distance: 1,
      searchAttributes: ["female"],
      exactMatch: true,
      count: 2,
    },
    {
      distance: 5,
      searchAttributes: ["male"],
      exactMatch: false,
      count: 5,
    },
    {
      distance: 1,
      searchAttributes: ["female"],
      exactMatch: true,
      count: 2,
    },
    {
      distance: 5,
      searchAttributes: ["brown eyes", "Caucasian"],
      exactMatch: true,
      count: 4,
    },
  ];
}

const profileIdLookup = {
  data: [],
  add: function (testId, profileId) {
    this.data.push({
      testId: testId,
      profileId: profileId,
    });
  },
  getProfileId: function (id) {
    let obj = this.data.filter(({ testId }) => testId == id).pop();
    return obj ? obj.profileId : null;
  },
};
