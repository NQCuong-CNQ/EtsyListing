const MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/trackingdb"
var clientDB
var dbo
// const jwt = require('jsonwebtoken')

module.exports.requireAuth = async function(req, res, next){
    clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    dbo = clientDB.db("trackingdb")
    let user = await dbo.collection("user").findOne({ user_name: req.cookies.user_name })

    if(!user){
        res.redirect('/login')
        return
    }

    if(!req.cookies.user_name){
        res.redirect('/login')
        return
    }

    next()
}

// module.exports.verify = function (req, res) {
//     try {
//         let token = req.cookies.token
//         let result = jwt.verify(token, 'pass')
//         if (result) {
//             res.redirect('/')
//         }
//     } catch (err) {
//         res.redirect('/login')
//     }
// }