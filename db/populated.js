const { Client } = require("pg");
const dotenv = require('dotenv')
dotenv.config({
  path: './env/.env',
  debug: true
})
const SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  full_name VARCHAR ( 255 ),
  user_name VARCHAR ( 255 ),
  password VARCHAR (255) ,
  salt VARCHAR (255),
  hash VARCHAR (255),
  member_status VARCHAR (255)
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_type_name ON users (user_name);


CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR ( 255 ),
  text VARCHAR ( 255 ),
  time_stamp  TIMESTAMPTZ DEFAULT Now()
);


CREATE TABLE IF NOT EXISTS user_messages (
id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE
);
`
async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  await client.query(SQL); 
  await client.end();
  console.log("done");
}

main();