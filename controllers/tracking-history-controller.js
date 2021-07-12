const MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/trackingdb"
var clientDB
var dbo

// module.exports.getAll = function(req, res){
//     res.render("login", {title: 'Login'})
// }

// module.exports.logout = function(req, res){
//     res.clearCookie('user_name')
//     res.redirect('/login')
// }

module.exports.getAll = async function (req, res) {

    let customQuery = {}, searchObj = {}

    let offset = parseInt(req.query.offset)
    let limit = parseInt(req.query.limit)
    let showAdded = req.query.showAdded
    let showAccount = req.query.showAccount
    let search = req.query.search

    if (showAccount) {
        customQuery.user = showAccount
    }

    if (search) {
        customQuery.id = search
    }

    searchObj = { ...customQuery }

    if (showAdded) {
        searchObj = { ...customQuery, time_add_tracking: { $ne: null } }
    }

    clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    dbo = clientDB.db("trackingdb")

    let total = await dbo.collection("tracking_etsy_history").count()
    let dbData = await dbo.collection("tracking_etsy_history").find({ ...searchObj }).sort({ $natural: -1 }).skip(offset).limit(limit).toArray()


    res.send({
        total: total,
        data: dbData
    })
}