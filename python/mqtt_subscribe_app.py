from paho.mqtt import client as mqtt_client
import ssl
import certifi
import json
from datetime import datetime

import db
import models

import random

broker    = 'x998c974.ala.us-east-1.emqxsl.com'
port      = 8883
topic     = "owntracks/#"
client_id = 'testluke'
username  = 'luke'
password  = ''


def connect_mqtt() -> mqtt_client:
    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print("Failed to connect, return code %d\n", rc)

    client = mqtt_client.Client(client_id=client_id, callback_api_version=mqtt_client.CallbackAPIVersion.VERSION2)
    client.tls_set(ca_certs=certifi.where(), cert_reqs=ssl.CERT_NONE)


    client.username_pw_set(username, password)
    client.on_connect = on_connect
    client.connect(broker, port)
    return client


def subscribe(client: mqtt_client):
    def on_message(client, userdata, msg):
        rsp     = msg.payload.decode()
        rspDict = json.loads(rsp)
        topicId = msg.topic.split('/')[-1]

        if rspDict.get('_type') == 'location':
            data = [models.Location(topic_id=topicId, tid=rspDict.get('tid'), lat=rspDict.get('lat'), lon=rspDict.get('lon'), response=rsp)]

            #---fake data process---#
            limit  = 100
            dLimit = 0.00008
            # dUpper = 0.01
            # dLower = 0.000009
            fakeNum = [i for i in range(1, limit+1)]
            random.shuffle(fakeNum)
            for i in fakeNum[0:random.randint(0,limit+1)]:
                data.append(models.Location(topic_id=topicId+str(i), tid=i, lat=rspDict.get('lat')+random.uniform(-dLimit, dLimit), lon=rspDict.get('lon')+random.uniform(-dLimit, dLimit), response=rsp))
            #---fake data process---#
            addLocation(data)

            print(data)

    client.subscribe(topic)
    client.on_message = on_message


def run():
    client = connect_mqtt()
    subscribe(client)
    client.loop_forever()


def addLocation(data):
    db_session = db.Session()
    db_session.add_all(data)
    db_session.commit()


if __name__ == '__main__':
    run()