/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

//Write random user locations to the database for one deviceid and locations changing randomly in a specified radius.
//TODO: Luke copy generate fake data code here.

const limited = 1000;

async function stressTest() {
    const url = 'https://local-chat.azurewebsites.net/api/LocationWrite';
    let urlParams = {
        "_type": "location",
        "topic": "owntracks/stressTest",
        "tid": getRandomInRange(1, 100, 0),
        "lat": getRandomInRange(-90, 90, 5),
        "lon": getRandomInRange(-180, 180, 5),
    };
    if (urlParams.device === 1) {urlParams.device = 'l1'}
    
    for (let i = 0; i < limited; i++) {
        try {
            urlParams.lat += (getRandomInRange(-2, 2, 1)/100000);
            urlParams.lon += (getRandomInRange(-2, 2, 1)/100000);
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(urlParams),
            });
            console.log(`Response ${i}:`, response.status, JSON.stringify(urlParams));
        } catch (error) {
            console.error(`Error ${i}:`, error.message);
        }
        await new Promise(r => setTimeout(r, 2000));
    }
}

function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
}

stressTest();