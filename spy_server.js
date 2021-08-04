"use strict";
const axios = require("axios")
const cheerio = require('cheerio')
const md5 = require('md5')

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest

const limit = 100
var limitPage = 30
const api_key = '2mlnbmgdqv6esclz98opmmuq'
const api_key_2 = 'v2jgfkortd8sy3w393hcqtob'
var siteUrl
var minTotalSales = 10
var maxTotalSales = 5000
var maxDateShop = 547

const MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/trackingdb"
var clientDB
var dbo

main()
async function main() {
    clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    dbo = clientDB.db("trackingdb")

    // await dbo.collection("user").deleteMany()
    // await dbo.collection("user").updateOne({ user_name: 'admin' }, { $set: { user_name: 'admin', pass: md5('Vhy!65@ljHgd8863') } }, { upsert: true })
}

setInterval(scheduleUpdate, 3600000) // 1h
async function scheduleUpdate() {
    var date = new Date().getTime()
    date = Math.floor(date / 3600000)
    let timeLeft = Math.floor(25 - (date % 26))
    console.log(`Next update:  ${timeLeft} hours`)
    if (date % 26 == 0) {
        await updateData()
    }
}

async function updateCate() {
    let category = {
        'CategoryList': 'Canvas,Canvas,Mug,Blanket,Shirt,Tumbler',
        'CategoryLink': 'https://www.etsy.com/c/home-and-living/home-decor/wall-decor/wall-hangings/prints?explicit=1&ref=pagination&page=|https://www.etsy.com/c/handmade/home-and-living/home-decor/wall-decor/wall-hangings?explicit=1&facet=home-and-living%2Fhome-decor%2Fwall-decor%2Fwall-hangings&ship_to=US&attr_346=2341&item_type=handmade&ref=pagination&page=|https://www.etsy.com/c/home-and-living/kitchen-and-dining/drink-and-barware/drinkware/mugs?explicit=1&ref=pagination&page=|https://www.etsy.com/c/home-and-living/bedding/blankets-and-throws?ref=pagination&explicit=1&page=|https://www.etsy.com/c/clothing/mens-clothing/shirts-and-tees?ref=pagination&page=|https://www.etsy.com/c/home-and-living/kitchen-and-dining/drink-and-barware/drinkware/tumblers-and-water-glasses?explicit=1&ref=pagination&page=',
    }
    await dbo.collection("category").deleteMany()
    await dbo.collection("category").insertOne(category)
}

async function updateData() {
    // await updateCate()
    await getListing()
    await getShopName()
    await updateShopInfo()
    await completeUpdate()
}

