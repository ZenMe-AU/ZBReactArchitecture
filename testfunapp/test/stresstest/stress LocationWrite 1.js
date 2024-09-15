
//Write random user locations to the database for one deviceid and locations changing randomly in a specified radius.
//TODO: Luke copy generate fake data code here.
async function stressTest() {
    const url = 'https://local-chat.azurewebsites.net/api/LocationWrite';
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