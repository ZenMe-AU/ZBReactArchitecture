
//Search for users near the device at the given time and repeat the search 1000 times.
//TODO: Luke update test to match above description

async function stressTest() {
    const url = 'https://local-chat.azurewebsites.net/api/httpTrigger1';
    let urlParams = "";

    for (let i = 0; i < 1000; i++) {
        try {
            const response = await fetch(url,urlParams);
            console.log(`Response ${i}:`, response.status);
        } catch (error) {
            console.error(`Error ${i}:`, error.message);
        }
    }
}

stressTest();