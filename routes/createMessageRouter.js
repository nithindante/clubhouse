const express = require('express')
const {checkMember,addMessage} = require('../controllers/userController')
const router = express.Router()
router.get('/',async (req,res)=>{
    
    if (!req.isAuthenticated()) {
        return res.redirect('/login')
    }
    if (!checkMember(req.user)) {
        req.session.messages = true;
        return res.redirect('/dashboard')
    }
    res.render('create-message', {user: req.user})
})

router.post('/',addMessage)
module.exports = router;