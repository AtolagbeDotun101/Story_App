const express = require('express');
const { ensureGuest, ensureAuth } = require('../middleware/auth');
const router = express.Router()
const Story = require('../model/story')


// GET login route
router.get('/', ensureGuest, (req, res) => {
    res.render('Login', {layout:'login'})
})


// GET dashboard link
router.get("/dashboard", ensureAuth, async(req, res) => {
   try {
    const stories = await Story.find({ user: req.user.id }).lean()
    res.render('dashboard', {
      name: req.user.firstName,
      stories,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
}
);


module.exports = router