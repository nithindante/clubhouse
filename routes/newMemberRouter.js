const express = require('express')
const crypto = require('node:crypto')
const pool = require('../db/pool')
const router = express.Router()

const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest()

router.get('/', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login')
    }
    if (req.user.member_status === 'member') {
        req.session.messages = 'You are already a member';
        return res.redirect('/dashboard')
    }
    res.render('new-member', { errors: null })
})

router.post('/', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login')
    }
    if (req.user.member_status === 'member') {
        req.session.messages = true;
        return res.redirect('/dashboard')
    }
    const secret = process.env.MEMBER_SECRET
    const code = (req.body.secret_code || '').trim()
    const matches = secret && code && crypto.timingSafeEqual(sha256(code), sha256(secret))
    if (!matches) {
        return res.render('new-member', { errors: ['Incorrect secret code'] })
    }
    await pool.query("UPDATE users SET member_status = 'member' WHERE user_name = $1", [req.user.user_name])
    res.redirect('/dashboard')
})

module.exports = router;
