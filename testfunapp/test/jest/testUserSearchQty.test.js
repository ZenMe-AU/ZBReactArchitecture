require("dotenv").config(); // Load environment variables

//npm run test:local testUserSearchQty
//npm run test:prod testUserSearchQty

test.todo("Testing User Search with BASE_URL=" + process.env.BASE_URL);
const baseUrl = process.env.BASE_URL || "http://localhost:7071";
const locationWriteUrl = new URL("/api/LocationWrite", baseUrl);
const getUsersQtyUrl = new URL("/api/GetUsersQtyByCoord", baseUrl);

const initCoord = {
  lon: getRandomInRange(-180, 180, 15),
  lat: getRandomInRange(-90, 90, 15),
}; // The Random Coordinate at the beginning

const timeInterval = 5; // Search time range in minutes

/**
 * The data will be written in the database in this test
 * minDistance: The limit of the nearest distance from the coordinates
 * maxDistance: The limit of the farthest distance from the coordinates
 * id: The user's device id
 **/
const testData = [
  {
    minDistance: 0,
    maxDistance: 0,
    id: 2,
  },
  {
    minDistance: 1,
    maxDistance: 2,
    id: 3,
  },
  {
    minDistance: 2,
    maxDistance: 5,
    id: 4,
  },
  {
    minDistance: 0,
    maxDistance: 1,
    id: 5,
  },
  {
    minDistance: 0,
    maxDistance: 0,
    id: 6,
  },
];

/**
 * The expected result of the test.
 * distance: The distance from the coordinates
 * amount: The number of users within a certain distance
 **/
//TODO: remove mindistance from testResult
const testResult = [
  {
    minDistance: 0,
    distance: 0,
    amount: 2,
  },
  {
    minDistance: 0,
    distance: 1,
    amount: 3,
  },
  {
    minDistance: 0,
    distance: 2,
    amount: 4,
  },
  {
    minDistance: 0,
    distance: 5,
    amount: 5,
  },
];

const coordSet = createCoord();
const maxRange = getRange();

beforeAll(async () => {
  // console.log(locationWriteUrl, getUsersQtyUrl);
  await findStartingCoords(); //Find random location where there are no users to start from.
}, 60000);

describe("add test data", () => {
  test(`Starting location with no user at {lon: ${coordSet.getCoord().lon}, lat: ${coordSet.getCoord().lat}}.`, async () => {
    let coord = coordSet.getCoord();
    let qty = await checkUsersQty(getUsersQtyUrl, {
      lon: coord.lon,
      lat: coord.lat,
      interval: timeInterval,
      distance: maxRange,
    });
    expect(qty).toBe(0);
  });

  test.each(testData)("Writing test data - user id: $id in range $minDistance - $maxDistance meters.", async (t) => {
    let coord = coordSet.getCoord();
    let nCoord = genRandomLocation(coord.lon, coord.lat, t.maxDistance, t.minDistance);
    const response = await fetch(locationWriteUrl, {
      method: "POST",
      body: JSON.stringify({
        topic: "owntracks/test/genbtn",
        _type: "location",
        lon: nCoord.lon,
        lat: nCoord.lat,
        tid: t.id,
      }),
    });
    expect(response.ok).toBeTruthy();
  });

  test.each(testResult)("There should be $amount user(s) at a distance of $distance meters.", async (r) => {
    let coord = coordSet.getCoord();
    let urlParams = {
      lon: coord.lon,
      lat: coord.lat,
      interval: timeInterval,
      distance: r.distance,
    };
    const response = await fetch(getUsersQtyUrl + "?" + new URLSearchParams(urlParams).toString(), {
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
    const resultdata = await response.json();
    const qty = resultdata.return.qty;
    expect(qty).toBe(r.amount);
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

function createCoord() {
  let coord = initCoord;
  let coordSwitch = true;
  return {
    change: () => {
      coord.lon += (coordSwitch ? maxRange : 0) * 0.00000901;
      coord.lat += (coordSwitch ? 0 : maxRange) * 0.00000901;
      coordSwitch = !coordSwitch;
    },
    getCoord: () => coord,
  };
}
// Get the maximum distance
function getRange() {
  let maxRange = 0;
  for (const dataToInsert of testData) {
    maxRange = Math.max(maxRange, dataToInsert.maxDistance);
  }
  return maxRange;
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
      distance: maxRange,
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
