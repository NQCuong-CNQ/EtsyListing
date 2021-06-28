var express = require("express")
var router = express.Router()

var dirname = __dirname.slice(0, -7)
var controller = require('../controllers/auth-controller')
var authMiddleware = require('../middleware/auth-middleware')

router.get("/", authMiddleware.requireAuth, function (req, res) {
    res.sendFile(dirname + "public/views/index.html")
})

router.get("/tracking-shop", function (req, res) {
    res.sendFile(dirname + "public/views/tracking_shop.html")
})

router.get("/tracking-product", function (req, res) {
    res.sendFile(dirname + "public/views/tracking_product.html")
})

router.get("/tools", function (req, res) {
    res.sendFile(dirname + "public/views/tools.html")
})

router.get("/listing", function (req, res) {
    res.sendFile(dirname + "public/views/etsy_listing.html")
})

router.get("/add_tracking_history", function (req, res) {
    res.sendFile(dirname + "public/views/add_tracking_etsy_history.html")
})

router.get("/undefined", function (req, res) {
    res.send('null')
})

router.get("/mockup", function (req, res) {
    res.sendFile(dirname + "public/views/mockup.html")
})

router.get("/login", controller.login)
router.post('/login', controller.postLogin)

module.exports = router