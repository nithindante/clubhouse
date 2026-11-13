const { body, param, validationResult } = require("express-validator");
const crypto = require('node:crypto')
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const validatePassword = require("../lib/passwordUtils.js").validPassword;
const genPassword = require("../lib/passwordUtils.js").genPassword;
const db = require("../db/queries.js");
const customFields = {
  usernameField: "user_name",
  passwordField: "password",
};
const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest()
const validateText = [
  body("text")
  .notEmpty()
  .withMessage("Message cannot be empty")
  .bail()
  .isLength(10)
  .withMessage("Minimum 10 characters must be entered")
]
const checkPassword = [
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)
    .withMessage("Password must contain the characters")
    .bail(),
];
const validateFullName = [
  body("full_name")
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .bail()
    .matches(/^[A-Za-z][A-Za-z .'-]*$/)
    .withMessage(
      "Name can only contain letters, spaces, hyphens, apostrophes and periods",
    )
    .bail()
    .isLength(5)
    .withMessage("Name must have 5 characters"),
];

const validateUserName = [
  body("user_name")
    .trim()
    .notEmpty()
    .withMessage("User Name must not be empty")
    .bail()
    .isLength(5)
    .withMessage("User Name must have minimum 5 letters")
    .bail()
    .custom(async (value) => {
      const user = await db.onCheckUserNameAvailability(value);
      if (user.rows.length) {
        throw new Error("UserName already in use");
      }
    })
    .bail(),
];
const validateAdmin =[
  body('secret_code')
    .trim()
    .notEmpty()
    .withMessage('must not be empty')
    .bail()
    .isLength(4)
    .withMessage('Minimum 4 characters')
    .bail()
]
const validatesPassword = [
  body("confirm_password")
    .trim()
    .notEmpty()
    .withMessage("must not be empty")
    .bail()
    .custom((confirm_password, { req }) => {
      const password = req.body.password;
      if (password !== confirm_password) {
        throw new Error("Passwords must be same");
      }
      return true;
    }),
];
const createUser = [
  validateFullName,
  validateUserName,
  validatesPassword,
  checkPassword,
  async (req, res) => {
    const user = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("sign-up", { errors: errors.array() });
    }
    const saltHash = genPassword(user.password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;
    const newUser = {
      user_name: req.body.user_name,
      hash: hash,
      salt: salt,
      full_name: user.full_name,
    };
    await db.insertUser(newUser);
    res.redirect("/");
  },
];

const verifyCallBack = async (username, password, done) => {
  const user = (await db.getUser(username)).rows;
  if (!user.length) {
    return done(null, false, { message: "No such user exist" });
  }
  const isValid = validatePassword(password, user[0].hash, user[0].salt);
  if (isValid) {
    return done(null, user[0]);
  }
  return done(null, false, { message: "Invalid credentials" });
};

const strategy = new LocalStrategy(customFields, verifyCallBack);
passport.use(strategy);
passport.serializeUser((user, done) => {
  done(null, user.user_name);
});
passport.deserializeUser(async (name, done) => {
  const user = (await db.getUser(name)).rows;
  if (user.length) {
    done(null, user[0]);
    return;
  }
  done(null, false);
  return;
});

const checkMember = (user) => {
  if(user.member_status === 'admin')
  {
    return true;
  }
  if (user.member_status != "member") {
    return false;
  }
  return true;
};

const addMessage = [
  validateText,
  async (req,res) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("create-message", { errors: errors.array() });
    }
    await db.addMessageToUser(req.user.id,req.body)
    res.redirect('/dashboard')
  }
]

const loadData = async (req,res) => {
  const messagesData = (await db.loadMessages()).rows
  res.render('index',{messages : messagesData})
}

const getUserMessages = async (req,res) => {
  const userMessages = (await db.getUserMessages(req.user.id))
  res.render('my-messages',{messages : userMessages})
}

const checkAdmin = [
  validateAdmin,
  async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("admin", { errors: errors.array() });
    }
        if (req.user.member_status === 'admin') {
        return res.redirect('/dashboard')
    }
      const secret = process.env.ADMIN_SECRET
          const code = (req.body.secret_code || '').trim()
          const matches = secret && code && crypto.timingSafeEqual(sha256(code), sha256(secret))
            if (!matches) {
            return res.render('admin', { errors: ['Incorrect secret code'] })
        }
    await db.checkAdmin(req.user.user_name)
    res.redirect('/dashboard')
  }
]

const deleteMessage = async (req,res) => {
  await db.deleteMessage(req.params.id)
  res.redirect('/dashboard')
}
module.exports = {
  createUser,
  checkMember,
  addMessage,
  loadData,
  getUserMessages,
  checkAdmin,
  deleteMessage
};
