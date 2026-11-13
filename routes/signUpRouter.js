const express = require('express')
const {createUser} = require('../controllers/userController')
const router = express.Router()
router.get('/',async (req,res)=>{
    res.render('sign-up',{errors: null})
})   

router.post('/', createUser)
module.exports = router; 