async function getListing() {
    let idListings = []
    let date = new Date().getTime()
    date = Math.floor(date / 1000)
    let listKeyWord = ["mug", "blanket", "tshirt", "canvas", "art print poster",
        "halloween canvas", "halloween tshirt", "halloween art print", "halloween mug", "halloween blanket",
        "fall season tshirt", "fall season canvas", "fall season art print", "fall season mug", "fall season blanket",
    ]

    for (let i = 1; i <= 2; i++) {
        siteUrl = `https://www.etsy.com/search?q=tumbler&page=${i}&ref=pagination`
        let data
        try {
            data = await getSearchProductFromWeb()
        } catch (err) {
            continue
        }

        console.log(i)
        for (let j = 0; j < data.length; j++) {
            idListings.push(data[j])
        }
    }

    for (let i = 0; i < listKeyWord.length; i++) {
        console.log(listKeyWord[i])
        for (let j = 1; j <= 5; j++) {
            siteUrl = `https://www.etsy.com/search?q=${listKeyWord[i]}&page=${j}&ref=pagination`
            let data
            try {
                data = await getSearchProductFromWeb()
            } catch (err) {
                continue
            }

            console.log(j)
            for (let k = 0; k < data.length; k++) {
                idListings.push(data[k])
            }
            console.log(idListings.length)
        }
    }

    let dblisting = await dbo.collection("listing").find().toArray()

    for (let i = 0; i < dblisting.length; i++) {
        if ((date - dblisting[i].original_creation_tsz) > (86400 * 30)) {
            await dbo.collection("listingBlackList").updateOne({ listing_id: dblisting[i].listing_id }, { $set: { listing_id: dblisting[i].listing_id } }, { upsert: true })
            await dbo.collection("listing").deleteMany({ listing_id: dblisting[i].listing_id })
        } else {
            idListings.push(dblisting[i].listing_id)
        }
    }

    idListings = [...new Set(idListings)]
    console.log(idListings.length)
    if (idListings.length > 15000) {
        idListings = idListings.slice(idListings.length - 15000, idListings.length)
    }
    console.log(idListings.length)

    let listings
    let listingTracking
    for (let i = 0; i < idListings.length; i++) {
        try {
            let idBlackList = await dbo.collection("listingBlackList").findOne({ listing_id: idListings[i] })
            if (idBlackList != null) {
                console.log('pass' + idListings[i])
            } else {
                let result = await makeRequest("GET", `https://openapi.etsy.com/v2/listings/${idListings[i]}?api_key=${api_key}`)

                if (IsJsonString(result)) {
                    result = JSON.parse(result).results
                    listings = result[0]

                    if (listings.state != 'active') {
                        await dbo.collection("listing").deleteMany({ listing_id: listings.listing_id })
                    }
                    if (listings.toString().includes('does not exist') || ((date - listings.original_creation_tsz) > (86400 * 30)) || listings.state != 'active') {
                        await dbo.collection("listingBlackList").updateOne({ listing_id: listings.listing_id }, { $set: { listing_id: listings.listing_id } }, { upsert: true })
                    } else {
                        listingTracking = new Object

                        let oldListing = await dbo.collection("listing").findOne({ listing_id: idListings[i] })
                        if (oldListing != null) {
                            listingTracking['img_url'] = oldListing.img_url
                            listingTracking['img_url_original'] = oldListing.img_url_original
                            console.log('get old img')
                        } else {
                            let resultImgs = await makeRequest("GET", `https://openapi.etsy.com/v2/listings/${idListings[i]}/images?api_key=${api_key}`)

                            if (IsJsonString(resultImgs)) {
                                resultImgs = JSON.parse(resultImgs).results[0]
                                listingTracking['img_url'] = resultImgs.url_570xN
                                listingTracking['img_url_original'] = resultImgs.url_fullxfull
                            }
                        }

                        let percentFavor
                        if (listings.views > 0) {
                            percentFavor = (listings.num_favorers / listings.views) * 100
                        } else {
                            percentFavor = 0
                        }
                        percentFavor = percentFavor.toFixed(0)
                        listingTracking['percent_favor'] = percentFavor

                        console.log(listings.listing_id)

                        listingTracking['listing_id'] = listings.listing_id
                        listingTracking['title'] = listings.title
                        listingTracking['taxonomy_path'] = listings.taxonomy_path
                        listingTracking['url'] = listings.url
                        listingTracking['original_creation_tsz'] = listings.original_creation_tsz
                        listingTracking['quantity'] = listings.quantity
                        listingTracking['views'] = listings.views
                        listingTracking['num_favorers'] = listings.num_favorers
                        listingTracking['date_update'] = Math.floor(date / 86400)
                        listingTracking['price'] = listings.price
                        listingTracking['is_digital'] = listings.is_digital

                        await dbo.collection("listing").insertOne(listingTracking)
                    }
                }
            }
            await sleep(100)
        } catch (error) {
            console.log('getListing ' + error)
        }
    }
}

