const MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/trackingdb"
var clientDB
var dbo




var dirname = __dirname.slice(0, -11)

module.exports.login = function(req, res){
    res.sendFile(dirname + "public/views/login.html")
}

module.exports.postLogin = async function(req, res){
    console.log(req)
    let user_name = req.body.user_name
    let pass = req.body.pass

    clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    dbo = clientDB.db("trackingdb")

    let user = await dbo.collection("user").findOne({ user_name: user_name })
    if(!user){
        res.sendFile(dirname + "public/views/login.html")
        return
    }

    if(user.pass !== pass){
        res.sendFile(dirname + "public/views/login.html")
        return
    }

    res.redirect('/')
}