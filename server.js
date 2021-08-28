"use strict";
const fs = require('fs')
const express = require("express")
const app = express()
const https = require("https")
// const rateLimit = require("express-rate-limit")
const axios = require("axios")
const cheerio = require('cheerio')
const { exec } = require("child_process")
const cookieParser = require('cookie-parser')
const spdy = require('spdy')

var mainRoute = require('./routers/main-router')
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: "TOO MANY REQUESTS",
// })

//ssl from Certbot
var server = spdy.createServer({
  cert: fs.readFileSync("./ssl/fullchain.pem"),
  key: fs.readFileSync("./ssl/privkey.pem"),
}, app)

var io = require("socket.io")(server, {
  cors: {
    origin: '*',
  },
  transports: ['websocket']
})

app.set('view engine', 'ejs')
app.set('views', __dirname + '/public/views/')

// app.use(limiter)
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))
app.use(express.static("public"))
app.use('/', mainRoute)

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
}

async function sleep(ms) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  )
}

function getDateTimeNow() {
  let date = new Date().getTime()
  let time = Math.floor(date / 1000)
  return time
}

io.on("connection", async function (client) {
  if (client.handshake.query.type == 2) {
    let clientID = client.handshake.query.client_id
    console.log('client:', clientID)
    client.join(clientID)
  } else if (client.handshake.query.type == 1) {
    let etsyID = client.handshake.query.etsy_id
    console.log('etsyID:', etsyID)
    client.join(etsyID)
  }

  client.on("client-list-new", function (data) {
    client.to(data.shop).emit('etsy-list-new', data)
  })

  client.on("etsy-list-done", function (data) {
    client.to(data.client_id).emit('response-list-to-client', data)
  })

  client.on("get_listing_shop_id", async function (shop_id) {
    let result = await makeRequest("GET", `https://openapi.etsy.com/v2/shops/${shop_id}/listings/active?api_key=${api_key_2}`)
    if (IsJsonString(result)) {
      result = JSON.parse(result).results
      client.emit("return-listing-data", result)
    } else {
      client.emit("return-listing-data", 0)
    }
  })

  client.on("get_user_by_user_id", async function (user_id) {
    let result = await makeRequest("GET", `https://openapi.etsy.com/v2/users/${user_id}/profile?api_key=${api_key_2}`)
    if (IsJsonString(result)) {
      result = JSON.parse(result).results
      client.emit("return-user-data", result[0])
    } else {
      client.emit("return-user-data", 0)
    }
  })

  client.on("find-shop-by-name", async function (shopName) {
    try {
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
    } catch (error) {
      console.log(error)
    }
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
      let getNewUser = await dboBraumstar.collection("users").findOne({ username: dataUser.userName })
      console.log(getNewUser)
      if (getNewUser != null) {
        isSuccess = 1
      }
      client.emit("return-new-user-braumstar", isSuccess)
    }
    else if (getOldUser.username == dataUser.userName) {
      isSuccess = -1
      client.emit("return-new-user-braumstar", isSuccess)
    }
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

  client.on("delete-user-braumstar", async function (user) {
    let clientDBBraumstar = await MongoClient.connect('mongodb://zic:Mynewpassword%400@braumstar.com:27020/zicDb?authSource=zicDb', { useNewUrlParser: true, useUnifiedTopology: true })
    let dboBraumstar = clientDBBraumstar.db("zicDb")
    let shops = await dboBraumstar.collection("etsyAccounts").find({ username: user }).toArray()

    if (shops.length > 0) {
      client.emit("return-delete-user-braumstar", 0)
    } else if (shops.length == 0) {
      await dboBraumstar.collection("users").deleteOne({ username: user })
      client.emit("return-delete-user-braumstar", 1)
    }
  })

  client.on("track-order-join", async function (data) {
    if (isUpdate) {
      console.log('server is updating, not run add tracking!')
    } else {
      console.log('getting data success! ' + data['data'].length)
      client.broadcast.emit("add-tracking-status-server-to-client", { name: 'server', status: 2 })
      let trackData = []
      let temp = data['data'].split('\n')
      let trackObj
      let trackDataForSave

      let findSTT = temp[0].split(',')
      let pro_ID_num = findSTT.indexOf('order id')
      let track_number_num = findSTT.indexOf('tracking')
      let order_status_num = findSTT.indexOf('order status')
      let order_date_num = findSTT.indexOf('order date')
      let customer_name_num = findSTT.indexOf('customer name')
      console.log(findSTT)
      console.log(pro_ID_num)
      console.log(track_number_num)
      console.log(order_status_num)
      console.log(order_date_num)
      console.log(customer_name_num)
      return

      for (let i = 1; i < temp.length - 1; i++) {
        try {
          trackObj = new Object
          trackObj['pro_ID'] = temp[i].split(',')[pro_ID_num].replace(/[^0-9]/g, '')
          trackObj['track_number'] = temp[i].split(',')[track_number_num].replace(/[^0-9a-zA-Z]/g, '')
          trackObj['order_status'] = temp[i].split(',')[order_status_num].replace(/[^0-9a-zA-Z]/g, '')

          if (trackObj['track_number'] != '' && trackObj['order_status'] == 'Shipped') {
            trackData.push(trackObj)
          }

          trackDataForSave = new Object
          trackDataForSave['id'] = trackObj['pro_ID']
          trackDataForSave['number_tracking'] = trackObj['track_number']
          trackDataForSave['order_date'] = temp[i].split(',')[order_date_num].replace(/"/g, '')
          trackDataForSave['order_status'] = trackObj['order_status']
          trackDataForSave['customer_name'] = temp[i].split(',')[customer_name_num].replace(/[^0-9a-zA-Z]/g, '')
          trackDataForSave['user'] = data['name']
          await dbo.collection("tracking_etsy_history").updateOne({ id: trackDataForSave['id'] }, { $set: trackDataForSave }, { upsert: true })
        } catch (error) {
          console.log('track-order-join error ' + error)
        }
      }

      client.broadcast.emit("get-email-customer-order")
      await dbo.collection("add_complete").deleteMany()
      await refreshRPC()

      console.log('reload etsy')
      client.broadcast.emit("reload-etsy")
      await sleep(100)
      client.broadcast.emit("add-tracking-status-server-to-client", { name: 'server', status: 3 })
      await sleep(20000)
      console.log('send data to etsy' + trackData.length)
      client.broadcast.emit("add-tracking-status-server-to-client", { name: 'server', status: 4 })
      await sleep(100)
      client.broadcast.emit("track-order-return", trackData)
    }
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
    if (complete.length == 3) {
      console.log(`closed all RDC`)
      client.broadcast.emit("add-tracking-status-server-to-client", { name: 'server', status: 5 })
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

  client.on("get-server-status", function () {
    if (!isUpdate) {
      client.emit("return-server-status", 'Idle')
    } else {
      client.emit("return-server-status", 'Server is updating database')
    }
  })

  client.on("open-all-vps", async function () {
    await refreshRPC()
  })

  client.on("thao-save", async function (data) {
    await dbo.collection("thao_log").insertOne(data)
  })

  client.on("get-log-thao", async function () {
    let data = await dbo.collection("thao_log").find({}).toArray()
    client.emit("return-get-log-thao", data)
  })
})

async function refreshRPC() {
  console.log(`closed all RDC`)
  exec("taskkill /im mstsc.exe /t")
  await sleep(1000)
  exec("taskkill /im mstsc.exe /t /f")
  await sleep(1000)

  let arrVPS = ['64.190.87.132', '155.138.146.185', '149.248.60.29']

  for (let item of arrVPS) {
    console.log(`connect to ${item}`)
    exec(`mstsc /v:${item}`)
    await sleep(400)
  }
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

server.listen(443)