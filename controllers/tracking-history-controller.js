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
    let offset = parseInt(req.query.offset)
    let limit = parseInt(req.query.limit)
    clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    dbo = clientDB.db("trackingdb")
    let dbData = await dbo.collection("tracking_etsy_history").find({ time_add_tracking: { $ne: null } }).sort({ $natural: -1 }).skip(offset).limit(limit).toArray()

    res.send({
        data: dbData
    })
}