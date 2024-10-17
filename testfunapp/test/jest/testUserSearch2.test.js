require("dotenv").config(); // Load environment variables

//npx env-cmd -f local.env jest testUserSearch2
//npx env-cmd -f .env jest testUserSearch2

test.todo("Testing User Search with BASE_URL=" + process.env.BASE_URL);
const baseUrl = process.env.BASE_URL || "http://localhost:7071";
const locationWriteUrl = new URL("/api/LocationWrite", baseUrl);
const getUsersQtyUrl = new URL("/api/GetUsersQtyByCoord", baseUrl);

// The Random Coordinate at the beginning
const initCoord = [
  getRandomInRange(-180, 180, 15),
  getRandomInRange(-90, 90, 15),
];

// Search time range in minutes
const timeInterval = 5;
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
// The maximum distance according to the test data
const expectRange = 5;
/**
 * The except result of the test
 * distance: The distance from the coordinates
 * amount: The number of users within a certain distance
 **/
//TODO: remove mindistance from SpeechRecognitionResultList.
const testResult = [
  {
    minDistance: 0,
    maxDistance: 0,
    amount: 2,
  },
  {
    minDistance: 0,
    maxDistance: 1,
    amount: 3,
  },
  {
    minDistance: 0,
    maxDistance: 2,
    amount: 4,
  },
  {
    minDistance: 0,
    maxDistance: 5,
    amount: 5,
  },
];

const coordSet = createCoord();
const maxRange = getRange();

beforeAll(async () => {
  console.log(locationWriteUrl, getUsersQtyUrl);
  await checkCoord();
}, 60000);

describe("add test data", () => {
  test(`Max range should be ${expectRange} m(s).`, async () => {
    expect(maxRange).toBe(expectRange);
  });

  test(`No user at [
      ${coordSet.getCoord()[0]},
      ${coordSet.getCoord()[1]}
    ].`, async () => {
    let coord = coordSet.getCoord();
    let qty = await checkUsersQty(getUsersQtyUrl, {
      lon: coord[0],
      lat: coord[1],
      interval: timeInterval,
      distance: maxRange,
    });
    expect(qty).toBe(0);
  });

  test.each(testData)(
    "Writing test data - user id: $id in range $minDistance - $maxDistance m(s).",
    async (t) => {
      let coord = coordSet.getCoord();
      let nCoord = generateLocation(
        coord[0],
        coord[1],
        t.maxDistance,
        t.minDistance
      );
      const response = await fetch(locationWriteUrl, {
        method: "POST",
        body: JSON.stringify({
          topic: "owntracks/test/genbtn",
          _type: "location",
          lon: nCoord[0],
          lat: nCoord[1],
          tid: t.id,
        }),
      });
      expect(response.ok).toBeTruthy();
    }
  );

  test.each(testResult)(
    "There should be $amount user(s) at a distance of $minDistance - $maxDistance m(s).",
    async (r) => {
      let coord = coordSet.getCoord();
      let urlParams = {
        lon: coord[0],
        lat: coord[1],
        interval: timeInterval,
        distance: r.minDistance,
      };
      let urlParams2 = {
        lon: coord[0],
        lat: coord[1],
        interval: timeInterval,
        distance: r.maxDistance,
      };
      const response = await fetch(
        getUsersQtyUrl + "?" + new URLSearchParams(urlParams).toString(),
        {
          method: "get",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      const response2 = await fetch(
        getUsersQtyUrl + "?" + new URLSearchParams(urlParams2).toString(),
        {
          method: "get",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      const data = await response.json();
      const data2 = await response2.json();
      const qty =
        data2.return.qty - (r.minDistance === 0 ? 0 : data.return.qty);
      expect(qty).toBe(r.amount);
    }
  );
});

// Get the random integer
function getRandomInRange(from, to, fixed) {
  return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
}
// Count the number of users within a certain distance
async function checkUsersQty(url, urlParams) {
  let response = await fetch(
    url + "?" + new URLSearchParams(urlParams).toString(),
    {
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
  let data = await response.json();
  return data.return.qty;
}

function createCoord() {
  let coord = initCoord;
  let coordSwitch = true;
  return {
    change: () => {
      coord[0] += (coordSwitch ? maxRange : 0) * 0.00000901;
      coord[1] += (coordSwitch ? 0 : maxRange) * 0.00000901;
      coordSwitch = !coordSwitch;
    },
    getCoord: () => coord,
  };
}
// Get the maximum distance
function getRange() {
  let maxRange = 0;
  for (const t of testData) {
    maxRange = Math.max(maxRange, t.maxDistance);
  }
  return maxRange;
}
// Check if a coordinate has any users within a certain distance
// If so, alternately shift the longitude and latitude until there are no users present
async function checkCoord() {
  var searchUsers = true;
  while (searchUsers) {
    let coord = coordSet.getCoord();
    let qty = await checkUsersQty(getUsersQtyUrl, {
      lon: coord[0],
      lat: coord[1],
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

function generateLocation(longitude, latitude, max, min = 0) {
  // earth radius in meters
  const EARTH_RADIUS = 6371 * 1000;
  // 1° latitude length in meters
  const DEGREE = (EARTH_RADIUS * 2 * Math.PI) / 360;
  const r = (max - min) * Math.random() ** 0.5 + min;

  // random angle
  const theta = Math.random() * 2 * Math.PI;

  const dy = r * Math.sin(theta);
  const dx = r * Math.cos(theta);

  let newLatitude = latitude + dy / DEGREE;
  let newLongitude =
    longitude + dx / (DEGREE * Math.cos(latitude * (Math.PI / 180)));

  return [newLongitude, newLatitude];
}
