import { connect } from "mqtt"; // import connect from mqtt
import { Users, Location } from './models.js'
import 'dotenv/config';

let mqtt_topic     = "owntracks/#";
let mqtt_client_id = 'testluke';

let client = connect(process.env["MQTT_BROKER"], {
    clean: true,
    connectTimeout: 4000,
    clientId: mqtt_client_id,
    port: process.env["MQTT_PORT"],
    username: process.env["MQTT_USERNAME"],
    password: process.env["MQTT_PASSWORD"]
  }); // create a client


client.on("connect", () => {
    client.subscribe(mqtt_topic, function (err) {})
});

client.on('message', function (topic, payload, packet) {
    // Payload is Buffer
    console.log(`Topic: ${topic}, Message: ${payload.toString()}`)
    let topicId = topic.split('/').pop();
    let rsp = payload.toString();
    let rspDict = JSON.parse(payload);
    // console.log(JSON.parse(payload));
    if (rspDict['_type'] == 'location') {
        Location.create({
            topicId: topicId,
            tid: rspDict['tid'],
            lat: rspDict['lat'],
            lon: rspDict['lon'],
            response: rsp
        });


        // ---fake data process--- //
        let fakeData = [];
        let fakeNum = [];
        let limit  = 100;
        let dLimit = 0.00008;
        for (let i = 0; i <= Math.floor(Math.random() * limit); i++) {
            fakeNum.push(Math.floor(Math.random() * (limit+1)));
        }
        fakeNum = [...new Set(fakeNum)];
        fakeNum.forEach((n) => {
            if (n > 0) {
                fakeData.push({
                    topicId: topicId.concat('', n),
                    tid: n,
                    lat: rspDict['lat'] + (Math.random() * dLimit * 2) + (dLimit * -1),
                    lon: rspDict['lon'] + (Math.random() * dLimit * 2) + (dLimit * -1),
                    response: rsp
                })
            }
        });
        Location.bulkCreate(fakeData, {
            validate: true,
        });
        // ---fake data process--- //
    }
});
