
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


import pandas as pd
import mysql.connector
import random
from datetime import datetime, timedelta

from schemas import Users as UsersSchemas
from flask_pydantic import validate

dbuser = 'luke'
dbpassword =''
dbhost = '127.0.0.1'
database = 'localchat'

@app.route("/", methods=['GET'])
@validate()
def getUsers(query: UsersSchemas):
    # select_query = "SELECT * FROM location"
    request_time = request.values.get('datetime', datetime.now().strftime('%Y-%m-%dT%H:%M'))
    interval     = int(request.values.get('interval', '60'))
    distance     = int(request.values.get('distance', '10'))
    limited      = int(request.values.get('limited', '100'))

    print(request_time)

    start_time = (datetime.strptime(request_time,'%Y-%m-%dT%H:%M') - timedelta(minutes=interval)).strftime('%Y-%m-%dT%H:%M')
    print(interval)
    print(distance)
    print(limited)
    print(start_time)
    distance *= 0.00001

    select_query = f'''
        SELECT  `location`.`tid`, user.name, user.avatar
        FROM
	        (SELECT `id`, `topic_id`, `tid`, `lat`, `lon`, `response`, `time`
                FROM `location`
                WHERE (`tid` = 'l1') AND (`time` BETWEEN '{start_time}' AND '{request_time}')) as A,
            `location`
		        left JOIN user ON `location`.`tid` = user.`tid`
        WHERE
            (`location`.`tid`!= A.tid
                and (`location`.`lat` BETWEEN A.`lat`-{distance} AND A.`lat`+{distance} )
                and (`location`.`lon` BETWEEN A.`lon`-{distance} AND A.`lon`+{distance} ))
            and (`location`.`time` BETWEEN DATE_SUB(A.`time`, INTERVAL 1 MINUTE) and DATE_ADD(A.`time`, INTERVAL 1 MINUTE))
        GROUP BY user.id;
    '''

    print(select_query)
    # Connect to MySQL
    conn = mysql.connector.connect(user=dbuser, password=dbpassword, host=dbhost, database=database)

    # Fetch data into a pandas DataFrame
    df = pd.read_sql(select_query, conn)
    # print(df.head())
    users = users = [v for k, v in df.to_dict('index').items()]
    # print(users)
    # # return "Hello, World!"
    # users = [
    #     {"name":"A", "pic":"avatar_1.jpg"},
    #     {"name":"B", "pic":"avatar_2.jpg"},
    #     {"name":"C", "pic":"avatar_3.jpg"},
    #     {"name":"D", "pic":"avatar_4.jpg"},
    #     {"name":"E", "pic":"avatar_5.jpg"},
    #     {"name":"F", "pic":"avatar_6.jpg"}
    # ]

    # random.shuffle(users)

    return jsonify({'return': {'users':users}})
