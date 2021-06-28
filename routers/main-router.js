var express = require("express")
var router = express.Router()

var dirname = __dirname.slice(0, -7)
var controller = require('../controllers/auth-controller')
var authMiddleware = require('../middleware/auth-middleware')

router.get("/", function (req, res) {
    res.render("index", {title: 'Etsy tools'})
})

router.get("/tracking-shop", function (req, res) {
    res.render("tracking_shop", {title: 'Tracking Shops'})
})

router.get("/tracking-product", function (req, res) {
    res.render("tracking_product", {title: 'Tracking Products'})
})

router.get("/tools", function (req, res) {
    res.render("tools", {title: 'Tools Braumstar'})
})

// router.get("/listing", function (req, res) {
//     res.render("/etsy_listing", {title: 'Etsy tools'})
// })

router.get("/add_tracking_history", function (req, res) {
    res.render("add_tracking_etsy_history", {title: 'Add Tracking History'})
})

router.get("/undefined", function (req, res) {
    res.send('null')
})

router.get("/mockup", authMiddleware.requireAuth, function (req, res) {
    res.render("mockup", {title: 'Create Mockup'})
})

router.get("/login", controller.login)
router.get("/logout", controller.logout)
router.post('/login', controller.postLogin)

module.exports = router