async function getShopName() {
    let category = await dbo.collection("category").findOne()
    let categoryList = category.CategoryList.split(',')
    let categoryLink = category.CategoryLink.split('|')

    for (let index = 0; index < categoryList.length; index++) {
        if (index == 0 || index == 1) {
            limitPage = 80
        } else {
            limitPage = 40
        }

        console.log('category: ' + categoryList[index])
        for (let i = 0; i < limitPage; i++) {
            let siteUrlPage = categoryLink[index] + (i + 1)
            console.log('siteUrlPage: ' + siteUrlPage)

            let dataShopName
            try {
                dataShopName = await getShopNameFromWeb(siteUrlPage)
            } catch (error) {
                continue
            }
            console.log('page: ' + i)
            await saveShopNameToDB(dataShopName, categoryList[index])
        }
    }

    let shopName = await dbo.collection("shopName").find().toArray()
    for (let index = 0; index < shopName.length; index++) {
        siteUrl = "https://www.etsy.com/shop/" + shopName[index].shop_name
        let shopData
        try {
            shopData = await getTotalSalesAndImgFromWeb()
        } catch (error) {
            continue
        }

        let total_sales = parseInt(shopData.totalSales)
        let imgs = shopData.imgs

        console.log(shopName[index].shop_name + ":" + total_sales)
        if (total_sales >= minTotalSales && total_sales <= maxTotalSales) {
            await dbo.collection("shopName").updateOne({ shop_name: shopName[index].shop_name }, { $set: { total_sales: total_sales, imgs_listing: imgs } }, { upsert: true })
            console.log('ok')
        } else {
            await deleteShop(shopName[index].shop_name)
        }
    }
    console.log('getting shop name done!')
}

async function saveShopNameToDB(dataShopName, shopCategory) {
    let shopBlackList = await dbo.collection("shopBlackList").find().toArray()
    shopBlackList = shopBlackList.map(({ shop_name }) => shop_name)

    for (let i = 0; i < dataShopName.length; i++) {
        try {
            if (shopBlackList.includes(dataShopName[i])) {
                console.log('black list: ' + dataShopName[i])
            } else {
                await dbo.collection("shopName").updateOne({ shop_name: dataShopName[i] }, { $set: { shop_name: dataShopName[i] } }, { upsert: true })

                let currentVal = await dbo.collection("shopCategory").findOne({ shop_name: dataShopName[i] })
                let currCate = ''
                let newshopCategory = shopCategory
                if (currentVal != '') {
                    try {
                        currCate = currentVal.category
                    } catch (e) {
                    }
                    if (currCate == '') {
                    } else {
                        if (currCate.includes(shopCategory)) {
                            newshopCategory = currCate
                        } else {
                            newshopCategory = currCate + ',' + shopCategory
                        }
                    }
                }
                console.log('shop cate: ' + newshopCategory)
                await dbo.collection("shopCategory").updateOne({ shop_name: dataShopName[i] }, { $set: { shop_name: dataShopName[i], category: newshopCategory } }, { upsert: true })
            }
        } catch (error) {
            console.log(error)
        }
    }
    await sleep(100)
}

async function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    )
}

async function updateShopInfo() {
    let dbData = await dbo.collection("shopName").find().toArray()

    if (dbData.length > 9000) {
        dbData = dbData.slice(dbData.length - 9000, dbData.length)
    }
    console.log(dbData.length)

    let date = new Date().getTime()
    let dateCount = Math.floor(date / 1000) - (maxDateShop * 86400)

    for (let index = 0; index < dbData.length; index++) {
        try {
            let response = await makeRequest("GET", `https://openapi.etsy.com/v2/shops/${dbData[index].shop_name}?api_key=${api_key_2}`)
            if (IsJsonString(response)) {
                response = JSON.parse(response).results

                if (response[0]['creation_tsz'] < dateCount || (dbData[index].total_sales > maxTotalSales && dbData[index].total_sales < minTotalSales)) {
                    await deleteShop(response[0]['shop_name'])
                    console.log('removed ' + response[0]['shop_name'] + " - " + response[0]['creation_tsz'] + '<' + dateCount)
                } else if (response[0]['creation_tsz'] === null) {

                } else {
                    console.log('updateShopInfo: ' + response[0].shop_id)
                    response[0]['total_sales'] = dbData[index].total_sales
                    response[0]['imgs_listing'] = dbData[index].imgs_listing
                    await dbo.collection("shop").updateOne({ shop_id: response[0].shop_id }, {
                        $set: {
                            shop_id: response[0].shop_id,
                            imgs_listing: response[0]['imgs_listing'],
                            total_sales: response[0]['total_sales'],
                            shop_name: response[0]['shop_name'],
                            url: response[0]['url'],
                            creation_tsz: response[0]['creation_tsz'],
                            num_favorers: response[0]['num_favorers'],
                            currency_code: response[0]['currency_code'],
                            listing_active_count: response[0]['listing_active_count'],
                            digital_listing_count: response[0]['digital_listing_count'],
                            languages: response[0]['languages'],
                            user_id: response[0]['user_id'],
                        }
                    }, { upsert: true })

                    let timeNow = getDateTimeNow()
                    await dbo.collection("shopTracking").insertOne({
                        'shop_id': response[0].shop_id,
                        'shop_name': response[0].shop_name,
                        'total_sales': dbData[index].total_sales,
                        'listing_active_count': response[0].listing_active_count,
                        'num_favorers': response[0].num_favorers,
                        'time_update': timeNow
                    })
                }
                await sleep(100)
            }
        } catch (error) {
            console.log('updateShopInfo error ' + error)
        }
    }
}

