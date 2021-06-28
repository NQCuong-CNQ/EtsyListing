const MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/trackingdb"
var clientDB
var dbo

module.exports.requireAuth = function(req, res, next){
    clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    dbo = clientDB.db("trackingdb")

    let user = await dbo.collection("user").findOne({ user_name: res.cookies.user_name })

    if(!user){
        res.redirect('/login')
        return
    }

    if(!res.cookies.user_name){
        res.redirect('/login')
        return
    }

    next()
}