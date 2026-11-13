const express = require("express");
const { checkMember,deleteMessage } = require("../controllers/userController");
const db = require("../db/queries");
const router = express.Router();
router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  const messages = (await db.loadMessages()).rows;
  const isMember = checkMember(req.user);
  const isAdmin = req.user.member_status === "admin";
  let errors = null;
  if (req.session.messages) {
    errors = req.session.messages;
    req.session.messages = undefined;
  }
  res.render("dashboard", { user: req.user, errors, messages, isMember,isAdmin });
});

router.post("/delete-message/:id", async (req,res) => {
  await deleteMessage(req,res)
})
module.exports = router;
