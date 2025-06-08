//https://www.npmjs.com/package/postgresql-client
//npm i postgresql-client
import {Connection} from 'postgresql-client';
// Create connection
const connection = new Connection('postgres://postgress1.database.windows.net');
// Connect to database server
await connection.connect();

// Execute query and fetch rows
const result = await connection.query(
    'select * from cities where name like $1',
    {params: ['%york%']});
const rows: any[] = result.rows;
// Do what ever you want with rows

// Disconnect from server
await connection.close(); 

/*
const config = {
    user: 'zmpostressadmin', // better stored in an app setting such as process.env.DB_USER
    password: '2024 Zenme Postgress admin', // better stored in an app setting such as process.env.DB_PASSWORD
    server: 'postgress1.database.windows.net', // better stored in an app setting such as process.env.DB_SERVER
    port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
    database: 'AdventureWorksLT', // better stored in an app setting such as process.env.DB_NAME
    authentication: {
        type: 'default'
    },
    options: {
        encrypt: true
    }
}
    */
