const MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/"
var clientDB
var dbo

module.exports.getAll = async function (req, res) {
    try {
        clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        dbo = clientDB.db("trackingdb")

        let customQuery = {}, queryObj = {}, dbData
        let offset = parseInt(req.query.offset)
        let limit = parseInt(req.query.limit)
        let type = parseInt(req.query.type) 
        let category = req.query.category
        let month = parseInt(req.query.month)
        let sales = parseInt(req.query.sales)
        let search = req.query.search
        let sort_by = parseInt(req.query.sort_by)

        if (sales > 10) {
            customQuery.total_sales = { $gte: sales }
        }

        if (type == 1) {
            customQuery.$where = "this.digital_listing_count >= (this.listing_active_count / 5)"
        } else if (type == 2) {
            customQuery.$where = "this.digital_listing_count < (this.listing_active_count / 3)"
        }

        if (search) {
            dbData = await dbo.collection("shop").find({ shop_name: { $regex: search, $options: 'i' } }).toArray()

            res.send({
                isSearch: 1,
                total: dbData.length,
                shopData: dbData.slice(offset, offset + limit),
            })
            return
        }

        queryObj = { ...customQuery }

        dbData = await dbo.collection("shop").find({ ...queryObj }).toArray()
        dbData = await searchOrFilterData(dbData, category, month, sort_by)

        res.send({
            total: dbData.length,
            shopData: dbData.slice(offset, offset + limit),
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
        try {
            if (getMonthTime(item.creation_tsz) == parseInt(month)) {
                filterData.push(item)
            }
        } catch (error) {
            console.log(error)
        }
    }

    return filterData
}

getDayTimeLife = creation_time => {
    let timeNow = new Date().getTime()
    let life_time = ~~(timeNow / 1000) - creation_time
    return ~~(life_time / 86400)
}

getAvgSales = (total_sales, creation_time) => {
    let avgSales = total_sales / getDayTimeLife(creation_time)
    return avgSales.toFixed(2)
}

compareSaleDay = (a, b) => {
    const bandA = getAvgSales(a.total_sales, a.creation_tsz)
    const bandB = getAvgSales(b.total_sales, b.creation_tsz)
    return compareAction(bandA, bandB)
}

compareSales = (a, b) => {
    const bandA = a.total_sales
    const bandB = b.total_sales
    return compareAction(bandA, bandB)
}

compareCreationTime = (a, b) => {
    const bandA = a.creation_tsz
    const bandB = b.creation_tsz
    return compareAction(bandA, bandB)
}

compareNumFavorer = (a, b) => {
    const bandA = a.num_favorers
    const bandB = b.num_favorers
    return compareAction(bandA, bandB)
}

compareListingCount = (a, b) => {
    const bandA = a.listing_active_count
    const bandB = b.listing_active_count
    return compareAction(bandA, bandB)
}

compareAction = (bandA, bandB) => {
    bandA = parseFloat(bandA)
    bandB = parseFloat(bandB)
    let comparison = 0;
    if (bandA > bandB) {
        comparison = 1;
    } else if (bandA < bandB) {
        comparison = -1;
    }
    return comparison * -1;
}

async function searchOrFilterData(shop, category, month, sort_by) {
    let dataFilter = shop

    if (category) {
        dataFilter = await getCategoryProduct(dataFilter, category)
    }

    if (month) {
        dataFilter = getMonthFilter(dataFilter, month)
    }

    if (sort_by == 1) {
        dataFilter.sort(compareSaleDay)
    } else if (sort_by == 2) {
        dataFilter.sort(compareSales)
    } else if (sort_by == 3) {
        dataFilter.sort(compareCreationTime)
    } else if (sort_by == 4) {
        dataFilter.sort(compareNumFavorer)
    } else if (sort_by == 5) {
        dataFilter.sort(compareListingCount)
    }

    // if (timeCreatedShopFilter > 0) {
    //     dataFilter = timeCreatedShopFilterAction(dataFilter)
    // } else if (timeCreatedShopFilter == 'custom') {
    //     dataFilter = timeCreatedShopFilterCustom(dataFilter)
    // }

    return dataFilter
}

module.exports.getShopTracking = async function (req, res) {
    try {
        let id = parseInt(req.query.shop_id)
        let dbData = await dbo.collection("shopTracking").find({ shop_id: id }).toArray()

        res.send({
            data: dbData,
        })
    } catch (err) {
        console.log(err)
        res.send({
            message: err,
        })
    }
}