"use strict";
const fs = require('fs')
var express = require("express")
var app = express()
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest()

// console.log(fs.readFileSync("ssl/te.txt"))
// var https_options = {

//   // key: fs.readFileSync("/path/to/private.key"),

//   cert: fs.readFileSync("ssl/certificate.crt"),

//   ca: fs.readFileSync('ssl/ca_bundle.crt')

// };
var server = require("http").createServer(app)
// var io = require("socket.io")(server)

// app.use(function cors(req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   res.setHeader('Access-Control-Allow-Headers', 'X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method,Access-Control-Request-Headers, Authorization, append,delete,entries,foreach,get,has,keys,set,values')
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
//   if (req.method === 'OPTIONS') {
//     res.status(200);
//   }next()
// })

const limit = 100
var offset = 0
var iCountSales = 0
var total_sales = []

let siteUrl
const axios = require("axios");
const cheerio = require('cheerio');

// getFromWeb()
async function fetchData() {
  const result = await axios.get(siteUrl);
  return cheerio.load(result.data);
};

async function getFromWeb() {
  const $ = await fetchData();
  const postJobButton = $('.shop-sales-reviews > span').text().split(' ');
  return postJobButton[0]
}




// var myobj
const MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/trackingdb"

updateTotalSales()

function updateTotalSales() {
  MongoClient.connect(url,{ useUnifiedTopology: true }, async function (err, db) {
    if (err) throw err
    var dbo = db.db("trackingdb")

    dbo.collection("shop").find().toArray()
    .then(items => {
      console.log(`Successfully found ${items.length} documents.`)
      items.forEach(console.log)
      // return items
    })

    db.close()
    await sleep(500)
  })
}


// updateData()
async function connectDB(response) {
  MongoClient.connect(url, async function (err, db) {
    if (err) throw err
    var dbo = db.db("trackingdb")
    // await sleep(100)
    // dbo.collection("shop").drop(function(err, delOK) {
    //   if (err) throw err
    //   // if (delOK) console.log("Collection deleted");
    //   // db.close();
    // })
    // await sleep(100)
    // dbo.createCollection("shop", function(err, res) {
    //   if (err) throw err
    //   // console.log("Collection shop created!")
    // })



    // console.log(response)
    response = JSON.parse(response).results
    // response._id = response[0].shop_id
    dbo.collection("shop").insertMany(response, function (err, res) {
      if (err) throw err
      console.log("100 document inserted")
    })

    await getTotalSales(response)
    console.log('total_sales' + total_sales[i])
    for (var i = 0; i < limit; i++) {
      console.log(total_sales[i])
      dbo.collection("shop").updateOne({ shop_name: response[i].shop_name }, { $set: { "total_sales": total_sales[i] } },
        {
          upsert: false,
          multi: true
        })
    }
    total_sales = []

    db.close()
    await sleep(500)
  })
}

async function getTotalSales(response) {
  console.log(iCountSales)
  if (iCountSales < 100) {
    siteUrl = "https://www.etsy.com/shop/" + response[iCountSales].shop_name
    total_sales.push(await getFromWeb())
    iCountSales++
    await getTotalSales(response)
  }
}

function sleep(ms) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}

async function updateData() {
  if (offset < 50100) {
    console.log(offset)
    xhr.open("GET", `https://openapi.etsy.com/v2/shops?api_key=2mlnbmgdqv6esclz98opmmuq&limit=${limit}&offset=${offset}`, true)
    xhr.onreadystatechange = async function () {
      if (xhr.readyState === xhr.DONE) {
        let status = xhr.status
        if (status === 0 || (status >= 200 && status < 400)) {
          let response = xhr.responseText
          await connectDB(response)
          // await sleep(5000)
          offset += limit
          await updateData()
        }
      }
    }
    xhr.send()
  }
}

// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   // const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   console.log("Connected successfully to server");
//   var dbo = db.db("etsylisting");
//   dbo.createCollection("customers", function(err, res) {
//     if (err) throw err;
//     console.log("Collection created!");
//     db.close();
//   });
//   client.close();
// });

app.get("/", function (req, res, next) {
  res.sendFile(__dirname + "/public/index.html")
});

app.use(express.static("public"))

// io.on("connection", function (client) {
//   console.log("Client connected...")

//   client.on("join", function (data) {
//     console.log(data.customId)
//   });

//   client.on("messages", function (data) {
//     console.log(data)
//     //   client.emit("thread", data);
//     client.broadcast.emit("thread", data)
//   });
// });




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