async function deleteShop(shopName) {
    console.log('delete ' + shopName)
    await dbo.collection("shopBlackList").updateOne({ shop_name: shopName }, { $set: { shop_name: shopName } }, { upsert: true })
    await dbo.collection("shopName").deleteMany({ shop_name: shopName })
    await dbo.collection("shopCategory").deleteMany({ shop_name: shopName })
    await dbo.collection("shop").deleteMany({ shop_name: shopName })
    await dbo.collection("shopTracking").deleteMany({ shop_name: shopName })
}

function getDateTimeNow() {
    let date = new Date().getTime()
    let time = Math.floor(date / 1000)
    return time
}

async function completeUpdate() {
    let timeNow = getDateTimeNow()

    await dbo.collection("log").insertOne({ updateHistory: timeNow })
    console.log("Update completed at: " + timeNow)
}

async function getSearchProductFromWeb() {
    const $ = await fetchData(siteUrl)
    if ($ == 0) {
        return 0
    }
    let searchProduct = $('[data-search-results]').html()
    if (searchProduct == '') {
        return 0
    }

    searchProduct = searchProduct.split('href="https://www.etsy.com/listing/')
    for (let i = 0; i < searchProduct.length; i++) {
        searchProduct[i] = searchProduct[i].substring(0, 12).split('/')[0]
    }

    searchProduct.shift()
    return searchProduct
}

async function fetchData(siteUrl) {
    let result

    try {
        result = await axios.get(siteUrl)
    } catch (err) {
        console.log('error get url')
        return 0
    }

    if (result == 404) {
        console.log('error 404')
        return 0
    }
    return cheerio.load(result.data)
}

async function getTotalSalesAndImgFromWeb() {
    const $ = await fetchData(siteUrl)
    if ($ == 0) {
        return 0
    }

    let data = []
    let totalSales

    if ($('.shop-sales-reviews > span') == null) {
        data['totalSales'] = 0
        data['imgs'] = 0
        return data
    }

    totalSales = $('.shop-sales-reviews > span').text().split(' ')
    if (totalSales == '') {
        return 0
    }
    totalSales = totalSales[0].replace(/,/g, '')
    data['totalSales'] = totalSales

    let imgs = $('[data-listings-container]').html()
    if (imgs == null) {
        data['totalSales'] = 0
        return data
    }
    imgs = imgs.split('<img data-listing-card-listing-image="" src="')
    for (let i = 0; i < imgs.length; i++) {
        imgs[i] = imgs[i].split('"')[0]
    }

    imgs.shift()
    imgs.splice(8, imgs.length)
    data['imgs'] = imgs
    return data
}

async function getShopNameFromWeb(siteUrl) {
    const $ = await fetchData(siteUrl)
    if ($ == 0) {
        return 0
    }

    let shopName = $('ul.tab-reorder-container').text()
    shopName = shopName.split('shop ')
    shopName.splice(0, 1);
    for (let index = 0; index < shopName.length; index++) {
        shopName[index] = shopName[index].split(' ')[0].trim()
    }

    return shopName
}

async function makeRequest(method, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest()
        xhr.open(method, url)
        xhr.onreadystatechange = function () {
            if (xhr.readyState === xhr.DONE) {
                let status = xhr.status
                if (status === 0 || (status >= 200 && status < 400)) {
                    resolve(xhr.responseText)
                }
                else if (status === 404) {
                    resolve(0)
                }
            }
        }
        xhr.send()
    })
}

function IsJsonString(str) {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}