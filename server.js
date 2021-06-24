"use strict";
const fs = require('fs')
var express = require("express")
var app = express()
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
const https = require("https")
const axios = require("axios")
const cheerio = require('cheerio')
const { exec } = require("child_process")

//ssl from Certbot
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

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header('Access-Control-Allow-Methods', '*')
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  if ('OPTIONS' == req.method) {
    res.sendStatus(200)
  }
  else {
    next()
  }
})

const limit = 100
var limitPage = 30
const api_key = '2mlnbmgdqv6esclz98opmmuq'
const api_key_2 = 'v2jgfkortd8sy3w393hcqtob'
var siteUrl
var isUpdate = false
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
  isUpdate = true
  // await updateCate()
  // await getShopName()
  // await updateShopInfo()
  // await completeUpdate()
  // await updateData()
  isUpdate = false
}

setInterval(scheduleUpdate, 3600000) // 1h
async function scheduleUpdate() {
  var date = new Date().getTime()
  date = Math.floor(date / 3600000)
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
  isUpdate = true

  // await updateCate()
  await getListing()
  await getShopName()
  await updateShopInfo()
  await completeUpdate()

  isUpdate = false
}

async function getListing() {
  let idListings = []
  let date = new Date().getTime()
  date = Math.floor(date / 1000)
  let listKeyWord = ["mug", "blanket", "tshirt", "canvas", "art print poster", "father's day canvas", "father's day tshirt", "father's day art print", "father's day mug", "father's day blanket",
    "pride month tshirt", "pride month canvas", "pride month art print", "pride month mug", "pride month blanket",
    "independence day tshirt", "independence day canvas", "independence day art print", "independence day mug", "independence day blanket",
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
  }
}

