var express = require("express")
var router = express.Router()
var controller = require('../controllers/auth-controller')
var authMiddleware = require('../middleware/auth-middleware')

router.get("/", authMiddleware.requireAuth, function (req, res) {
    res.render("index", {title: 'Etsy tools', active: 'index'})
})

router.get("/tracking-shop", authMiddleware.requireAuth, function (req, res) {
    res.render("tracking_shop", {title: 'Tracking Shops', active: 'tracking-shop'})
})

router.get("/tracking-product", authMiddleware.requireAuth, function (req, res) {
    res.render("tracking_product", {title: 'Tracking Products', active: 'tracking-product'})
})

router.get("/tools", authMiddleware.requireAuth, function (req, res) {
    res.render("tools", {title: 'Tools Braumstar', active: 'tools'})
})

// router.get("/listing", function (req, res) {
//     res.render("/etsy_listing", {title: 'Etsy tools'})
// })

router.get("/add_tracking_history", authMiddleware.requireAuth, function (req, res) {
    res.render("add_tracking_etsy_history", {title: 'Add Tracking History', active: 'add_tracking_history'})
})

router.get("/undefined", function (req, res) {
    res.send('null')
})

router.get("/mockup", authMiddleware.requireAuth, function (req, res) {
    res.render("mockup", {title: 'Create Mockup', active: 'mockup'})
})

router.get("/login", controller.login)
router.get("/logout", controller.logout)
router.post('/login', controller.postLogin)

module.exports = router