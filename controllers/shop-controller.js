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

module.exports.getAll = async function(req, res){
    console.log(req)
    clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    dbo = clientDB.db("trackingdb")
    let dbData = await dbo.collection("shop").find().skip(0).limit(100).toArray()
    
    res.send({
        data: dbData
    })
}