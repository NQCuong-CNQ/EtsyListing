"use strict";
const fs = require('fs')
var express = require("express")
var app = express()
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
var xhr = new XMLHttpRequest()
const axios = require("axios")
const cheerio = require('cheerio')

// console.log(fs.readFileSync("ssl/te.txt"))
// var https_options = {
//   cert: fs.readFileSync("ssl/certificate.crt"),
//   ca: fs.readFileSync('ssl/ca_bundle.crt')
// };

var server = require("http").createServer(app)
var io = require("socket.io")(server)

// app.use(function cors(req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   res.setHeader('Access-Control-Allow-Headers', 'X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method,Access-Control-Request-Headers, Authorization, append,delete,entries,foreach,get,has,keys,set,values')
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
//   if (req.method === 'OPTIONS') {
//     res.status(200);
//   }next()
// })

const limit = 100
const api_key = '2mlnbmgdqv6esclz98opmmuq'
var offset = 0
var total_sales = []

let siteUrl

const MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/trackingdb"

updateData()

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

async function updateListing() {
  let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  var dbo = client.db("trackingdb")
  let dataShop = await dbo.collection("shop").find().toArray()

  for (let i = 0; i < dataShop.length; i++) {
    if (dataShop[i].listing_active_count > 5) {
      console.log('get listing shop: ' + dataShop[i].shop_id)

      let result = await makeRequest("GET", `https://openapi.etsy.com/v2/shops/${dataShop[i].shop_id}/listings/active?api_key=${api_key}`)
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

async function connectDB(response) {
  let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  var dbo = client.db("trackingdb")

  // await dbo.collection("shop").drop()
  // await dbo.createCollection("shop")

  response = JSON.parse(response).results
  console.log("100 document inserted")

  for (var i = 0; i < limit; i++) {
    await dbo.collection("shop").updateOne({ shop_name: response[i].shop_name }, { $set: response[i] }, { upsert: true })

    siteUrl = "https://www.etsy.com/shop/" + response[i].shop_name
    total_sales = await getTotalSalesFromWeb()

    console.log(response[i].shop_name + ":" + total_sales)
    await dbo.collection("shop").updateOne({ shop_name: response[i].shop_name }, { $set: { "total_sales": total_sales } }, { upsert: true })
  }

  client.close()
}

async function sleep(ms) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}

async function updateData() {
  if (offset < 50100) {
    console.log('offset: ' + offset)
    xhr.open("GET", `https://openapi.etsy.com/v2/shops?api_key=${api_key}&limit=${limit}&offset=${offset}`, true)
    xhr.onreadystatechange = async function () {
      if (xhr.readyState === xhr.DONE) {
        let status = xhr.status
        if (status === 0 || (status >= 200 && status < 400)) {
          let response = xhr.responseText
          await connectDB(response)
          offset += limit
          await updateData()
        }
      }
    }
    xhr.send()
  } else {
    await updateListing()
    console.log("Update completed")
  }
}

app.get("/", function (req, res, next) {
  res.sendFile(__dirname + "/public/index.html")
});

app.use(express.static("public"))

io.on("connection", async function (client) {
  let clientMongo = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  var dbo = clientMongo.db("trackingdb")

  client.on("join", async function (data) {
    console.log('1 client connected')
    let dbData = await dbo.collection("shop").find({ total_sales: { $gte: 10 } }).toArray()
    await client.emit("dataTransfer", dbData)
  })

  client.on("shop_id", async function (shop_id) {
    let dbData = await dbo.collection("listing").find({ shop_id: shop_id }).toArray()
    await client.emit("listingDataTransfer", dbData)
  })
})

async function fetchData() {
  const result = await axios.get(siteUrl);
  return cheerio.load(result.data);
};

async function getTotalSalesFromWeb() {
  const $ = await fetchData();
  const postJobButton = $('.shop-sales-reviews > span').text().split(' ');
  if (postJobButton == '') {
    return 0
  }
  return postJobButton[0]
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
