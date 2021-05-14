var socket = io.connect("http://giftsvk.com:80")
// var socket = io.connect("http://localhost:80")
// var shopData
var listingData = []
// var category
// var shopDataFilter = []
// var timeCreatedShopFilter = 0

/* ------------------------------------------------MAIN SECTION------------------------------------------------ */
$('#find-product-by-keyword-button').on('click', async function () {
  // let keyword = $('#find-product-by-keyword').val().trim().replace(/ +(?= )/g, '')
  // if (keyword == '') {
  //   alert('Please input keyword!')
  // }

  // $('#loading').css('display', 'block')
  // await socket.emit("find-product-by-keyword", keyword)
  // listingData = []
})

/* ------------------------------------------------END MAIN SECTION------------------------------------------------ */

/* ------------------------------------------------SOCKET SECTION------------------------------------------------ */
socket.on("connect", async function (data) {
  await socket.emit("product-tracking-join")
  console.log('sending')
  $('#loading').css('display', 'block')
})

socket.on("updating", function (data) {
  alert('Data Server is updating, please come back later!')
})

socket.on("return-product-tracking-join", function (data) {
  console.log('receiving')
  $('#loading').css('display', 'none')
  listingData.push(data)
  listingData.sort(compare)
  console.log('ok')
  for (var i = 0; i < data.length; i++) {
    $('#product-search-list').append(`
        <div class="list-product-search-container">
        <a href="${listingData[i].img_url_original}" target="_blank"><img src="${listingData[i].img_url}"
            alt="" width="100%"></a>
        
        <a class="mt-2" href="${listingData[i].url}" target="_blank">${listingData[i].title}</a>
        <div class="row">
            <p class="col-6"><i class="fas fa-dollar-sign mr-1"></i>${listingData[i].price}</p>
            <p class="col-6"><i class="fas fa-eye mr-1"></i>${listingData[i].views}</p>
        </div>
        <div class="row">
            <p class="col-6"><i class="fas fa-heart mr-1"></i>${listingData[i].num_favorers}</p>
            <p class="col-6"><i class="fas fa-heartbeat mr-1"></i></p>
        </div>
    </div>
    `)
  }
})

// socket.on("return-find-product-by-keyword", function (data) {
//   $('#loading').css('display', 'none')
//   listingData.push(data)
//   listingData.sort(compare)

//   $('#product-search-list').empty()
//   for (var i = 0; i < listingData.length; i++) {
//     $('#product-search-list').append(`
//         <div class="list-product-search-container">
//             <a href="${listingData[i].img_url_original}" target="_blank"><img src="${listingData[i].img_url}"
//                 alt="" width="100%"></a>
            
//             <a class="mt-2" href="${listingData[i].url}" target="_blank">${listingData[i].title}</a>
//             <div class="row">
//                 <p class="col-6"><i class="fas fa-dollar-sign mr-1"></i>${listingData[i].price}</p>
//                 <p class="col-6"><i class="fas fa-eye mr-1"></i>${listingData[i].views}</p>
//             </div>
//             <div class="row">
//                 <p class="col-6"><i class="fas fa-heart mr-1"></i>${listingData[i].num_favorers}</p>
//                 <p class="col-6"><i class="fas fa-heartbeat mr-1"></i></p>
//             </div>
//         </div>
//         `)
//   }
// })

/* ------------------------------------------------END SOCKET SECTION------------------------------------------------ */

/* ------------------------------------------------ADDITIONAL SECTION------------------------------------------------ */


function compare(a, b) {
  // Use toUpperCase() to ignore character casing
  const bandA = a.views
  const bandB = b.views

  let comparison = 0;
  if (bandA > bandB) {
    comparison = 1;
  } else if (bandA < bandB) {
    comparison = -1;
  }
  return comparison * -1;
}

// function getDayTimeLife(creation_time) {
//   let timeNow = new Date().getTime()
//   let life_time = Math.floor(timeNow / 1000) - creation_time
//   return Math.floor(life_time / 86400)
// }

// function getAvgSales(total_sales, creation_time) {
//   let avgSales = total_sales / getDayTimeLife(creation_time)
//   return avgSales.toFixed(2)
// }

// function getEpochTime(input) {
//   var date = new Date(0)
//   date.setUTCSeconds(input)
//   time = String(date)
//   time = time.split(' ')
//   time = time[2] + '-' + convertMonthInString(time[1]) + '-' + time[3]
//   return time
// }

// function convertMonthInString(month) {
//   switch (month) {
//     case 'Jan': return '01'
//     case 'Feb': return '02'
//     case 'Mar': return '03'
//     case 'Apr': return '04'
//     case 'May': return '05'
//     case 'Jun': return '06'
//     case 'Jul': return '07'
//     case 'Aug': return '08'
//     case 'Sep': return '09'
//     case 'Oct': return '10'
//     case 'Nov': return '11'
//     case 'Dec': return '12'
//   }
// }

