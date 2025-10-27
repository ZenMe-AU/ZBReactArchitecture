/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// const baseUrl = 'http://localhost:7071/';
const baseUrl = 'https://local-chat.azurewebsites.net/';
const tid = 'l1';
const interval = 5;
const distance = [0, 1, 2, 5, 10];

async function test() {
    const url = new URL('/api/SearchNearMe', baseUrl);
    const params = {
        "device": tid,
        "interval": interval,
    }
    console.log(JSON.stringify(params));

    for (const d of distance) {
        try {
            let urlParams = params;
            urlParams.distance = d;
            const response = await fetch(url + '?' + new URLSearchParams(urlParams).toString(), {
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
            console.log(`Response:`, response.status, '|', `users within ${d} meters: ${data.return.users.length}`);
        } catch (error) {
            console.error(`Error:`, error.message);
        }
    };
}

test();