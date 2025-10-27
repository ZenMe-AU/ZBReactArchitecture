/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const baseUrl = 'https://local-chat.azurewebsites.net/';
const coord = [153.10352173070004, -27.50177678975135]
const interval = 5;
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

async function test() {
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

    console.log(JSON.stringify(searchParams, null, 3));
    // check before write data
    for (const f of fakeData) {
        try {
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
            if (!response.ok) {
                throw new Error(`Response:`, `${response.status} ${JSON.stringify(urlParams)}`);
            }
            const data = await response.json();
            console.log(` %d meters:\x1b[33m %d \x1b[0m`,  f.maxDistance, data.return.users.length);
        } catch (error) {
            console.error(`Error:`, error.message);
        }
    };

    // write fake data
    process.stdout.write('\x1b[36mwriting fake data\n');
    for (const f of fakeData) {
        let urlParams = params;
        urlParams.fakeData = f
        try {
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(urlParams),
            });
            if (response.ok) {
                process.stdout.write(".");
            }
        } catch (error) {
            console.error(`Error:`, error.message);
        }
    };
    console.log(' done\x1b[0m');

    // check again
    for (const f of fakeData) {
        try {
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
            if (!response.ok) {
                throw new Error(`Response:`, `${response.status} ${JSON.stringify(urlParams)}`);
            }

            const response2 = await fetch(searchUrl + '?' + new URLSearchParams(urlParams2).toString(), {
                method: 'get' ,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin' : '*'
                }
            });
            if (!response2.ok) {
                throw new Error(`Response:`, `${response2.status} ${JSON.stringify(urlParams2)}`);
            }

            const data = await response.json();
            const data2 = await response2.json();
            const qty = data2.return.users.length - data.return.users.length;
            const result = (qty == f.amount);
            const color = result ? '\x1b[32m' : '\x1b[31m';
            console.log(` > %d - %d meters: ${color} %d \x1b[0m/ %d`, f.minDistance, f.maxDistance, qty, f.amount);
        } catch (error) {
            console.error(`Error:`, error.message);
        }
    };
}

test();