// var coll = document.getElementsByClassName("collapsible")
// for (let i = 0; i < coll.length; i++) {
//   coll[i].addEventListener("click", function () {
//     this.classList.toggle("active")
//     var content = this.nextElementSibling
//     if (content.style.display === "block") {
//       content.style.display = "none";
//     } else {
//       content.style.display = "block"
//     }
//   })
// }
/* ------------------------------------------------END ADDITIONAL SECTION------------------------------------------------ */

/* ------------------------------------------------FILTER SECTION------------------------------------------------ */
// function updateDataTimeFiler(shopDataFilter) {
//   $('#table_id').DataTable().clear().destroy()
//   for (var i = 0; i < shopDataFilter.length; i++) {
//     $('#table').append(`<tr>
//         <td onclick="getShopDetail(${i})"><i class="fas fa-info-circle pointer"></i></td>
//         <td>${shopDataFilter[i].shop_name}</td>
//         <td><a href='${shopDataFilter[i].url}' target="_blank">www.etsy.com/shop...</a></td>
//         <td>${getAvgSales(shopDataFilter[i].total_sales, shopDataFilter[i].creation_tsz)}</td>
//         <td>${shopDataFilter[i].total_sales.toLocaleString()}</td>
//         <td>${getEpochTime(shopDataFilter[i].creation_tsz)}</td>
//         <td>${shopDataFilter[i].currency_code}</td>
//         <td>${shopDataFilter[i].listing_active_count.toLocaleString()}</td>
//         <td>${shopDataFilter[i].num_favorers.toLocaleString()}</td>
//         <td>${shopDataFilter[i].languages}</td>
//         <td>${shopDataFilter[i].shop_id}</td>
//     </tr>`)
//   }

//   $('#table_id').DataTable({
//     scrollX: 400,
//     pageLength: 25,
//     order: [[3, "desc"]],
//     searching: false,
//   })
// }


// $('#all-shop-filter').on('click', async function () {
//   category = 'All'
//   $('#dropdown-filter-shop').text('All')
//   if (timeCreatedShopFilter == 0) {
//     shopDataFilter = shopData
//   } else {
//     timeCreatedShopFilterAction()
//   }
//   updateData()
// })

// $('#canvas-shop-filter').on('click', async function () {
//   category = 'Canvas'
//   await shopFilterAction(category)
// })

// $('#shirt-shop-filter').on('click', async function () {
//   category = 'Shirt'
//   await shopFilterAction(category)
// })

// $('#mug-shop-filter').on('click', async function () {
//   category = 'Mug'
//   await shopFilterAction(category)
// })

// $('#blanket-shop-filter').on('click', async function () {
//   category = 'Blanket'
//   await shopFilterAction(category)
// })

// $('#all-time-created-shop-filter').on('click', async function () {
//   timeCreatedShopFilter = 0
//   $('#dropdown-filter-shop-time-created').text('All')
//   if (category == 'All') {
//     shopDataFilter = shopData
//   }
//   updateData()
// })

// $('#6m-time-created-shop-filter').on('click', async function () {
//   timeCreatedShopFilter = 1
//   $('#dropdown-filter-shop-time-created').text('In 6 months')
//   timeCreatedShopFilterAction()

// })

// $('#in1y-time-created-shop-filter').on('click', async function () {
//   timeCreatedShopFilter = 2
//   $('#dropdown-filter-shop-time-created').text('In 1 year')
//   timeCreatedShopFilterAction()
// })

// $('#over1y-time-created-shop-filter').on('click', async function () {
//   timeCreatedShopFilter = 3
//   $('#dropdown-filter-shop-time-created').text('Over 1 years')
//   timeCreatedShopFilterAction()
// })

// function timeCreatedShopFilterAction() {
//   let shopTimeDataFilter = []
//   let daysInTime = 0

//   if (timeCreatedShopFilter == 1) {
//     daysInTime = 182
//   }
//   if (timeCreatedShopFilter > 1) {
//     daysInTime = 365
//   }

//   for (let i = 0; i < shopDataFilter.length; i++) {
//     if (timeCreatedShopFilter <= 2 && getDayTimeLife(shopDataFilter[i].creation_tsz) <= daysInTime) {
//       shopTimeDataFilter.push(shopDataFilter[i])
//     } else if (timeCreatedShopFilter == 3 && getDayTimeLife(shopDataFilter[i].creation_tsz) > daysInTime) {
//       shopTimeDataFilter.push(shopDataFilter[i])
//     }
//   }

//   updateDataTimeFiler(shopTimeDataFilter)
// }

// async function shopFilterAction(category) {
//   $('#dropdown-filter-shop').text(category)
//   await socket.emit("get-shop-filter")
//   $('#loading').css('display', 'block')
// }
/* ------------------------------------------------END FILTER SECTION------------------------------------------------ */

