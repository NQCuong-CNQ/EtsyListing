var express = require("express")
var router = express.Router()

var dirname = __dirname.slice(0, -7)
var controller = require('../controllers/auth-controller')
var authMiddleware = require('../middleware/auth-middleware')

router.get("/", function (req, res) {
    res.render(dirname + "public/views/index.ejs")
})

router.get("/tracking-shop", function (req, res) {
    res.render(dirname + "public/views/tracking_shop.ejs")
})

router.get("/tracking-product", function (req, res) {
    res.render(dirname + "public/views/tracking_product.ejs")
})

router.get("/tools", function (req, res) {
    res.render(dirname + "public/views/tools.ejs")
})

router.get("/listing", function (req, res) {
    res.render(dirname + "public/views/etsy_listing.ejs")
})

router.get("/add_tracking_history", function (req, res) {
    res.render(dirname + "public/views/add_tracking_etsy_history.ejs")
})

router.get("/undefined", function (req, res) {
    res.send('null')
})

router.get("/mockup", authMiddleware.requireAuth, function (req, res) {
    res.render(dirname + "public/views/mockup.ejs")
})

router.get("/login", controller.login)
router.get("/logout", controller.logout)
router.post('/login', controller.postLogin)

module.exports = router