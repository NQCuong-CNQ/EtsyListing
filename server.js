"use strict";
const fs = require('fs')
var express = require("express")
var app = express()
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
var xhr = new XMLHttpRequest()
const https = require("https")
const axios = require("axios")
const cheerio = require('cheerio')

var server = https.createServer({
  cert: fs.readFileSync("./ssl/fullchain.pem"),
  key: fs.readFileSync("./ssl/privkey.pem"),
}, app)

var io = require("socket.io")(server, {
  cors: {
    origin: '*',
  },
  transports: ['websocket']
})

const limit = 100
const limitPage = 5
const api_key = '2mlnbmgdqv6esclz98opmmuq'
var siteUrl
var isUpdate = false
var minTotalSales = 100
var maxTotalSales = 5000
var maxDateShop = 90

const MongoClient = require('mongodb').MongoClient;
const { Console } = require('console');
const url = "mongodb://localhost:27017/trackingdb"

setInterval(scheduleUpdate, 3600000) // 1h
async function scheduleUpdate() {
  var date = new Date().getTime()
  date = Math.floor(date / 3600000)
  // if (date % 26 == 0) {
  // await updateData()
  // }
}

async function updateCate() {
  let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  var dbo = client.db("trackingdb")

  let category = {
    'CategoryList': 'Canvas,Mug,Blanket,Shirt,Tumbler',
    'CategoryLink': 'https://www.etsy.com/c/home-and-living/home-decor/wall-decor/wall-hangings/prints?explicit=1&ref=pagination&page=|https://www.etsy.com/c/home-and-living/kitchen-and-dining/drink-and-barware/drinkware/mugs?explicit=1&ref=pagination&page=|https://www.etsy.com/c/home-and-living/bedding/blankets-and-throws?ref=pagination&explicit=1&page=|https://www.etsy.com/c/clothing/mens-clothing/shirts-and-tees?ref=pagination&page=|https://www.etsy.com/c/home-and-living/kitchen-and-dining/drink-and-barware/drinkware/tumblers-and-water-glasses?explicit=1&ref=pagination&page=',
  }
  await dbo.collection("category").insertOne(category)
}

updateData()
async function updateData() {
  isUpdate = true
  // await updateCate()
  // await getListing()
  await getShopName()
  await updateShopInfo()
  // await completeUpdate()

  isUpdate = false
}

async function getListing() {
  let idListings = []
  let date = new Date().getTime()
  let dateCount = Math.floor(date / 86400000)
  let listKeyWord = ["mug", "blanket", "tshirt", "canvas", "art print poster", "father's day canvas", "father's day tshirt", "father's day art print", "father's day mug", "father's day blanket",
    "pride month tshirt", "pride month canvas", "pride month art print", "pride month mug", "pride month blanket",
    "independence day tshirt", "independence day canvas", "independence day art print", "independence day mug", "independence day blanket",
  ]

  for (let i = 1; i <= 1; i++) {
    siteUrl = `https://www.etsy.com/search?q=tumbler&page=${i}&ref=pagination`
    let data = await getSearchProductFromWeb()
    console.log(i)
    for (let j = 0; j < data.length; j++) {
      idListings.push(data[j])
    }
  }

  for (let i = 0; i < listKeyWord.length; i++) {
    console.log(listKeyWord[i])
    for (let j = 1; j <= 3; j++) {
      siteUrl = `https://www.etsy.com/search?q=${listKeyWord[i]}&page=${j}&ref=pagination`
      let data = await getSearchProductFromWeb()
      console.log(j)
      for (let k = 0; k < data.length; k++) {
        idListings.push(data[k])
      }
      console.log(idListings.length)
    }
  }

  let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  var dbo = client.db("trackingdb")

  let dblisting = await dbo.collection("listing").find().toArray()
  for (let i = 0; i < dblisting.length; i++) {
    if ((date - dblisting[i].original_creation_tsz) > (86400 * 20)) {
      await dbo.collection("listingBlackList").updateOne({ listing_id: dblisting[i].listing_id }, { $set: { listing_id: dblisting[i].listing_id } }, { upsert: true })
      await dbo.collection("listing").deleteMany({ listing_id: dblisting[i].listing_id })
    } else {
      idListings.push(dblisting[i].listing_id)
    }
  }

  idListings = [...new Set(idListings)]
  console.log(idListings.length)
  if (idListings.length > 4500) {
    idListings = idListings.slice(idListings.length - 4500, idListings.length)
  }
  console.log(idListings.length)

  let listings
  let listingTracking
  for (let i = 0; i < idListings.length; i++) {
    let idBlackList = await dbo.collection("listingBlackList").findOne({ listing_id: idListings[i] })
    if (idBlackList != null) {
      console.log('pass' + idBlackList)
    } else {
      let result = await makeRequest("GET", `https://openapi.etsy.com/v2/listings/${idListings[i]}?api_key=${api_key}`)
      result = JSON.parse(result).results
      listings = result[0]

      if (listings.state != 'active') {
        await dbo.collection("listing").deleteMany({ listing_id: listings.listing_id })
      }
      if (listings.toString().includes('does not exist') || ((date - listings.original_creation_tsz) > (86400 * 20)) || listings.state != 'active') {
        await dbo.collection("listingBlackList").updateOne({ listing_id: listings.listing_id }, { $set: { listing_id: listings.listing_id } }, { upsert: true })
      } else {
        let resultImgs = await makeRequest("GET", `https://openapi.etsy.com/v2/listings/${idListings[i]}/images?api_key=${api_key}`)
        resultImgs = JSON.parse(resultImgs).results[0]

        listingTracking = new Object
        listingTracking['img_url'] = resultImgs.url_570xN
        listingTracking['img_url_original'] = resultImgs.url_fullxfull

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
        listingTracking['date_update'] = dateCount
        listingTracking['price'] = listings.price
        listingTracking['is_digital'] = listings.is_digital

        await dbo.collection("listing").insertOne(listingTracking)
      }
    }
    await sleep(100)
  }
  client.close()
}

