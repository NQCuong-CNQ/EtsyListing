const MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/trackingdb"
var clientDB
var dbo

module.exports.getAll = async function (req, res) {
    try {
        clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        dbo = clientDB.db("trackingdb")
        let customQuery = {}, searchObj = {}, data = '', total = 0

        let offset = parseInt(req.query.offset)
        let limit = parseInt(req.query.limit)
        let showAdded = req.query.showAdded
        let showAccount = req.query.showAccount
        let search = req.query.search
        let searchBy = req.query.searchBy

        if (showAccount && showAdded) {
            customQuery.user = showAccount
        }

        if (search) {
            if (searchBy == 1) {
                customQuery.id = "" + search
            } else if (searchBy == 2) {
                customQuery.name = search
            } else {
                customQuery.customer_name = search
            }
        }

        if (showAdded == 'true') {
            searchObj = { ...customQuery, time_add_tracking: { $ne: null } }
            data = await dbo.collection("tracking_etsy_history").find({ ...searchObj }).sort({ time_add_tracking: -1 }).skip(offset).limit(limit).toArray()
        } else {
            searchObj = { ...customQuery }
            data = await dbo.collection("tracking_etsy_history").find({ ...searchObj }).sort({ $natural: -1 }).skip(offset).limit(limit).toArray()
        }

        total = await dbo.collection("tracking_etsy_history").find({ ...searchObj }).count()

        res.send({
            status: 1,
            total: total,
            data: data
        })
    } catch (err) {
        console.log(err)
        res.send({
            status: 0,
            message: err,
        })
    }
}

module.exports.fix = async function (req, res) {
    try {
        clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        dbo = clientDB.db("trackingdb")
        let id = req.query.id
        let actual_input = req.query.actual_input
        let carrier_name = req.query.carrier_name
        let customQuery = {}, queryObj = {}

        if(actual_input){
            customQuery.actual_input = actual_input
        }

        if(carrier_name){
            customQuery.carrier_name = carrier_name
        }

        queryObj = { ...customQuery }
        console.log(queryObj)
        // await dbo.collection("tracking_etsy_history").updateOne({ id: id }, { $set: data }, { upsert: true })

        res.send({
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