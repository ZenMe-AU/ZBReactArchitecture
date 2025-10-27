/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const baseUrl = 'https://local-chat.azurewebsites.net/';
const coord = [153.10352173070004, -27.50177678975135]
const interval = 1;
const tid = 'l1';
const fakeData = [
    {
        "minDistance": 0,
        "maxDistance": 0,
        "amount": 0
    },
    {
        "minDistance": 0,
        "maxDistance": 1,
        "amount": 1
    },
    {
        "minDistance": 1,
        "maxDistance": 2,
        "amount": 1
    },
    {
        "minDistance": 2,
        "maxDistance": 5,
        "amount": 1
    },
    {
        "minDistance": 5,
        "maxDistance": 10,
        "amount": 1
    }
]

const url = new URL('/api/LocationWriteAndGenFake', baseUrl);
const searchUrl = new URL('/api/SearchNearMe', baseUrl);
const params = {
    "topic": "owntracks/test/genbtn",
    "_type": "location",
    "lon": coord[0],
    "lat": coord[1],
    "tid": tid,
}
const searchParams = {
    "device": tid,
    "interval": interval,
}


for (const f of fakeData) {
        test(`no users in ${f.maxDistance} m(s)`, async () => {
        let urlParams = searchParams;
        urlParams.distance = f.maxDistance;
        const response = await fetch(searchUrl + '?' + new URLSearchParams(urlParams).toString(), {
            method: 'get' ,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin' : '*'
            }
        });
        const data = await response.json();
        expect(data.return.users.length).toBe(0)
    })
};

for (const f of fakeData) {
    test('write test data', async () => {
        let urlParams = params;
        urlParams.fakeData = f
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(urlParams),
        });
        expect(response.ok).toBeTruthy();
    })
};

for (const f of fakeData) {
    test(`There should be ${f.amount} user(s) at a distance of ${f.minDistance} - ${f.maxDistance} m(s).`, async () => {
        let urlParams = Object.assign({}, searchParams);
        urlParams.distance = f.minDistance;
        let urlParams2 = Object.assign({}, searchParams);
        urlParams2.distance = f.maxDistance;
        const response = await fetch(searchUrl + '?' + new URLSearchParams(urlParams).toString(), {
            method: 'get' ,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin' : '*'
            }
        });
        const response2 = await fetch(searchUrl + '?' + new URLSearchParams(urlParams2).toString(), {
            method: 'get' ,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin' : '*'
            }
        });
        const data = await response.json();
        const data2 = await response2.json();
        const qty = data2.return.users.length - data.return.users.length;
        expect(qty).toBe(f.amount)

    })
};
