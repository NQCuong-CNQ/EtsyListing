const MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/trackingdb"
var clientDB
var dbo
const md5 = require('md5')
var dirname = __dirname.slice(0, -11)

module.exports.login = function(req, res){
    res.sendFile(dirname + "public/views/login.html")
}

module.exports.postLogin = async function(req, res){
    console.log(req.body)
    let uName = req.body.user_name
    let pass = req.body.pass

    clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    dbo = clientDB.db("trackingdb")

    let user = await dbo.collection("user").findOne({ user_name: uName })
    
    if(!user){
        console.log('ko có user')
        res.sendFile(dirname + "public/views/login.html")
        return
    }

    if(user.pass !== md5(pass)){
        console.log('sai pass')
        res.sendFile(dirname + "public/views/login.html")
        return
    }
    console.log('ok')

    res.cookie('user_name', uName)
    res.redirect('/')
}