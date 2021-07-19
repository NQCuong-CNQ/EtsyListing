var express = require("express")
var router = express.Router()
var authController = require('../controllers/auth-controller')
var shopController = require('../controllers/shop-controller')
var productController = require('../controllers/product-controller')
var dashboardController = require('../controllers/dashboard-controller')
var trackingHistoryController = require('../controllers/tracking-history-controller')
var authMiddleware = require('../middleware/auth-middleware')

router.get("/", authMiddleware.requireAuth, function (req, res) {
    res.render("index", {title: 'Etsy tools', active: 'index'})
})

router.get("/last-updated", authMiddleware.requireAuth, dashboardController.getLastUpdated)

router.get("/tracking-shop", authMiddleware.requireAuth, function (req, res) {
    res.render("tracking_shop", {title: 'Tracking Shops', active: 'tracking-shop'})
})

router.get("/tracking-shop/getAll", authMiddleware.requireAuth, shopController.getAll)

router.get("/tracking-shop/get-shop-tracking", authMiddleware.requireAuth, shopController.getShopTracking)

router.get("/tracking-product/getAll", authMiddleware.requireAuth, productController.getAll)

router.get("/add_tracking_history/getAll", authMiddleware.requireAuth, trackingHistoryController.getAll)

router.get("/add_tracking_history/fix", authMiddleware.requireAuth, trackingHistoryController.fix)

router.get("/tracking-product", authMiddleware.requireAuth, function (req, res) {
    res.render("tracking_product", {title: 'Tracking Products', active: 'tracking-product'})
})

router.get("/tools", authMiddleware.requireAuth, function (req, res) {
    res.render("tools", {title: 'Tools Braumstar', active: 'tools'})
})

router.get("/add_tracking_history", authMiddleware.requireAuth, function (req, res) {
    res.render("add_tracking_etsy_history", {title: 'Add Tracking History', active: 'add_tracking_history'})
})

// router.get("/undefined", function (req, res) {
//     res.send(null)
// })

router.get("/mockup", authMiddleware.requireAuth, function (req, res) {
    res.render("mockup", {title: 'Create Mockup', active: 'mockup'})
})

router.get("/login", authController.login)
router.get("/logout", authController.logout)
router.post('/login', authController.postLogin)

router.get("/listing", authMiddleware.requireAuth, function (req, res) {
    res.render("listing", {title: 'Listing', active: 'listing'})
})

module.exports = router