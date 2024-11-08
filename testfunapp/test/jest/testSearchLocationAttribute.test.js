require("dotenv").config(); // Load environment variables

//npm run test:local testUserSearch2
//npm run test:prod testUserSearch2

// test.todo("Testing User Search with BASE_URL=" + process.env.BASE_URL);
const baseUrl = process.env.BASE_URL || "http://localhost:7071";
const locationWriteUrl = new URL("/api/LocationWrite", baseUrl);
const getUsersQtyUrl = new URL("/api/SearchAtLocationQty", baseUrl);
const writeAttributesUrl = new URL("/api/attributes", baseUrl);
const profileUrl = new URL("/api/profile", baseUrl);

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

  test.each(getTestData())(`$command`, async (t) => {
    var response;
    switch (t.command) {
      case "createUser":
        response = await fetch(profileUrl, {
          method: "POST",
          body: JSON.stringify({
            name: "user" + t.user_id,
            avatar: t.avatar,
            attributes: t.attributes,
          }),
        });

        let profile = await response.json();
        let profileId = profile.return.id;
        profileIdLookup.add(t.user_id, profileId);
        break;
      case "writeLocation":
        let coord = coordSet.getCoord();
        let nCoord = genRandomLocation(coord.lon, coord.lat, t.maxDistance, t.minDistance);
        response = await fetch(locationWriteUrl, {
          method: "POST",
          body: JSON.stringify({
            topic: "owntracks/test/genbtn",
            _type: "location",
            lon: nCoord.lon,
            lat: nCoord.lat,
            tid: profileIdLookup.getProfileId(t.user_id),
          }),
        });
        break;
    }

    expect(response.ok).toBeTruthy();
  });

  test.each(getTestResult())("There should be $count user(s) at a distance of $distance meters with matched attributes: $attributes.", async (r) => {
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
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
    const resultData = await response.json();
    const qty = resultData.return.qty;
    expect(qty).toBe(r.count);
  });
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
      "Content-Type": "application/json",
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
      user_id: 1,
      avatar: "",
      attributes: ["blond", "female", "tall", "blue eyes"],
    },
    {
      command: "writeLocation",
      user_id: 1,
      minDistance: 0,
      maxDistance: 0,
    },
    {
      command: "createUser",
      user_id: 2,
      avatar: "",
      attributes: ["blond", "male", "tall", "blue eyes"],
    },
    {
      command: "writeLocation",
      user_id: 2,
      minDistance: 1,
      maxDistance: 2,
    },
    {
      command: "createUser",
      user_id: 3,
      avatar: "",
      attributes: ["brunette", "female", "tall", "blue eyes"],
    },
    {
      command: "writeLocation",
      user_id: 3,
      minDistance: 2,
      maxDistance: 5,
    },
    {
      command: "createUser",
      user_id: 4,
      avatar: "",
      attributes: ["blond", "male", "tall", "blue eyes"],
    },
    {
      command: "writeLocation",
      user_id: 4,
      minDistance: 0,
      maxDistance: 1,
    },
    {
      command: "createUser",
      user_id: 5,
      avatar: "",
      attributes: ["blond", "female", "tall", "blue eyes"],
    },
    {
      command: "writeLocation",
      user_id: 5,
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
      searchAttributes: ["blond"],
      exactMatch: true,
      count: 1,
    },
    {
      distance: 5,
      searchAttributes: ["on"],
      exactMatch: false,
      count: 4,
    },
    {
      distance: 5,
      searchAttributes: ["tal"],
      exactMatch: false,
      count: 5,
    },
    {
      distance: 1,
      searchAttributes: ["male"],
      exactMatch: true,
      count: 1,
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
      count: 1,
    },
    {
      distance: 5,
      searchAttributes: ["blond", "male"],
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
