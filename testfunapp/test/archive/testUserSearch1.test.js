// change test data to user id and remove amount
// if first search user more than zero then cancel the test
// find location that zero user in max range
// spiral outwards
//start location = random location;
// maxrange=5
// A:
// coordx+=maxrange
// if search <> zero
// loop from A
test.todo("something");

require("dotenv").config(); // Load environment variables

//npx cross-env BASE_URL=$BASE_URL_LOCAL jest
//npx cross-env BASE_URL=$BASE_URL_PRODUCTION jest

const baseUrl = process.env.BASE_URL || "https://local-chat.azurewebsites.net/";
const locationWriteUrl = new URL("/api/LocationWriteAndGenFake", baseUrl);
const getUsersQtyUrl = new URL("/api/GetUsersQty", baseUrl);

const initCoord = [
  getRandomInRange(-180, 180, 15),
  getRandomInRange(-90, 90, 15),
];
// const initCoord = [153.10352173070004, -27.50177678975135]
const interval = 5; //Search time range in minutes
const tid = "l1";
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

const expectRange = 5;

const testResult = [
  {
    minDistance: 0,
    maxDistance: 0,
    amount: 3,
  },
  {
    minDistance: 0,
    maxDistance: 1,
    amount: 4,
  },
  {
    minDistance: 1,
    maxDistance: 2,
    amount: 1,
  },
  {
    minDistance: 2,
    maxDistance: 5,
    amount: 1,
  },
];

const coordSet = createCoord();
const maxRange = getRange();

beforeAll(async () => {
  await checkCoord();
}, 60000);

describe("add test data", () => {
  test(`Max range should be ${expectRange} m(s).`, async () => {
    expect(maxRange).toBe(expectRange);
  });

  test(`No user at [${coordSet.getCoord()[0]}, ${
    coordSet.getCoord()[1]
  }].`, async () => {
    let coord = coordSet.getCoord();
    let qty = await checkUsersQty(getUsersQtyUrl, {
      lon: coord[0],
      lat: coord[1],
      interval: interval,
      distance: maxRange,
    });
    expect(qty).toBe(0);
  });

  test.each(testData)(
    "Writing test data - user id: $id in range $minDistance - $maxDistance m(s).",
    async (t) => {
      let coord = coordSet.getCoord();
      const response = await fetch(locationWriteUrl, {
        method: "POST",
        body: JSON.stringify({
          topic: "owntracks/test/genbtn",
          _type: "location",
          lon: coord[0],
          lat: coord[1],
          tid: tid,
          fakeData: t,
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
        interval: interval,
        distance: r.minDistance,
      };
      let urlParams2 = {
        lon: coord[0],
        lat: coord[1],
        interval: interval,
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
  // for (const t of testData) {
  //     test('write test data', async () => {
  //         let coord = coordSet.getCoord();
  //         const response = await fetch(url, {
  //             method: "POST",
  //             body: JSON.stringify({
  //                 topic: "owntracks/test/genbtn",
  //                 _type: "location",
  //                 lon: coord[0],
  //                 lat: coord[1],
  //                 tid: tid,
  //                 fakeData: t
  //             }),
  //         });
  //         expect(response.ok).toBeTruthy();
  //     })
  // };

  // for (const r of testResult) {
  //     test(`There should be ${r.amount} user(s) at a distance of ${r.minDistance} - ${r.maxDistance} m(s).`, async () => {
  //         let coord = coordSet.getCoord();
  //         let urlParams = {
  //             lon: coord[0],
  //             lat: coord[1],
  //             interval: interval,
  //             distance: r.minDistance,
  //         };
  //         let urlParams2 = {
  //             lon: coord[0],
  //             lat: coord[1],
  //             interval: interval,
  //             distance: r.maxDistance,
  //         };
  //         const response = await fetch(getUsersQtyUrl + '?' + new URLSearchParams(urlParams).toString(), {
  //             method: 'get' ,
  //             headers: {
  //                 'Accept': 'application/json',
  //                 'Content-Type': 'application/json',
  //                 'Access-Control-Allow-Origin' : '*'
  //             }
  //         });
  //         const response2 = await fetch(getUsersQtyUrl + '?' + new URLSearchParams(urlParams2).toString(), {
  //             method: 'get' ,
  //             headers: {
  //                 'Accept': 'application/json',
  //                 'Content-Type': 'application/json',
  //                 'Access-Control-Allow-Origin' : '*'
  //             }
  //         });
  //         const data = await response.json();
  //         const data2 = await response2.json();
  //         const qty = data2.return.qty - (r.minDistance === 0 ? 0 : data.return.qty);
  //         expect(qty).toBe(r.amount)
  //     })
  // };
});

function getRandomInRange(from, to, fixed) {
  return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
}

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

function getRange() {
  let maxRange = 0;
  for (const t of testData) {
    maxRange = Math.max(maxRange, t.maxDistance);
  }
  return maxRange;
}

async function checkCoord() {
  var searchUsers = true;
  while (searchUsers) {
    let coord = coordSet.getCoord();
    let qty = await checkUsersQty(getUsersQtyUrl, {
      lon: coord[0],
      lat: coord[1],
      interval: interval,
      distance: maxRange,
    });
    if (qty === 0) {
      searchUsers = false;
    } else {
      coordSet.change();
    }
  }
}
