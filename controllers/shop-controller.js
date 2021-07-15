const MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/trackingdb"
var clientDB
var dbo

module.exports.getAll = async function (req, res) {
    try {
        clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        dbo = clientDB.db("trackingdb")

        let customQuery = {}, queryObj = {}
        let offset = parseInt(req.query.offset)
        let limit = parseInt(req.query.limit)
        let type = parseInt(req.query.type)
        let category = parseInt(req.query.category)
        let month = parseInt(req.query.month)
        let sales = parseInt(req.query.sales)
        let search = parseInt(req.query.search)
        let sort_by = parseInt(req.query.sort_by)

        let data = ''

        if(type){
            customQuery.digital_listing_count = `{ $gt: 0 }`
        } else {
            customQuery.digital_listing_count = `{ $eq: 0 }`
        }

        queryObj = { ...customQuery }
        let shopCategory = await dbo.collection("shopCategory").find({ ...queryObj }).toArray()
        let dbData = await dbo.collection("shop").find().skip(offset).limit(limit).toArray()
        let lastUpdated = await dbo.collection("log").find().sort({ $natural: -1 }).limit(1).toArray()

        // data = searchOrFilterData(shopCategory, dbData, type, category, month, sales)
        res.send({
            shopData: dbData,
            lastUpdated: lastUpdated,
        })
    } catch (err) {
        console.log(err)
        res.send({
            message: err,
        })
    }
}

isDigitShop = data => {
    if (data.digital_listing_count > (data.listing_active_count / 10)) {
        return true
    } return false
}

getTypeProduct = (dataFilter, isDigit = false) => {
    let filterData = []

    for (let item of dataFilter) {
        if (isDigitShop(item) == isDigit) {
            filterData.push(item)
        }
    }

    return filterData
}

function searchOrFilterData(category, shop, type, category, month, sales){
    let dataFilter = shop

    if (type == 0) {
        dataFilter = getTypeProduct(dataFilter)
    } else if (type == 1) {
        dataFilter = getTypeProduct(dataFilter, true)
    }

    // if (category == 'All') {
    // } else if (category == 'Canvas') {
    //     dataFilter = getCategoryProduct(dataFilter)
    // } else if (category == 'Mug') {
    //     dataFilter = getCategoryProduct(dataFilter)
    // } else if (category == 'Shirt') {
    //     dataFilter = getCategoryProduct(dataFilter)
    // } else if (category == 'Blanket') {
    //     dataFilter = getCategoryProduct(dataFilter)
    // } else if (category == 'Tumbler') {
    //     dataFilter = getCategoryProduct(dataFilter)
    // }

    // if (salesLargerThan > 10) {
    //     dataFilter = getSalesLargerThan(dataFilter)
    // }

    // if (monthFilterShop >= 1 && monthFilterShop <= 12) {
    //     dataFilter = getMonthFilter(dataFilter)
    // }

    // if (timeCreatedShopFilter > 0) {
    //     dataFilter = timeCreatedShopFilterAction(dataFilter)
    // } else if (timeCreatedShopFilter == 'custom') {
    //     dataFilter = timeCreatedShopFilterCustom(dataFilter)
    // }

    return dataFilter
}

