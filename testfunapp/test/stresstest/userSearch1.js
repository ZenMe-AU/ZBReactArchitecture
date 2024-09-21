
//Search for users near the device at the given time and repeat the search 1000 times.
//TODO: Luke update test to match above description

const limited = 1000;

async function stressTest() {
    const url = 'https://local-chat.azurewebsites.net/api/SearchNearMe';
    let urlParams = {};

    for (let i = 0; i < limited; i++) {
        try {
            urlParams = {
                device: getRandomInRange(1, 100, 0),
                datetime: new Date(+(new Date()) - Math.floor(Math.random() * 10000000000)),
                interval: getRandomInRange(1, 5000, 0),
                distance: getRandomInRange(1, 10, 0),
            }
            if (urlParams.device === 1) {urlParams.device = 'l1'}
            const response = await fetch(url + '?' + new URLSearchParams(urlParams).toString(), {
                method: 'get' ,
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin' : '*'
                }
              });
              if (!response.ok) {
                throw new Error(`${response.status} ${JSON.stringify(urlParams)}`);
              }
            const data = await response.json();
            console.log(`Response ${i}:`, response.status, JSON.stringify(urlParams), `users: ${data.return.users.length}`);
        } catch (error) {
            console.error(`Error ${i}:`, error.message);
        }
    }
}

function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
}

stressTest();