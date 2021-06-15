const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/trackingdb"

test()
async function test(){
    let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    var dbo = client.db("trackingdb")
    let oldListing = await dbo.collection("listing").findOne()
    console.log(oldListing)


    if(oldListing != null){
        console.log('oldListing') 
    }

}


othertest()
async function othertest(){

    let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    var dbo = client.db("trackingdb")
    console.log('oldListing')

    let clientDBBraumstar = await MongoClient.connect('mongodb://zic:Mynewpassword%400@braumstar.com:27020/zicDb?authSource=zicDb', { useNewUrlParser: true, useUnifiedTopology: true })
    var dboBraumstar = clientDBBraumstar.db("zicDb")
    let dbData = await dboBraumstar.collection("etsyAccounts").find({ username: 'vi' }).toArray()
    console.log(dbData)
}

// var date = new Date().getTime()
// date = Math.floor(date / 3600000)
// for (let i = 0; i < 1000; i++) {
//     console.log(i%26)
    
// }
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