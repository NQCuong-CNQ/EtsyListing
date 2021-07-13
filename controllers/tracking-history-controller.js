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

    clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    dbo = clientDB.db("trackingdb")
    let customQuery = {}, searchObj = {}, data = '', total = 0

    let offset = parseInt(req.query.offset)
    let limit = parseInt(req.query.limit)
    let showAdded = req.query.showAdded
    let showAccount = req.query.showAccount
    let search = req.query.search

    if (showAccount && showAdded) {
        customQuery.user = showAccount
    }

    let searchStr = `{ $or:[
        {"id":{"$eq":${search}}},
        {"name":{"$eq":${search}}},
        {"customer_name":{"$eq":${search}}},
        {"customer_email":{"$eq":${search}}},
        {"number_tracking":{"$eq":${search}}}
    ] }`
    console.log(search)
    console.log(searchStr)
    if(search){
        searchObj = { ...searchStr }
    }
    console.log(searchObj)
    if (showAdded == 'true') {
        customQuery.time_add_tracking = '{ $ne: null }'
        searchObj = { ...customQuery }
        console.log(searchObj)
        data = await dbo.collection("tracking_etsy_history").find({ ...searchObj }).sort({ time_add_tracking: -1 }).skip(offset).limit(limit).toArray()
    } else {
        searchObj = { ...customQuery }
        data = await dbo.collection("tracking_etsy_history").find({ ...searchObj }).sort({ $natural: -1 }).skip(offset).limit(limit).toArray()
    }

    total = await dbo.collection("tracking_etsy_history").find({ ...searchObj }).count()

    res.send({
        total: total,
        data: data
    })
}