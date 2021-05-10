"use strict";
const fs = require('fs')
var express = require("express")
var app = express()
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
var xhr = new XMLHttpRequest()
const axios = require("axios")
const cheerio = require('cheerio')

// var https_options = {
//   cert: fs.readFileSync("ssl/certificate.crt"),
//   ca: fs.readFileSync('ssl/ca_bundle.crt')
// };

var server = require("http").createServer(app)
var io = require("socket.io")(server)

// app.use(function cors(req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   res.setHeader('Access-Control-Allow-Headers', 'X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method,Access-Control-Request-Headers, Authorization')
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
//   if (req.method === 'OPTIONS') {
//     res.status(200);
//   }next()
// })

const limit = 100
const api_key = '2mlnbmgdqv6esclz98opmmuq'
var siteUrl

const MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/trackingdb"

setInterval(scheduleUpdate, 1800000) // 30p
async function scheduleUpdate() {
  let date_ob = new Date()
  if (date_ob.getHours() == 7) {
    await updateData()
  }
}

async function updateCate() {
  let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  var dbo = client.db("trackingdb")

  // let category = {
  //   'Canvas': '',
  //   'Mug': '',
  //   'Blanket': '',
  //   'Shirt': '',
  //   'Tumbler': '',
  //   'Canvas-link': 'https://www.etsy.com/c/home-and-living/home-decor/wall-decor/wall-hangings/prints?explicit=1&ref=pagination&page=',
  //   'Mug-link': 'https://www.etsy.com/c/home-and-living/kitchen-and-dining/drink-and-barware/drinkware/mugs?explicit=1&ref=pagination&page=',
  //   'Blanket-link': 'https://www.etsy.com/c/home-and-living/bedding/blankets-and-throws?ref=pagination&explicit=1&page=',
  //   'Shirt-link': 'https://www.etsy.com/c/clothing/mens-clothing/shirts-and-tees?ref=pagination&page=',
  //   'Tumbler-link': 'https://www.etsy.com/c/home-and-living/kitchen-and-dining/drink-and-barware/drinkware/tumblers-and-water-glasses?explicit=1&ref=pagination&page='
  // }
  let category = {
    'CategoryList': 'Canvas,Mug,Blanket,Shirt,Tumbler',
    'Canvas': '',
    'Mug': '',
    'Blanket': '',
    'Shirt': '',
    'Tumbler': '',
    'CategoryLink': 'https://www.etsy.com/c/home-and-living/home-decor/wall-decor/wall-hangings/prints?explicit=1&ref=pagination&page=|https://www.etsy.com/c/home-and-living/kitchen-and-dining/drink-and-barware/drinkware/mugs?explicit=1&ref=pagination&page=|https://www.etsy.com/c/home-and-living/bedding/blankets-and-throws?ref=pagination&explicit=1&page=|https://www.etsy.com/c/clothing/mens-clothing/shirts-and-tees?ref=pagination&page=|https://www.etsy.com/c/home-and-living/kitchen-and-dining/drink-and-barware/drinkware/tumblers-and-water-glasses?explicit=1&ref=pagination&page=',
  }
  await dbo.collection("category").insertOne(category)
}

updateData()
async function updateData() {
  await updateCate()
  await getShopName()
  await updateShopInfo()
  // await updateListing()
  // await updateUser()
  await completeUpdate()
}

async function getShopName() {
  let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  var dbo = client.db("trackingdb")
  let category = await dbo.collection("category").find({}).toArray()

  let categoryList = category[0].CategoryList.split(',')
  let categoryLink = category[0].CategoryLink.split('|')
  client.close()
  
  for (let index = 0; index < categoryList.length; index++) {
    console.log('category: ' + categoryList[index])
    for (let i = 0; i < 50; i++) {
      let siteUrlPage = categoryLink[index] + i
      console.log('siteUrlPage: ' + siteUrlPage)
      let dataShopName = await getShopNameFromWeb(siteUrlPage)
      console.log('page: ' + i)
      await saveShopNameToDB(dataShopName, categoryList[index])
    }
  }
}

async function saveShopNameToDB(dataShopName, category) {
  let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  let dbo = client.db("trackingdb")

  for (let i = 0; i < dataShopName.length; i++) {
    await dbo.collection("shopName").updateOne({ shop_name: dataShopName[i] }, { $set: { shop_name: dataShopName[i] } }, { upsert: true })
  }

  let shopName = await dbo.collection("shopName").find({}).toArray()

  for (let index = 0; index < shopName.length; index++) {
    siteUrl = "https://www.etsy.com/shop/" + shopName[index].shop_name

    let total_sales = await getTotalSalesFromWeb(siteUrl)
    total_sales = parseInt(total_sales)
    console.log(shopName[index].shop_name + ":" + total_sales)

    await dbo.collection("shopName").updateOne({ shop_name: shopName[index] }, { $set: { total_sales: total_sales, category: category } }, { upsert: true })
  }

  client.close()
  await sleep(100)
}

async function updateUser() {
  let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  var dbo = client.db("trackingdb")
  let dataShop = await dbo.collection("shop").find().toArray()

  for (let i = 0; i < dataShop.length; i++) {
    if (dataShop[i].total_sales >= 10) {
      console.log('get user shop: ' + dataShop[i].shop_id)
      let result = await makeRequest("GET", `https://openapi.etsy.com/v2/users/${dataShop[i].user_id}/profile?api_key=${api_key}`)
      if (result == 0) {
        console.log('pass')
        continue
      }
      result = JSON.parse(result).results
      var count = Object.keys(result).length;
      for (let j = 0; j < count; j++) {
        await dbo.collection("user").updateOne({ user_id: result[j].user_id }, { $set: result[j] }, { upsert: true })
      }
    }
  }
}

