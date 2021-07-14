const MongoClient = require('mongodb').MongoClient;
// const url = "mongodb://localhost:27017/trackingdb"

// const $ = require("jquery")

// test()
// async function test(){
//   dbData = [
//     {
//       id: '1',
//       name: 'cuong12'
//     },
//     {
//       id: '2',
//       name: 'cuong2'
//     },{
//       id: '3',
//       name: 'cuong3'
//     },{
//       id: '4',
//       name: 'cuong4'
//     },{
//       id: '5',
//       name: 'cuong5'
//     },{
//       id: '6',
//       name: 'cuong6'
//     },{
//       id: '7',
//       name: 'cuong7'
//     },{
//       id: '8',
//       name: 'cuong8'
//     },
//   ]
//   if (dbData.length > 5) {
//     dbData = dbData.slice(dbData.length - 5, dbData.length)
//   }
//   console.log(dbData.length)
// }

// let data = {
//     "product": {
//         "title": "Burton Custom Freestyle 151",
//         "body_html": "<strong>Good snowboard!</strong>",
//         "vendor": "Burton",
//         "product_type": "Snowboard",
//         "tags": [
//             "Barnes & Noble",
//             "Big Air",
//             "John's Fav"
//         ],
//         "status": "draft"
//     }
// }


// othertest()
// async function othertest() {
//     let clientDBBraumstar = await MongoClient.connect('mongodb://zic:Mynewpassword%400@braumstar.com:27020/zicDb?authSource=zicDb', { useNewUrlParser: true, useUnifiedTopology: true })
//     var dboBraumstar = clientDBBraumstar.db("zicDb")
//     let dbData = await dboBraumstar.collection("etsySkus").find({ _id: 'wmug_ztq0IS3N_4' }).toArray()
//     // let dbData = await dboBraumstar.collection("etsyAccounts").find({ username: 'vi' }).toArray()
//     console.log(dbData.length)
// }

// var date = new Date()
// var end = date.toLocaleDateString("en-US")
// console.log(end)
// var d = new Date().getHours();
// console.log(d)

// let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
// var dbo = client.db("trackingdb")
// console.log('oldListing')
tr()
async function tr(){
    let clientDBBraumstar = await MongoClient.connect('mongodb://zic:Mynewpassword%400@braumstar.com:27020/zicDb?authSource=zicDb', { useNewUrlParser: true, useUnifiedTopology: true })
    var dboBraumstar = clientDBBraumstar.db("zicDb")
    // let dbData = await dboBraumstar.collection("listings").find({_id: 'crl_gsA451735X0K'}).toArray()
    await dboBraumstar.collection("listings").deleteMany({draft_test: true})
//     let users = await Connection.db.collection('listings').find({})
// console.log(dbData.length)
// for (let i = 0; i < dbData.length; i++) {
//     console.log(dbData[i].title) 
// }
    // let name = ['trangviking',
    // 'huyviking',
    // 'hoaviking',
    // 'phuongviking',
    // 'hieuviking',
    // 'uk',
    // 'uk2',
    // 'uk3',
    // 'au',
    // 'uk4',
    // 'uk5',
    // 'uk6',
    // 'de1',
    // 'ca1',
    // 'au1',
    // 'ca2',
    // 'de2',
    // 'us',
    // 'vn',
    // 'ae1',
    // 'ae2',
    // 'ca4',
    // 'ca5',
    // 'pule',
    // 'ae7',
    // 'ae8',
    // 'bin',
    // 'proxyca4',
    // 'vi']
    // for (let i = 0; i < name.length; i++) {
        // await dboBraumstar.collection("etsyAccounts").deleteMany({username: 'ca3'})
        // await dboBraumstar.collection("users").deleteOne({ createdAt: 1606062701})
    //     console.log('done')
    // }

    // console.log(num.length)
    // for (let i = 0; i < users.length; i++) {
    //     console.log(users[i].username)
    // }
    // return
    // for (let i = 0; i < users.length; i++) {
    //     let num = await dboBraumstar.collection("etsyAccounts").find({username: users[i].username}).toArray()
    //     if(num.length == 0){
    //         console.log(users[i].username)
    //         await dboBraumstar.collection("users").deleteOne({ username: users[i].username })
    //     }
        
    // }
// dboBraumstar.collection("users").deleteOne({ username: 'cuongtest' })
// console.log(shops.length)
}
// 

// function getUpdateHistoryEpoch(input){
//     var date = new Date(0)
//     date.setUTCSeconds(input)
//     time = String(date)
//     time = time.split(' ')
//     time = time[2] + '/' + convertMonthInString(time[1]) + ' ' + time[4]
//     return time
//   }
//   function convertMonthInString(month) {
//     switch (month) {
//       case 'Jan': return '01'
//       case 'Feb': return '02'
//       case 'Mar': return '03'
//       case 'Apr': return '04'
//       case 'May': return '05'
//       case 'Jun': return '06'
//       case 'Jul': return '07'
//       case 'Aug': return '08'
//       case 'Sep': return '09'
//       case 'Oct': return '10'
//       case 'Nov': return '11'
//       case 'Dec': return '12'
//     }
//   }
// const axios = require("axios")
// date = new Date().getTime()
// date = Math.floor(date / 3600000)

// console.log(26 - date % 26)
// date = new Date().getTime()
// date = Math.floor(date/1000/3600)
// let item.imgs_listing = []
// console.log(item.imgs_listing.length!=null?1:null)
// console.log(451424/365/24)
// }
// let consumption = car?.[1]?.engine;
// console.log(consumption);
// console.log(date+1)
// console.log((date+1)%26)

// let arr = [
//     {
//         id: '1',
//         str: 'safs'
//     },
//     {
//         id: '2',
//         str: 'cx'
//     },
//     {
//         id: '3',
//         str: 'sfg'
//     },
//     {
//         id: '4',
//         str: 'sef'
//     }
// ]
// arr= arr.map(({str}) => str)
// console.log(arr)


// if (arr.length > 10) {
//     arr = arr.slice(0 , arr.length  )
// }
// console.log(arr.length)
// console.log(arr)
// let salesLargerThan = '00000000008888'
// salesLargerThan = parseInt(salesLargerThan)
// console.log(salesLargerThan)
// console.log(Number.isInteger(parseInt(str.slice(0,4))))

// let date = new Date().getTime()
// let dateCount = Math.floor(date /1000)
// console.log(dateCount)
// console.log(IsJsonString(`sadfsf`))
// function IsJsonString(str) {
//     try {
//         JSON.parse(str)
//     } catch (e) {
//         return false
//     }
//     return true
//   }