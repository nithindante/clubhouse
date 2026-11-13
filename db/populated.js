const { Client } = require("pg");
const dotenv = require('dotenv')
const session = require('express-session');
const express = require("express");
const app = express();
const pgSession = require("connect-pg-simple")(session);
dotenv.config({
  path: './env/.env',
  debug: true
})
const sqlConnection = require('../env/dev.env');
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
  });
  app.use(session({
  store: new pgSession({
    pool: client, // Use the PostgreSQL client for session storage
    tableName: "sessions", // Table name for storing sessions
    createTableIfMissing: true
  }),
  secret: "your-secret-key", // Replace with your own secret key
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // Session expiration (30 days)
}));
  await client.connect();
  await client.query(SQL); 
  await client.end();
  console.log("done");
}

main();