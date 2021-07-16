const MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/trackingdb"
var clientDB
var dbo

module.exports.getAll = async function (req, res) {
    try {
        clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        dbo = clientDB.db("trackingdb")

        let customQuery = {}, queryObj = {}, dbData, shopCategory, lastUpdated
        let offset = parseInt(req.query.offset)
        let limit = parseInt(req.query.limit)
        let type = parseInt(req.query.type)
        let category = req.query.category
        let month = parseInt(req.query.month)
        let sales = parseInt(req.query.sales)
        let search = req.query.search
        let sort_by = req.query.sort_by

        if (sales > 10) {
            customQuery.total_sales = { $gte: sales }
        }

        if (type == 1) {
            customQuery.$where = "this.digital_listing_count >= (this.listing_active_count / 5)"
        } else if (type == 2) {
            customQuery.$where = "this.digital_listing_count < (this.listing_active_count / 3)"
        }

        lastUpdated = await dbo.collection("log").find().sort({ $natural: -1 }).limit(1).toArray()
        if (search) {
            dbData = await dbo.collection("shop").find({ shop_name: { $regex: search } }).toArray()

            res.send({
                isSearch: 1,
                total: dbData.length,
                shopData: dbData.slice(offset, offset + limit),
                lastUpdated: lastUpdated[0].updateHistory,
            })
            return
        }

        queryObj = { ...customQuery }
        shopCategory = await dbo.collection("shopCategory").find().toArray()
        dbData = await dbo.collection("shop").find({ ...queryObj }).toArray()

        dbData = await searchOrFilterData(dbData, category, month)

        res.send({
            total: dbData.length,
            shopData: dbData.slice(offset, offset + limit),
            lastUpdated: lastUpdated[0].updateHistory,
        })
    } catch (err) {
        console.log(err)
        res.send({
            message: err,
        })
    }
}

getCategoryProduct = async (dataFilter, category) => {
    let filterData = [], find
    let listShopName = await dbo.collection("shopCategory").find({ 'category': { $regex: category } }).toArray()

    for (let item of listShopName) {
        find = dataFilter.find(({ shop_name }) => shop_name === item.shop_name)
        filterData.push(find)
    }

    return filterData
}

convertMonthInString = month => {
    switch (month) {
        case 'Jan': return 1
        case 'Feb': return 2
        case 'Mar': return 3
        case 'Apr': return 4
        case 'May': return 5
        case 'Jun': return 6
        case 'Jul': return 7
        case 'Aug': return 8
        case 'Sep': return 9
        case 'Oct': return 10
        case 'Nov': return 11
        case 'Dec': return 12
    }
}

getMonthTime = input => {
    var date = new Date(0)
    date.setUTCSeconds(input)
    time = String(date)
    time = time.split(' ')
    time = convertMonthInString(time[1])
    return time
}

getMonthFilter = (data, month) => {
    let filterData = []
    for (let item of data) {
        if (getMonthTime(item.creation_tsz) == parseInt(month)) {
            filterData.push(item)
        }
    }

    return filterData
}

async function searchOrFilterData(shop, category, month) {
    let dataFilter = shop

    if (category) {
        dataFilter = await getCategoryProduct(dataFilter, category)
    }

    if(month){
        dataFilter = getMonthFilter(dataFilter, month)
    }
    
    // if (timeCreatedShopFilter > 0) {
    //     dataFilter = timeCreatedShopFilterAction(dataFilter)
    // } else if (timeCreatedShopFilter == 'custom') {
    //     dataFilter = timeCreatedShopFilterCustom(dataFilter)
    // }

    return dataFilter
}

