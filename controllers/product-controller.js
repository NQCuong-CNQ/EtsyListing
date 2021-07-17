const MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/trackingdb"
var clientDB
var dbo

module.exports.getAll = async function(req, res){
    let offset = parseInt(req.query.offset)
    let limit = parseInt(req.query.limit)
    clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    dbo = clientDB.db("trackingdb")
    let dbData = await dbo.collection("listing").find().skip(offset).limit(limit).toArray()
    
    res.send({
        data: dbData
    })
}