async function updateListing() {
  let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  var dbo = client.db("trackingdb")
  let dataShop = await dbo.collection("shop").find().toArray()

  for (let i = 0; i < dataShop.length; i++) {
    if (dataShop[i].total_sales >= 100) {
      console.log('get listing shop: ' + dataShop[i].shop_id)

      let result = await makeRequest("GET", `https://openapi.etsy.com/v2/shops/${dataShop[i].shop_id}/listings/active?api_key=${api_key}`) //limit 100
      if (result == 0) {
        console.log('pass')
        continue
      }

      result = JSON.parse(result).results
      var count = Object.keys(result).length;
      for (let j = 0; j < count; j++) {
        await dbo.collection("listing").updateOne({ listing_id: result[j].listing_id }, { $set: result[j] }, { upsert: true })
        await dbo.collection("listing").updateOne({ listing_id: result[j].listing_id }, { $set: { "shop_id": dataShop[i].shop_id } }, { upsert: true })
      }
    }
  }
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
    response = JSON.parse(response).results

    console.log(response[0].shop_id)
    await dbo.collection("shop").updateOne({ shop_id: response[0].shop_id }, { $set: response[0] }, { upsert: true })

    let timeNow = getDateTimeNow()
    await dbo.collection("shopTracking").insertOne({
      'shop_id': response[0].shop_id,
      'total_sales': dbData[index].total_sales,
      'time_update': timeNow
    })
    await dbo.collection("shop").updateOne({ shop_id: response[0].shop_id }, { $set: { total_sales: dbData[index].total_sales } }, { upsert: true })
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
});

app.use(express.static("public"))

io.on("connection", async function (client) {
  let clientDB = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  var dbo = clientDB.db("trackingdb")

  // let clientDBBraumstar = await MongoClient.connect('mongodb://zic:Mynewpassword%400@braumstar.com:27020/zicDb?authSource=zicDb', { useNewUrlParser: true, useUnifiedTopology: true })
  // var dboBraumstar = clientDBBraumstar.db("zicDb")

  client.on("join", async function (data) {
    console.log('1 client connected')
    let dbData = await dbo.collection("shop").find().toArray()
    await client.emit("dataTransfer", dbData)
  })

  client.on("shop_id", async function (shop_id) {
    let dbData = await dbo.collection("listing").find({ shop_id: { "$eq": shop_id } }).toArray()
    await client.emit("listingDataTransfer", dbData)
  })

  client.on("get_user_by_shop_id", async function (user_id) {
    let dbData = await dbo.collection("shop").find({ user_id: { "$eq": user_id } })
    await client.emit("userDataTransfer", dbData)
  })

  client.on("shop-tracking", async function (shop_id) {
    let dbData = await dbo.collection("shopTracking").find({ shop_id: { "$eq": shop_id } }).toArray()
    await client.emit("shop-tracking-data", dbData)



    // await client.emit("shop-category-list-data", dbData)
  })

  // client.on("new-user", async function (dataUser) {
  //   var data = {
  //     _id: null,
  //     username: dataUser.userName,
  //     password: dataUser.pass,
  //     createdAt: Date.now() / 1000 | 0,
  //     updatedAr: Date.now() / 1000 | 0
  //   }
  //   await dboBraumstar.insertOne(data)
  // await client.emit("userDataTransfer", dbData)
  // })
})

async function fetchData(siteUrl) {
  let result
  try {
    result = await axios.get(siteUrl)
  } catch (err) {
    result = err.response.status
  }
  if (result == 404) {
    return 0
  }
  return cheerio.load(result.data)
}

async function getTotalSalesFromWeb(siteUrl) {
  const $ = await fetchData(siteUrl)
  if ($ == 0) {
    return 0
  }
  let postJobButton = $('.shop-sales-reviews > span').text().split(' ')
  if (postJobButton == '') {
    return 0
  }
  return postJobButton[0]
}
// getShopCategoryFromWeb()
async function getShopCategoryFromWeb(siteUrl = null) {
  const $ = await fetchData('https://www.etsy.com/shop/AfremovFamily')
  if ($ == 0) {
    return 0
  }
  let postJobButton = $('.vertical-tabs[aria-label="Sections"]').text()
  console.log(postJobButton)
  // postJobButton = postJobButton.split('shop ')
  // postJobButton.splice(0, 1);
  // for (let index = 0; index < postJobButton.length; index++) {
  //   postJobButton[index] = postJobButton[index].split(' ')[0].trim()
  // }

  // return postJobButton
}

async function getShopNameFromWeb(siteUrl) {
  const $ = await fetchData(siteUrl)
  if ($ == 0) {
    return 0
  }
  let postJobButton = $('ul.tab-reorder-container').text()
  postJobButton = postJobButton.split('shop ')
  postJobButton.splice(0, 1);
  for (let index = 0; index < postJobButton.length; index++) {
    postJobButton[index] = postJobButton[index].split(' ')[0].trim()
  }

  return postJobButton
}

async function makeRequest(method, url) {
  return new Promise(function (resolve, reject) {
    xhr.open(method, url, true)
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

server.listen(80)

// require("greenlock-express")
//   .init({
//     packageRoot: __dirname,
//     configDir: "./greenlock.d",
//     maintainerEmail: "jon@example.com",
//     cluster: false,
//     // approveDomains: ['giftsvk.com', 'www.giftsvk.com'],
//   })
//   .serve(app)
