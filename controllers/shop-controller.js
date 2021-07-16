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
        let category = req.query.category
        let month = parseInt(req.query.month)
        let sales = parseInt(req.query.sales)
        let search = req.query.search
        let sort_by = req.query.sort_by

        let data = ''

        if(sales){
            customQuery.total_sales = { $gte: sales }
        }

        if(type == 1){
            customQuery.$where = "this.digital_listing_count >= (this.listing_active_count / 5)"
        } else if(type == 2){
            customQuery.$where = "this.digital_listing_count < (this.listing_active_count / 3)"
        }
        
        queryObj = { ...customQuery }
        let shopCategory = await dbo.collection("shopCategory").find().toArray()
        console.log(queryObj)
        let dbData = await dbo.collection("shop").find({ ...queryObj }).toArray()
        let lastUpdated = await dbo.collection("log").find().sort({ $natural: -1 }).limit(1).toArray()

        dbData = dbData.slice(10)
        console.log(dbData.length)
        // data = searchOrFilterData(shopCategory, dbData, category, month, sales)
        res.send({
            shopData: dbData,
            lastUpdated: lastUpdated[0].updateHistory,
        })
    } catch (err) {
        console.log(err)
        res.send({
            message: err,
        })
    }
}

getCategoryProduct = dataFilter => {
    $('#dropdown-filter-shop').text(category)

    let filterData = [], listShopName = []
    for (let item of shopCategory) {
        if (item.category.includes(category)) {
            listShopName.push(item.shop_name)
        }
    }

    for (let item of listShopName) {
        for (let itemFilter of dataFilter) {
            if (item == itemFilter.shop_name) {
                filterData.push(itemFilter)
            }
        }
    }

    return filterData
}

function searchOrFilterData(category, shop, category, month, sales){
    let dataFilter = shop


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

