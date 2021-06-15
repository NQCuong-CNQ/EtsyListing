// const MongoClient = require('mongodb').MongoClient;
// const url = "mongodb://localhost:27017/trackingdb"

test()
async function test(){
  dbData = [
    {
      id: '1',
      name: 'cuong12'
    },
    {
      id: '2',
      name: 'cuong2'
    },{
      id: '3',
      name: 'cuong3'
    },{
      id: '4',
      name: 'cuong4'
    },{
      id: '5',
      name: 'cuong5'
    },{
      id: '6',
      name: 'cuong6'
    },{
      id: '7',
      name: 'cuong7'
    },{
      id: '8',
      name: 'cuong8'
    },
  ]
  if (dbData.length > 5) {
    dbData = dbData.slice(dbData.length - 5, dbData.length)
  }
  console.log(dbData)
}


// othertest()
// async function othertest(){

//     let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
//     var dbo = client.db("trackingdb")
//     console.log('oldListing')

//     let clientDBBraumstar = await MongoClient.connect('mongodb://zic:Mynewpassword%400@braumstar.com:27020/zicDb?authSource=zicDb', { useNewUrlParser: true, useUnifiedTopology: true })
//     var dboBraumstar = clientDBBraumstar.db("zicDb")
//     let dbData = await dboBraumstar.collection("etsyAccounts").find({ username: 'vi' }).toArray()
//     console.log(getUpdateHistoryEpoch(1623692049))
// }


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