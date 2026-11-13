const path = require("node:path");
const dotenv = require('dotenv')
dotenv.config({
  path: './env/.env',
  debug: true
}) 
const express = require("express");
var passport = require('passport');
const homeRouter = require("./routes/homeRouter");
const signUpRouter = require('./routes/signUpRouter')
const loginRouter = require('./routes/loginRouter')
const createMessageRouter = require("./routes/createMessageRouter");
const myMessageRouter = require('./routes/myMessageRouter')
const newMemberRouter = require('./routes/newMemberRouter')
const dashboardRouter = require('./routes/dashboardRouter')
const adminRouter = require('./routes/adminRouter')
const logOutRouter = require('./routes/logOutRouter');
const session = require('express-session');
// const pgSession = require("connect-pg-simple")(session);
// const pools = require('./db/pool.js')
const app = express();
const PORT = process.env.PORT || 4000;
const assetsPath = path.join(__dirname + "/public");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(assetsPath));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
//   app.use(session({
//   store: new pgSession({
//     pool: pools, // Use the PostgreSQL client for session storage
//     tableName: "sessions", // Table name for storing sessions
//     createTableIfMissing: true
//   }),
//   secret: "your-secret-key", // Replace with your own secret key
//   resave: false,
//   saveUninitialized: true,
//   cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // Session expiration (30 days)
// }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/',homeRouter)
app.use('/logout',logOutRouter)
app.use('/sign-up',signUpRouter)
app.use('/login',loginRouter)
app.use('/dashboard',dashboardRouter)
app.use('/my-message',myMessageRouter)
app.use('/create-message',createMessageRouter)
app.use('/new-member',newMemberRouter)
app.use('/admin',adminRouter)
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Clubhouse loading up!`);
});