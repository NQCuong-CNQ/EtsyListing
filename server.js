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
  }
})

const limit = 100
const limitPage = 5
const api_key = '2mlnbmgdqv6esclz98opmmuq'
var siteUrl
var isUpdate = false
var total_shop = 0

const MongoClient = require('mongodb').MongoClient;
const { Console } = require('console');
const url = "mongodb://localhost:27017/trackingdb"

setInterval(scheduleUpdate, 2700000) // 45p
async function scheduleUpdate() {
  let date_ob = new Date()
  if (date_ob.getHours() == 6) {
    await updateData()
  }
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

// updateData()
async function updateData() {
  isUpdate = true
  // await updateCate()
  await getListing()
  await getShopName()
  await updateShopInfo()
  await completeUpdate()

  await getTotalShop()
  isUpdate = false
}

async function getListing() {
  let idListings = []

  for (let i = 1; i <= 5; i++) {
    siteUrl = `https://www.etsy.com/search?q=canvas&page=${i}&ref=pagination`
    let data = await getSearchProductFromWeb()
    console.log(i)
    for (let j = 0; j < data.length; j++) {
      idListings.push(data[j])
    }
  }
  console.log(idListings.length)
  for (let i = 1; i <= 5; i++) {
    siteUrl = `https://www.etsy.com/search?q=mug&page=${i}&ref=pagination`
    let data = await getSearchProductFromWeb()
    console.log(i)
    for (let j = 0; j < data.length; j++) {
      idListings.push(data[j])
    }
  }
  console.log(idListings.length)
  for (let i = 1; i <= 5; i++) {
    siteUrl = `https://www.etsy.com/search?q=tumbler&page=${i}&ref=pagination`
    let data = await getSearchProductFromWeb()
    console.log(i)
    for (let j = 0; j < data.length; j++) {
      idListings.push(data[j])
    }
  }
  console.log(idListings.length)
  for (let i = 1; i <= 5; i++) {
    siteUrl = `https://www.etsy.com/search?q=tshirt&page=${i}&ref=pagination`
    let data = await getSearchProductFromWeb()
    console.log(i)
    for (let j = 0; j < data.length; j++) {
      idListings.push(data[j])
    }
  }
  console.log(idListings.length)
  for (let i = 1; i <= 5; i++) {
    siteUrl = `https://www.etsy.com/search?q=blanket&page=${i}&ref=pagination`
    let data = await getSearchProductFromWeb()
    console.log(i)
    for (let j = 0; j < data.length; j++) {
      idListings.push(data[j])
    }
  }
  console.log(idListings.length)
  for (let i = 1; i <= 5; i++) {
    siteUrl = `https://www.etsy.com/c?ref=pagination&explicit=1&page=${i}`
    let data = await getSearchProductFromWeb()
    console.log(i)
    for (let j = 0; j < data.length; j++) {
      idListings.push(data[j])
    }
  }

  idListings = [...new Set(idListings)]
  console.log(idListings.length)

  let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  var dbo = client.db("trackingdb")
  await dbo.collection("listing").deleteMany()

  let listings
  let listingTracking
  for (let i = 0; i < idListings.length; i++) {
    let result = await makeRequest("GET", `https://openapi.etsy.com/v2/listings/${idListings[i]}?api_key=${api_key}`)
    result = JSON.parse(result).results
    listings = result[0]

    let resultImgs = await makeRequest("GET", `https://openapi.etsy.com/v2/listings/${idListings[i]}/images?api_key=${api_key}`)
    resultImgs = JSON.parse(resultImgs).results[0]

    listings['img_url'] = resultImgs.url_570xN
    listings['img_url_original'] = resultImgs.url_fullxfull

    let percentFavor = (listings.num_favorers / listings.views) * 100
    percentFavor = percentFavor.toFixed(0)
    listings['percent_favor'] = percentFavor

    if (listings.state == 'active') {
      await dbo.collection("listing").insertOne(listings)
      console.log(listings.listing_id)

      listingTracking['listing_id'] = listings.listing_id
      listingTracking['creation_tsz'] = listings.creation_tsz
      listingTracking['quantity'] = listings.quantity
      listingTracking['views'] = listings.views
      listingTracking['num_favorers'] = listings.num_favorers

      let date = new Date().getTime() / 1000
      date = Math.floor(date / 86400)
      listingTracking['date_update'] = date

      await dbo.collection("listingTracking").insertOne(listings)
    }
    await sleep(100)
  }
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
}

async function saveShopNameToDB(dataShopName, shopCategory) {
  let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  let dbo = client.db("trackingdb")

  for (let i = 0; i < dataShopName.length; i++) {
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
  console.log('save all shop name success')
  let shopName = await dbo.collection("shopName").find({}).toArray()

  for (let index = 0; index < shopName.length; index++) {
    siteUrl = "https://www.etsy.com/shop/" + shopName[index].shop_name
    let shopData = await getTotalSalesAndImgFromWeb()

    let total_sales = shopData.totalSales
    let imgs = shopData.imgs

    total_sales = parseInt(total_sales)
    console.log(shopName[index].shop_name + ":" + total_sales)
    await dbo.collection("shopName").updateOne({ shop_name: shopName[index].shop_name }, { $set: { total_sales: total_sales, imgs_listing: imgs } }, { upsert: true })
  }

  client.close()
  await sleep(100)
}

async function sleep(ms) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}

async function updateShopInfo() {
  let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  var dbo = client.db("trackingdb")
  let dbData = await dbo.collection("shopName").find({ total_sales: { $gte: 100, $lte: 5000 } }).toArray()

  for (let index = 0; index < dbData.length; index++) {
    let response = await makeRequest("GET", `https://openapi.etsy.com/v2/shops/${dbData[index].shop_name}?api_key=${api_key}`)
    if (response == '') {
      continue
    }
    response = JSON.parse(response).results

    console.log('updateShopInfo: ' + response[0].shop_id)
    response[0]['total_sales'] = dbData[index].total_sales
    response[0]['imgs_listing'] = dbData[index].imgs_listing
    await dbo.collection("shop").updateOne({ shop_id: response[0].shop_id }, { $set: response[0] }, { upsert: true })

    let timeNow = getDateTimeNow()
    await dbo.collection("shopTracking").insertOne({
      'shop_id': response[0].shop_id,
      'total_sales': dbData[index].total_sales,
      'listing_active_count': response[0].listing_active_count,
      'num_favorers': response[0].num_favorers,
      'time_update': timeNow
    })
    await sleep(100)
  }
  client.close()
}

function getDateTimeNow() {
  let date_ob = new Date()
  let date = ("0" + date_ob.getDate()).slice(-2)
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2)
  let year = date_ob.getFullYear()
  let hours = ("0" + date_ob.getHours()).slice(-2)
  let minutes = ("0" + date_ob.getMinutes()).slice(-2)
  let seconds = ("0" + date_ob.getSeconds()).slice(-2)
  let timeNow = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
  return timeNow
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

app.use(express.static("public"))

io.on("connection", async function (client) {
  let clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  var dbo = clientDB.db("trackingdb")

  await client.on("join", async function (data) {
    console.log('1 client connected')

    if (isUpdate) {
      await client.broadcast.emit("updating")
    } else {
      let shopCategory = await dbo.collection("shopCategory").find().toArray()
      await client.broadcast.emit("shopCategoryDataTransfer", shopCategory)

      let dbData = await dbo.collection("shop").find().toArray()
      await client.broadcast.emit("dataTransfer", dbData)

      let lastUpdated = await dbo.collection("log").find().toArray()
      await client.broadcast.emit("last-updated", lastUpdated[lastUpdated.length - 1])
    }
  })

  await client.on("get-total-shop", async function () {
    await client.broadcast.emit("total-shop", total_shop)
  })

  await client.on("step1", async function () {
    await client.broadcast.emit("total-shop", total_shop)
  })


  await client.on("get_listing_shop_id", async function (shop_id) {
    let result = await makeRequest("GET", `https://openapi.etsy.com/v2/shops/${shop_id}/listings/active?api_key=${api_key}`)
    result = JSON.parse(result).results
    await client.broadcast.emit("listingDataTransfer", result)
  })

  await client.on("get_user_by_user_id", async function (user_id) {
    let result = await makeRequest("GET", `https://openapi.etsy.com/v2/users/${user_id}/profile?api_key=${api_key}`)
    result = JSON.parse(result).results
    await client.broadcast.emit("userDataTransfer", result[0])
  })

  await client.on("shop-tracking", async function (shop_id) {
    let dbData = await dbo.collection("shopTracking").find({ shop_id: { "$eq": shop_id } }).toArray()
    await client.broadcast.emit("shop-tracking-data", dbData)
  })

  await client.on("find-shop-by-name", async function (shopName) {
    let response = await makeRequest("GET", `https://openapi.etsy.com/v2/shops/${shopName}?api_key=${api_key}`)
    if (response == 0) {
      await client.broadcast.emit("return-find-shop-by-name", response)
      return
    }
    response = JSON.parse(response).results

    siteUrl = "https://www.etsy.com/shop/" + shopName
    response[0]["total_sales"] = await getTotalSalesAndImgFromWeb()
    await client.broadcast.emit("return-find-shop-by-name", response)
  })

  await client.on("product-tracking-join", async function () {
    if (isUpdate) {
      await client.broadcast.emit("updating")
    } else {
      let dbData = await dbo.collection("listing").find().toArray()
      await client.broadcast.emit("return-product-tracking-join", dbData)

      let history = await dbo.collection("listingTracking").find().toArray()
      await client.broadcast.emit("return-product-history-tracking-join", history)
    }
  })

  await client.on("get-list-shop-braumstar", async function (dataUser) {
    clientDB.close()
    let clientDBBraumstar = await MongoClient.connect('mongodb://zic:Mynewpassword%400@braumstar.com:27020/zicDb?authSource=zicDb', { useNewUrlParser: true, useUnifiedTopology: true })
    var dboBraumstar = clientDBBraumstar.db("zicDb")

    let dbData = await dboBraumstar.collection("etsyAccounts").find({ username: dataUser }).toArray()
    await client.broadcast.emit("list-shop-braumstar", dbData)
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

    let isSuccess = 0
    let getOldUser = await dboBraumstar.collection("users").findOne({ username: dataUser.userName })
    if (getOldUser == '') {
      await dboBraumstar.collection("users").insertOne(data)
    }
    else if (getOldUser.username == dataUser.userName) {
      isSuccess = -1
      await client.broadcast.emit("return-new-user-braumstar", isSuccess)
      clientDBBraumstar.close()
      return
    }

    let getNewUser = await dboBraumstar.collection("users").findOne({ username: dataUser.userName })
    console.log(getNewUser)
    if (getNewUser != '') {
      isSuccess = 1
    }
    await client.broadcast.emit("return-new-user-braumstar", isSuccess)
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
        continue
      }

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

    await client.broadcast.emit("return-add-shop-braumstar", isSuccess)
    clientDBBraumstar.close()
  })

  await client.on("delete-shop-braumstar", async function (dataShop) {
    clientDB.close()
    let clientDBBraumstar = await MongoClient.connect('mongodb://zic:Mynewpassword%400@braumstar.com:27020/zicDb?authSource=zicDb', { useNewUrlParser: true, useUnifiedTopology: true })
    var dboBraumstar = clientDBBraumstar.db("zicDb")

    dataShop.shopname = dataShop.shopname.split("\n")
    for (let i = 0; i < dataShop.shopname.length; i++) {
      dataShop.shopname[i] = dataShop.shopname[i].trim()

      if (dataShop.shopname[i] == '') {
        continue
      }
      await dboBraumstar.collection("etsyAccounts").deleteOne({ brandName: dataShop.shopname[i] })
    }

    await client.broadcast.emit("return-delete-shop-braumstar", 1)
    clientDBBraumstar.close()
  })

  await client.on("track-order-join", async function (data) {
    console.log('getting data success!')
    let trackData = []
    let temp = data.split('\n')

    let trackObj1 = new Object
    trackObj1['pro_ID'] = '2066021485'
    trackObj1['track_number'] = '1Z1F995RYW92562018'
    trackData.push(trackObj1)


    for (let i = 1; i < temp.length - 1; i++) {
      let trackObj = new Object
      trackObj['pro_ID'] = temp[i].split(',')[0].replace(/[^0-9]/g, '')
      trackObj['track_number'] = temp[i].split(',')[19].replace(/[^0-9a-zA-Z]/g, '')

      if (trackObj['track_number'] == '') {
        continue
      }

      trackData.push(trackObj)
    }

    trackObj1 = new Object
    trackObj1['pro_ID'] = '2066310217'
    trackObj1['track_number'] = '9261290278835117583933'
    trackData.push(trackObj1)
    
    console.log('send data to etsy')
    await client.broadcast.emit("track-order-return", trackData)
  })

  await client.on("track-order-step1", async function (data) {
    await client.broadcast.emit("track-order-step2", data)
  })
  await client.on("track-order-step3", async function (name) {
    await client.broadcast.emit("track-order-step4", name)
  })
})

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
  total_shop = result[0].shop_id
}

server.listen(443)