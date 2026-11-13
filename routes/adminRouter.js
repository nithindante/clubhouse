const express = require('express')
const router = express.Router()
const {checkAdmin} = require('../controllers/userController')

router.get('/', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login')
    }
    if (req.user.member_status === 'admin') {
        req.session.messages = true;
        const errorMessages = req.session.messages
        req.session.messages = undefined
        return res.redirect('/dashboard',{errors: errorMessages})
    }

    res.render('admin', { errors: null })
})

router.post('/',checkAdmin)
module.exports = router;
