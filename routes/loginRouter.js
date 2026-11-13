const express = require('express')
const passport = require('passport');
const router = express.Router()
router.get('/',async (req,res)=>{
    const errorMessages = req.session.messages
    req.session.messages = undefined
    res.render('login', {errors: errorMessages})
})   

router.post('/', passport.authenticate('local',{failureRedirect :'/login', successRedirect :'/dashboard', failureMessage : true}),
)
module.exports = router;  