const express = require('express')
const router = express.Router()
const {loadData} = require('../controllers/userController')
router.get('/',async (req,res)=>{
     if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
   await loadData(req,res)
   
})    
module.exports = router;  