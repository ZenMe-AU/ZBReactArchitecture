
//Write 1000 user locations to the database for a specific deviceid.
//TODO: Luke change the code to match above description.
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