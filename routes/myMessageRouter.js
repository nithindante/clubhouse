const express = require('express')
const { getUserMessages } = require("../controllers/userController");
const router = express.Router()
router.get('/', async (req,res) => {
    getUserMessages(req,res)
})
module.exports = router;