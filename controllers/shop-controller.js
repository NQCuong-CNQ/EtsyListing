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
    try {
        let offset = parseInt(req.query.offset)
        let limit = parseInt(req.query.limit)

        clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        dbo = clientDB.db("trackingdb")

        let shopCategory = await dbo.collection("shopCategory").find().toArray()
        let dbData = await dbo.collection("shop").find().skip(offset).limit(limit).toArray()
        let lastUpdated = await dbo.collection("log").find().sort({ $natural: -1 }).limit(1).toArray()

        res.send({
            category: shopCategory,
            shopData: dbData,
            lastUpdated: lastUpdated,
            status: 1,
        })
    } catch (err) {
        console.log(err)
        res.send({
            status: 0,
            message: err,
        })
    }
}