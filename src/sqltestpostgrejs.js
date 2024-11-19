import { Connection } from 'postgrejs';
import 'dotenv/config'

// console.log(process.env["DB_SERVER"])
// console.log(process.env["DB_PORT"])
// console.log(process.env["DB_USER"])
// console.log(process.env["DB_PASSWORD"])
// console.log(process.env["DB_NAME"])

const connection = new Connection({
    host: process.env["DB_SERVER"],
    port: process.env["DB_PORT"],
    user: process.env["DB_USER"],
    password: process.env["DB_PASSWORD"],
    database: process.env["DB_NAME"]
});
await connection.connect();


// const executeResult = await connection.execute('SELECT version();');
// console.log(executeResult.results[0].rows);

// const executeResult2 = await connection.execute('select * from pg_catalog.pg_tables;'); // where table_schema='public';
// console.log(executeResult2.results[0].rows);

const executeResult = await connection.execute('select * from users;');
console.log(executeResult.results[0].rows);


// const executeResult = await connection.execute(
//         `CREATE TABLE users (
//             id      int,
//             name    varchar(80),
//             avatar  varchar(225)
//         );`
//     );
// console.log(executeResult.results[0].rows);

await connection.close();