async function getShopName() {
  // let category = await dbo.collection("category").findOne()
  // let categoryList = category.CategoryList.split(',')
  // let categoryLink = category.CategoryLink.split('|')

  // for (let index = 0; index < categoryList.length; index++) {
  //   if (index == 0 || index == 1) {
  //     limitPage = 60
  //   } else {
  //     limitPage = 40
  //   }
  //   console.log('category: ' + categoryList[index])
  //   for (let i = 0; i < limitPage; i++) {
  //     let siteUrlPage = categoryLink[index] + (i + 1)
  //     console.log('siteUrlPage: ' + siteUrlPage)

  //     let dataShopName
  //     try {
  //       dataShopName = await getShopNameFromWeb(siteUrlPage)
  //     } catch (error) {
  //       continue
  //     }
  //     console.log('page: ' + i)
  //     await saveShopNameToDB(dataShopName, categoryList[index])
  //   }
  // }

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
    let response = await makeRequest("GET", `https://openapi.etsy.com/v2/shops/${dbData[index].shop_name}?api_key=${api_key_2}`)
    if (IsJsonString(response)) {
      response = JSON.parse(response).results

      if (response[0]['creation_tsz'] < dateCount || (dbData[index].total_sales > maxTotalSales && dbData[index].total_sales < minTotalSales)) {
        await deleteShop(response[0]['shop_name'])
        console.log('removed ' + response[0]['shop_name'] + " - " + response[0]['creation_tsz'] + '<' + dateCount)
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

app.get("/", function (req, res, next) {
  res.sendFile(__dirname + "/public/index.html", { cache: true })
})

app.get("/tracking-shop", function (req, res, next) {
  res.sendFile(__dirname + "/public/tracking_shop.html", { cache: true })
})

app.get("/tracking-product", function (req, res, next) {
  res.sendFile(__dirname + "/public/tracking_product.html", { cache: true })
})

app.get("/tools", function (req, res, next) {
  res.sendFile(__dirname + "/public/tools.html", { cache: true })
})

app.get("/listing", function (req, res, next) {
  res.sendFile(__dirname + "/public/etsy_listing.html", { cache: true })
})

app.get("/add_tracking_history", function (req, res, next) {
  res.sendFile(__dirname + "/public/add_tracking_etsy_history.html", { cache: true })
})

app.get("/undefined", function (req, res, next) {
  res.send('null')
})

app.get("/mockup", function (req, res, next) {
  res.sendFile(__dirname + "/public/mockup.html", { cache: true })
})

app.use(express.static("public"))

io.on("connection", async function (client) {
  client.on("shop-tracking-join", async function () {
    if (isUpdate) {
      client.emit("updating")
    }
    let shopCategory = await dbo.collection("shopCategory").find().toArray()
    client.emit("return-shop-category-data", shopCategory)

    let dbData = await dbo.collection("shop").find().toArray()
    client.emit("return-shop-data", dbData)

    let lastUpdated = await dbo.collection("log").find().toArray()
    client.emit("last-updated", lastUpdated.slice(-1))
  })

  client.on("get-total-shop", async function () {
    let total_shop = await getTotalShop()
    client.emit("total-shop", total_shop)
  })

  client.on("get_listing_shop_id", async function (shop_id) {
    let result = await makeRequest("GET", `https://openapi.etsy.com/v2/shops/${shop_id}/listings/active?api_key=${api_key_2}`)
    if (IsJsonString(result)) {
      result = JSON.parse(result).results
      client.emit("return-listing-data", result)
      return
    }
    client.emit("return-listing-data", 0)
  })

  client.on("get_user_by_user_id", async function (user_id) {
    let result = await makeRequest("GET", `https://openapi.etsy.com/v2/users/${user_id}/profile?api_key=${api_key_2}`)
    if (IsJsonString(result)) {
      result = JSON.parse(result).results
      client.emit("return-user-data", result[0])
      return
    }
    client.emit("return-user-data", 0)
  })

  client.on("shop-tracking", async function (shop_id) {
    let dbData = await dbo.collection("shopTracking").find({ shop_id: { "$eq": shop_id } }).toArray()
    client.emit("shop-tracking-data", dbData)
  })

  client.on("find-shop-by-name", async function (shopName) {
    let response = await makeRequest("GET", `https://openapi.etsy.com/v2/shops/${shopName}?api_key=${api_key_2}`)
    if (response == 0) {
      client.emit("return-find-shop-by-name", response)
      return
    }
    if (IsJsonString(response)) {
      response = JSON.parse(response).results
      siteUrl = "https://www.etsy.com/shop/" + shopName
      let shopData
      try {
        shopData = await getTotalSalesAndImgFromWeb()
      } catch (error) {
        console.log("can't get shop name")
      }

      response[0]['imgs_listing'] = shopData.imgs
      response[0]['total_sales'] = shopData.totalSales

      var date = new Date().getTime()
      date = Math.floor(date / 1000) - (maxDateShop * 86400)

      if (shopData.totalSales <= maxTotalSales && shopData.totalSales >= minTotalSales && response[0].creation_tsz >= date) {
        await dbo.collection("shopName").updateOne({ shop_name: response[0].shop_name }, { $set: { shop_name: response[0].shop_name, total_sales: response[0]['total_sales'], imgs_listing: response[0]['imgs_listing'] } }, { upsert: true })

        let timeNow = getDateTimeNow()
        await dbo.collection("shopTracking").insertOne({
          'shop_id': response[0].shop_id,
          'shop_name': response[0].shop_name,
          'total_sales': response[0].total_sales,
          'listing_active_count': response[0].listing_active_count,
          'num_favorers': response[0].num_favorers,
          'time_update': timeNow
        })

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
      }

      client.emit("return-find-shop-by-name", response)
      return
    }
    client.emit("return-find-shop-by-name", 0)
  })

  client.on("product-tracking-join", async function () {
    if (isUpdate) {
      client.emit("updating")
    }
    let dbData = await dbo.collection("listing").find().toArray()
    client.emit("return-product-tracking-join", dbData)
  })

  client.on("get-list-shop-braumstar", async function (dataUser) {
    let clientDBBraumstar = await MongoClient.connect('mongodb://zic:Mynewpassword%400@braumstar.com:27020/zicDb?authSource=zicDb', { useNewUrlParser: true, useUnifiedTopology: true })
    var dboBraumstar = clientDBBraumstar.db("zicDb")

    let dbData = await dboBraumstar.collection("etsyAccounts").find({ username: dataUser }).toArray()
    client.emit("list-shop-braumstar", dbData)
  })

  client.on("new-user-braumstar", async function (dataUser) {
    let clientDBBraumstar = await MongoClient.connect('mongodb://zic:Mynewpassword%400@braumstar.com:27020/zicDb?authSource=zicDb', { useNewUrlParser: true, useUnifiedTopology: true })
    var dboBraumstar = clientDBBraumstar.db("zicDb")

    var data = {
      _id: null,
      username: dataUser.userName,
      password: dataUser.pass,
      createdAt: Date.now() / 1000 | 0,
      updatedAr: Date.now() / 1000 | 0
    }
    let isSuccess = 0
    let getOldUser = await dboBraumstar.collection("users").findOne({ username: dataUser.userName })

    if (getOldUser == null) {
      await dboBraumstar.collection("users").insertOne(data)
    }
    else if (getOldUser.username == dataUser.userName) {
      isSuccess = -1
      client.emit("return-new-user-braumstar", isSuccess)
      clientDBBraumstar.close()
      return
    }

    let getNewUser = await dboBraumstar.collection("users").findOne({ username: dataUser.userName })
    console.log(getNewUser)
    if (getNewUser != null) {
      isSuccess = 1
    }
    client.emit("return-new-user-braumstar", isSuccess)
  })

  client.on("add-shop-braumstar", async function (dataShop) {
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
        if (getShop != null) {
          isSuccess = 1
        }
      }
    }

    client.emit("return-add-shop-braumstar", isSuccess)
  })

  client.on("delete-shop-braumstar", async function (dataShop) {
    let clientDBBraumstar = await MongoClient.connect('mongodb://zic:Mynewpassword%400@braumstar.com:27020/zicDb?authSource=zicDb', { useNewUrlParser: true, useUnifiedTopology: true })
    var dboBraumstar = clientDBBraumstar.db("zicDb")

    dataShop.shopname = dataShop.shopname.split("\n")
    for (let i = 0; i < dataShop.shopname.length; i++) {
      dataShop.shopname[i] = dataShop.shopname[i].trim()
      if (dataShop.shopname[i] != null) {
        await dboBraumstar.collection("etsyAccounts").deleteOne({ brandName: dataShop.shopname[i] })
      }
    }

    client.emit("return-delete-shop-braumstar", 1)
  })

  client.on("track-order-join", async function (data) {
    console.log('getting data success! ' + data['data'].length)
    client.broadcast.emit("add-tracking-status-server-to-client", { name: 'server', status: 2 })
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

    client.broadcast.emit("get-email-customer-order")
    await dbo.collection("add_complete").deleteMany()
    // client.broadcast.emit("add-tracking-status", 0)
    await refreshRPC()

    console.log('reload etsy')
    client.broadcast.emit("reload-etsy")
    await sleep(40000)
    console.log('send data to etsy' + trackData.length)
    client.broadcast.emit("add-tracking-status-server-to-client", { name: 'server', status: 3 })
    await sleep(100)
    client.broadcast.emit("track-order-return", trackData)
  })

  client.on("return-email-customer-order", async function (data) {
    let tempData = data['mail'].split('#')
    let gmailTemp = []
    let idTemp = []

    for (let i = 1; i < tempData.length; i += 2) {
      idTemp.push(tempData[i])
    }

    for (let i = 0; i < tempData.length; i += 2) {
      let temp = tempData[i].replace('Order history', '')
      if (temp.includes('Message history')) {
        temp = temp.replace('Message history', '').substring(1)
      }
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

  client.on("track-order-step1", function (data) {
    client.broadcast.emit("track-order-step2", data)
  })

  client.on("track-order-step3", function (name) {
    client.broadcast.emit("track-order-step4", name)
  })

  client.on("track-order-step5", async function (data) {
    data['time_add_tracking'] = Math.floor(new Date().getTime() / 1000)
    await dbo.collection("tracking_etsy_history").updateOne({ id: data.id }, { $set: data }, { upsert: true })
  })

  client.on("tracking-history-join", async function () {
    let dbdata = await dbo.collection("tracking_etsy_history").find().toArray()
    dbdata.splice(0, dbdata.length - 100)
    client.emit("tracking-history-return-data", dbdata)
  })

  client.on("tracking-history-get-all", async function () {
    let dbdata = await dbo.collection("tracking_etsy_history").find().toArray()
    client.emit("tracking-history-return-data", dbdata)
  })

  client.on("fix-tracking-history", async function (data) {
    await dbo.collection("tracking_etsy_history").updateOne({ id: data.id }, { $set: data }, { upsert: true })
    client.emit("return-fix-tracking-history")
  })

  client.on("run-add-tracking", async function (user) {
    client.emit("add-tracking-status-server-to-client", { name: 'server', status: 1 })
    await sleep(100)
    client.broadcast.emit("run-add-tracking-by-user", user)
  })

  client.on("check-limit-api", async function () {
    let headers, req

    req = new XMLHttpRequest()
    req.open('GET', `https://openapi.etsy.com/v2/shops?api_key=${api_key}`, false)
    req.send(null)
    headers = req.getAllResponseHeaders()
    client.emit("return-check-limit-api", headers)

    req = new XMLHttpRequest()
    req.open('GET', `https://openapi.etsy.com/v2/shops?api_key=${api_key_2}`, false)
    req.send(null)
    headers = req.getAllResponseHeaders()
    client.emit("return-check-limit-api", headers)
  })

  client.on("run-ping-vps", function () {
    client.broadcast.emit("ping-vps")
  })

  client.on("run-ping-customcat", function () {
    client.broadcast.emit("ping-customcat")
  })

  client.on("ping-vps-res", function (data) {
    client.broadcast.emit("return-ping-vps", data)
  })

  client.on("ping-customcat-res", function (data) {
    client.broadcast.emit("return-ping-customcat", data)
  })

  client.on("add-tracking-complete", async function (data) {
    await dbo.collection("add_complete").updateOne({ item: data }, { $set: { item: data } }, { upsert: true })

    let complete = await dbo.collection("add_complete").find().toArray()
    if (complete.length == 9) {
      console.log(`closed all RDC`)
      client.broadcast.emit("add-tracking-status-server-to-client", { name: 'server', status: 4 })
      exec("taskkill /im mstsc.exe /t")
      await sleep(1000)
      exec("taskkill /im mstsc.exe /t /f")
    }
    client.broadcast.emit("add-tracking-status", complete)
  })

  client.on("run-update-server", function () {
    console.log(`update server`)
    exec("git pull origin master")
  })

  client.on("get-add-tracking-status", async function () {
    let complete = await dbo.collection("add_complete").find().toArray()
    client.broadcast.emit("add-tracking-status", complete)
  })

  client.on("add-tracking-status-vps-to-server", function (data) {
    client.broadcast.emit("add-tracking-status-server-to-client", data)
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

//       // if (Number.isInteger(parseInt(dbdata[i].customer_email.slice(0, 10)))) {
//       //   dbdata[i].customer_email = dbdata[i].customer_email.substring(10)
//       //   await dbo.collection("tracking_etsy_history").updateOne({ id: dbdata[i].id }, { $set: { customer_email: dbdata[i].customer_email } }, { upsert: true })
//       // }

//       if (dbdata[i].customer_email.includes('Message history')) {
//         console.log(dbdata[i].customer_email)
//         dbdata[i].customer_email = dbdata[i].customer_email.replace('Message history', '').substring(1)
//         await dbo.collection("tracking_etsy_history").updateOne({ id: dbdata[i].id }, { $set: { customer_email: dbdata[i].customer_email } }, { upsert: true })
//       }
//     }
//   }
// }

async function refreshRPC() {
  console.log(`closed all RDC`)
  exec("taskkill /im mstsc.exe /t")
  await sleep(1000)
  exec("taskkill /im mstsc.exe /t /f")
  await sleep(1000)
  
  let arrVPS = ['64.190.87.132', '192.227.121.235:64738', '64.52.175.86:48384', '64.52.168.149:31072',
    '74.81.39.30:42535', '155.138.146.185', '149.248.60.29', '64.190.86.250:40661', '199.34.28.113:44176']

  for (let item of arrVPS) {
    console.log(`connect to ${item}`)
    exec(`mstsc /v:${item}`)
    await sleep(400)
  }
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

async function getTotalShop() {
  let result = await makeRequest("GET", `https://openapi.etsy.com/v2/shops?api_key=${api_key_2}&limit=1&offset=1`)
  if (IsJsonString(result)) {
    result = JSON.parse(result).results
    return result[0].shop_id
  }
  return 0
}

function IsJsonString(str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

server.listen(443)