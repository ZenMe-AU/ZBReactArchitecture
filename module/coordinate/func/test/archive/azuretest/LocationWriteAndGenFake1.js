/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

//Write random user locations to the database for one deviceid and locations changing randomly in a specified radius.
//TODO: Luke copy generate fake data code here.
// {
//     "lon": 153.10352173070004,
//     "lat": -27.50177678975135,
//     "topic": "owntracks/owntracks/genbtn",
//     "_type": "location",
//     "tid": "l1",
//     "fakeData": {
//         "minDistance":0,
//         "maxDistance":0,
//         "amount":1
//     }
// }
// const limited = 1000;
// const baseUrl = 'http://localhost:7071/';
const baseUrl = 'https://local-chat.azurewebsites.net/';
const lon = 153.10352173070004;
const lat = -27.50177678975135;
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
    let params = {
        "topic": "owntracks/test/genbtn",
        "_type": "location",
        "lon": lon,
        "lat": lat,
        "tid": tid,
    }
    for (const f of fakeData) {
        let urlParams = params;
        urlParams.fakeData = f
        try {
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(urlParams),
            });
            console.log(`Response:`, response.status, JSON.stringify(urlParams));
        } catch (error) {
            console.error(`Error:`, error.message);
        }
    };
}

test();