async function getShopName() {
  let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  var dbo = client.db("trackingdb")
  let category = await dbo.collection("category").findOne()

  let categoryList = category.CategoryList.split(',')
  let categoryLink = category.CategoryLink.split('|')
  client.close()

  for (let index = 0; index < categoryList.length; index++) {
    console.log('category: ' + categoryList[index])
    for (let i = 0; i < limitPage; i++) {
      let siteUrlPage = categoryLink[index] + (i + 1)
      console.log('siteUrlPage: ' + siteUrlPage)

      let dataShopName = await getShopNameFromWeb(siteUrlPage)
      console.log('page: ' + i)
      await saveShopNameToDB(dataShopName, categoryList[index])
    }
  }
  client.close()
}

async function saveShopNameToDB(dataShopName, shopCategory) {
  let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  let dbo = client.db("trackingdb")
  let shopName = await dbo.collection("shopName").find({}).toArray()
  let shopBlackList = await dbo.collection("shopBlackList").find({}).toArray()

  for (let i = 0; i < dataShopName.length; i++) {
    if (shopBlackList.includes(dataShopName[i])) {

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
  }

  for (let index = 0; index < shopName.length; index++) {
    siteUrl = "https://www.etsy.com/shop/" + shopName[index].shop_name
    let shopData = await getTotalSalesAndImgFromWeb()

    let total_sales = parseInt(shopData.totalSales)
    let imgs = shopData.imgs

    console.log(shopName[index].shop_name + ":" + total_sales)
    if (total_sales >= minTotalSales && total_sales <= maxTotalSales) {
      await dbo.collection("shopName").updateOne({ shop_name: shopName[index].shop_name }, { $set: { total_sales: total_sales, imgs_listing: imgs } }, { upsert: true })
    } else {
      await deleteShop(dbo, shopName[index].shop_name)
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
  let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  var dbo = client.db("trackingdb")
  let dbData = await dbo.collection("shopName").find().toArray()

  let date = new Date().getTime()
  let dateCount = Math.floor(date / 1000) - (maxDateShop * 86400)

  for (let index = 0; index < dbData.length; index++) {
    let response = await makeRequest("GET", `https://openapi.etsy.com/v2/shops/${dbData[index].shop_name}?api_key=${api_key}`)
    if (response == '') {
    } else {
      response = JSON.parse(response).results

      if (response[0]['creation_tsz'] < dateCount || (dbData[index].total_sales > maxTotalSales && dbData[index].total_sales < minTotalSales)) {
        await deleteShop(dbo, response[0]['shop_name'])
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
  }
  client.close()
}

async function deleteShop(dbo, shopName){
  await dbo.collection("shopBlackList").updateOne({ shop_name: shopName }, { $set: { shop_name: shopName } }, { upsert: true })
  await dbo.collection("shopName").deleteMany({ shop_name: shopName })
  await dbo.collection("shopCategory").deleteMany({ shop_name: shopName })
  await dbo.collection("shop").deleteMany({ shop_name: shopName })
  await dbo.collection("shopTracking").deleteMany({ shop_name: shopName })
}

function getDateTimeNow() {
  let date = new Date().getTime()
  let time = Math.floor(date /1000)
  return time
}

async function completeUpdate() {
  let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  var dbo = client.db("trackingdb")

  let timeNow = getDateTimeNow()

  await dbo.collection("log").insertOne({ updateHistory: timeNow })
  console.log("Update completed at: " + timeNow)
  client.close()
}

app.get("/", function (req, res, next) {
  res.sendFile(__dirname + "/public/index.html")
})

app.get("/tracking-shop", function (req, res, next) {
  res.sendFile(__dirname + "/public/tracking_shop.html")
})

app.get("/tracking-product", function (req, res, next) {
  res.sendFile(__dirname + "/public/tracking_product.html")
})

app.get("/tools", function (req, res, next) {
  res.sendFile(__dirname + "/public/tools.html")
})

app.get("/listing", function (req, res, next) {
  res.sendFile(__dirname + "/public/etsy_listing.html")
})

app.get("/add_tracking_history", function (req, res, next) {
  res.sendFile(__dirname + "/public/add_tracking_etsy_history.html")
})

app.get("/undefined", function (req, res, next) {
  res.send('null')
})

app.use(express.static("public"))

io.on("connection", async function (client) {
  let clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  var dbo = clientDB.db("trackingdb")

  await client.on("shop-tracking-join", async function () {
    if (isUpdate) {
      await client.emit("updating")
    } else {
      let shopCategory = await dbo.collection("shopCategory").find().toArray()
      await client.emit("return-shop-category-data", shopCategory)

      let dbData = await dbo.collection("shop").find().toArray()
      await client.emit("return-shop-data", dbData)

      let lastUpdated = await dbo.collection("log").find().toArray()
      await client.emit("last-updated", lastUpdated[lastUpdated.length - 1])
    }
  })

  await client.on("get-total-shop", async function () {
    let total_shop = await getTotalShop()
    await client.emit("total-shop", total_shop)
  })

  await client.on("get_listing_shop_id", async function (shop_id) {
    let result = await makeRequest("GET", `https://openapi.etsy.com/v2/shops/${shop_id}/listings/active?api_key=${api_key}`)
    result = JSON.parse(result).results
    await client.emit("return-listing-data", result)
  })

  await client.on("get_user_by_user_id", async function (user_id) {
    let result = await makeRequest("GET", `https://openapi.etsy.com/v2/users/${user_id}/profile?api_key=${api_key}`)
    result = JSON.parse(result).results
    await client.emit("return-user-data", result[0])
  })

  await client.on("shop-tracking", async function (shop_id) {
    let dbData = await dbo.collection("shopTracking").find({ shop_id: { "$eq": shop_id } }).toArray()
    await client.emit("shop-tracking-data", dbData)
  })

  await client.on("find-shop-by-name", async function (shopName) {
    let response = await makeRequest("GET", `https://openapi.etsy.com/v2/shops/${shopName}?api_key=${api_key}`)
    if (response == 0) {
      await client.emit("return-find-shop-by-name", response)
      return
    }
    response = JSON.parse(response).results
    siteUrl = "https://www.etsy.com/shop/" + shopName
    let shopData = await getTotalSalesAndImgFromWeb()

    response[0]['imgs_listing'] = shopData.imgs
    response[0]['total_sales'] = shopData.totalSales

    await client.emit("return-find-shop-by-name", response)
  })

  await client.on("product-tracking-join", async function () {
    if (isUpdate) {
      await client.emit("updating")
    } else {
      let dbData = await dbo.collection("listing").find().toArray()
      await client.emit("return-product-tracking-join", dbData)
    }
  })

  await client.on("get-list-shop-braumstar", async function (dataUser) {
    clientDB.close()
    let clientDBBraumstar = await MongoClient.connect('mongodb://zic:Mynewpassword%400@braumstar.com:27020/zicDb?authSource=zicDb', { useNewUrlParser: true, useUnifiedTopology: true })
    var dboBraumstar = clientDBBraumstar.db("zicDb")

    let dbData = await dboBraumstar.collection("etsyAccounts").find({ username: dataUser }).toArray()
    await client.emit("list-shop-braumstar", dbData)
    clientDBBraumstar.close()
  })

  await client.on("new-user-braumstar", async function (dataUser) {
    clientDB.close()
    let clientDBBraumstar = await MongoClient.connect('mongodb://zic:Mynewpassword%400@braumstar.com:27020/zicDb?authSource=zicDb', { useNewUrlParser: true, useUnifiedTopology: true })
    var dboBraumstar = clientDBBraumstar.db("zicDb")

    var data = {
      _id: null,
      username: dataUser.userName,
      password: dataUser.pass,
      createdAt: Date.now() / 1000 | 0,
      updatedAr: Date.now() / 1000 | 0
    }
    await dboBraumstar.collection("users").insertOne(data)
    // let isSuccess = 0
    // let getOldUser = await dboBraumstar.collection("users").findOne({ username: dataUser.userName })
    // if (getOldUser == '') {
    //   await dboBraumstar.collection("users").insertOne(data)
    // }
    // else if (getOldUser.username == dataUser.userName) {
    //   isSuccess = -1
    //   await client.emit("return-new-user-braumstar", isSuccess)
    //   clientDBBraumstar.close()
    //   return
    // }

    // let getNewUser = await dboBraumstar.collection("users").findOne({ username: dataUser.userName })
    // console.log(getNewUser)
    // if (getNewUser != '') {
    //   isSuccess = 1
    // }
    await client.emit("return-new-user-braumstar", 1)
    clientDBBraumstar.close()
  })

  await client.on("add-shop-braumstar", async function (dataShop) {
    clientDB.close()
    let clientDBBraumstar = await MongoClient.connect('mongodb://zic:Mynewpassword%400@braumstar.com:27020/zicDb?authSource=zicDb', { useNewUrlParser: true, useUnifiedTopology: true })
    var dboBraumstar = clientDBBraumstar.db("zicDb")
    let isSuccess = 0

    dataShop.shopname = dataShop.shopname.split("\n")
    for (let i = 0; i < dataShop.shopname.length; i++) {
      dataShop.shopname[i] = dataShop.shopname[i].trim()

      if (dataShop.shopname[i] == '') {
      } else {
        var data = {
          _id: dataShop.shopname[i],
          brandName: dataShop.shopname[i],
          username: dataShop.user,
          userId: '',
          token: '',
          tokenSecret: '',
          marketplace: dataShop.country
        }

        await dboBraumstar.collection("etsyAccounts").deleteOne({ brandName: dataShop.shopname[i] })
        await dboBraumstar.collection("etsyAccounts").insertOne(data)
        isSuccess = 0

        let getShop = await dboBraumstar.collection("etsyAccounts").findOne({ brandName: dataShop.shopname[i] })
        if (getShop != '') {
          isSuccess = 1
        }
      }
    }

    await client.emit("return-add-shop-braumstar", isSuccess)
    clientDBBraumstar.close()
  })

  await client.on("delete-shop-braumstar", async function (dataShop) {
    clientDB.close()
    let clientDBBraumstar = await MongoClient.connect('mongodb://zic:Mynewpassword%400@braumstar.com:27020/zicDb?authSource=zicDb', { useNewUrlParser: true, useUnifiedTopology: true })
    var dboBraumstar = clientDBBraumstar.db("zicDb")

    dataShop.shopname = dataShop.shopname.split("\n")
    for (let i = 0; i < dataShop.shopname.length; i++) {
      dataShop.shopname[i] = dataShop.shopname[i].trim()
      if (dataShop.shopname[i] != '') {
        await dboBraumstar.collection("etsyAccounts").deleteOne({ brandName: dataShop.shopname[i] })
      }
    }

    await client.emit("return-delete-shop-braumstar", 1)
    clientDBBraumstar.close()
  })

  await client.on("track-order-join", async function (data) {
    console.log('getting data success! ' + data['data'].length)
    let trackData = []
    let temp = data['data'].split('\n')
    let trackObj
    let trackDataForSave

    for (let i = 1; i < temp.length - 1; i++) {
      trackObj = new Object
      trackObj['pro_ID'] = temp[i].split(',')[0].replace(/[^0-9]/g, '')
      trackObj['track_number'] = temp[i].split(',')[19].replace(/[^0-9a-zA-Z]/g, '')
      trackObj['order_status'] = temp[i].split(',')[3].replace(/[^0-9a-zA-Z]/g, '')

      if (trackObj['track_number'] != '' && trackObj['order_status'] == 'Shipped') {
        trackData.push(trackObj)
      }

      trackDataForSave = new Object
      trackDataForSave['id'] = trackObj['pro_ID']
      trackDataForSave['number_tracking'] = trackObj['track_number']
      trackDataForSave['order_date'] = temp[i].split(',')[2].replace(/"/g, '')
      trackDataForSave['order_status'] = trackObj['order_status']
      trackDataForSave['customer_name'] = temp[i].split(',')[12].replace(/[^0-9a-zA-Z]/g, '')
      trackDataForSave['user'] = data['name']
      await dbo.collection("tracking_etsy_history").updateOne({ id: trackDataForSave['id'] }, { $set: trackDataForSave }, { upsert: true })
    }

    await client.broadcast.emit("get-email-customer-order")
    await sleep(3000)
    console.log('reload etsy')
    await client.broadcast.emit("reload-etsy")
    await sleep(25000)
    console.log('send data to etsy' + trackData.length)
    await client.broadcast.emit("track-order-return", trackData)
  })

  await client.on("return-email-customer-order", async function (data) {
    let tempData = data['mail'].split('#')
    let gmailTemp = []
    let idTemp = []

    for (let i = 1; i < tempData.length; i += 2) {
      idTemp.push(tempData[i])
    }

    for (let i = 0; i < tempData.length; i += 2) {
      let temp = tempData[i].replace('Order history', '').replace('Message history1', '')
      gmailTemp.push(temp)
    }

    for (let i = 0; i < gmailTemp.length; i++) {
      if (Number.isInteger(parseInt(gmailTemp[i].slice(0, 10)))) {
        gmailTemp[i] = gmailTemp[i].substring(10)
      }
    }

    for (let i = 0; i < idTemp.length; i++) {
      await dbo.collection("tracking_etsy_history").updateOne({ id: idTemp[i] }, { $set: { customer_email: gmailTemp[i], name: data['shopName'] } })
    }
  })

  await client.on("track-order-step1", async function (data) {
    await client.broadcast.emit("track-order-step2", data)
  })

  await client.on("track-order-step3", async function (name) {
    await client.broadcast.emit("track-order-step4", name)
  })

  await client.on("track-order-step5", async function (data) {
    data['time_add_tracking'] = Math.floor(new Date().getTime() / 1000)
    await dbo.collection("tracking_etsy_history").updateOne({ id: data.id }, { $set: data }, { upsert: true })
  })

  await client.on("tracking-history-join", async function () {
    let dbdata = await dbo.collection("tracking_etsy_history").find().toArray()
    await client.emit("tracking-history-return-data", dbdata)
  })

  await client.on("fix-tracking-history", async function (data) {
    await dbo.collection("tracking_etsy_history").updateOne({ id: data.id }, { $set: data }, { upsert: true })
    await client.emit("return-fix-tracking-history")
  })
})

// fixTrackingHistory()
// async function fixTrackingHistory() {
//   let clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
//   var dbo = clientDB.db("trackingdb")
//   let dbdata = await dbo.collection("tracking_etsy_history").find().toArray()
//   for (let i = 0; i < dbdata.length; i++) {
//     if (dbdata[i].customer_email == undefined) {
//     } else {

//       if (Number.isInteger(parseInt(dbdata[i].customer_email.slice(0,10)))) {
//         dbdata[i].customer_email = dbdata[i].customer_email.substring(10)
//         await dbo.collection("tracking_etsy_history").updateOne({ id: dbdata[i].id }, { $set: { customer_email: dbdata[i].customer_email } }, { upsert: true })
//       }

// if (dbdata[i].customer_email.includes('Message history1')) {
//   console.log(dbdata[i].customer_email)
//   dbdata[i].customer_email = dbdata[i].customer_email.replace('Message history1', '')
//   await dbo.collection("tracking_etsy_history").updateOne({ id: dbdata[i].id }, { $set: { customer_email: dbdata[i].customer_email } }, { upsert: true })
// }
//     }
//   }
// }

async function getSearchProductFromWeb() {
  await sleep(100)
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
    result = err.response.status
    console.log('error ' + result)
  }
  if (result == 404) {
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
    xhr.send();
  })
}

async function getTotalShop() {
  let result = await makeRequest("GET", `https://openapi.etsy.com/v2/shops?api_key=${api_key}&limit=1&offset=1`)
  result = JSON.parse(result).results
  return result[0].shop_id
}

server.listen(443)