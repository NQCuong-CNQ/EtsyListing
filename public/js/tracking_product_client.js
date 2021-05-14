// var socket = io.connect("http://giftsvk.com:80")
var socket = io.connect("http://localhost:80")
var listingData = []
var filterByDateOption = 0
var isSearch = false
var sortOption = 1

/* ------------------------------------------------MAIN SECTION------------------------------------------------ */

$('#all-filter-listing-creation-date').on('click', async function () {
  filterByDateOption = 0
  searchOrFilterData()
})

$('#1d-filter-listing-creation-date').on('click', async function () {
  filterByDateOption = 1
  searchOrFilterData()
})

$('#3d-filter-listing-creation-date').on('click', async function () {
  filterByDateOption = 3
  searchOrFilterData()
})

$('#7d-filter-listing-creation-date').on('click', async function () {
  filterByDateOption = 7
  searchOrFilterData()
})

$('#custom-filter-listing-creation-date').on('click', async function () {
  filterByDateOption = 'custom'
  $('#custom-filter-listing-creation-date').daterangepicker()
  searchOrFilterData()
})

$('#sort-by-view-listing').on('click', async function () {
  sortOption = 1
  searchOrFilterData()
  $('#sort-by-listing').text('Views')
})
$('#sort-by-favorite-listing').on('click', async function () {
  sortOption = 2
  searchOrFilterData()
  $('#sort-by-listing').text('Favorites')
})

$('#sort-by-price-listing').on('click', async function () {
  sortOption = 3
  searchOrFilterData()
  $('#sort-by-listing').text('Price')
})

$('#sort-by-percent-favorite-listing').on('click', async function () {
  sortOption = 4
  searchOrFilterData()
  $('#sort-by-listing').text('% Favorites')
})

$('#sort-by-quantity-listing').on('click', async function () {
  sortOption = 5
  searchOrFilterData()
  $('#sort-by-listing').text('Quantity')
})

$('#find-product-by-keyword-button').on('click', async function () {
  isSearch = true
  searchOrFilterData()
})

function searchOrFilterData() {
  $('#loading').css('display', 'block')
  let dataFilter = listingData

  let keyword = $('#find-product-by-keyword').val().trim().toLowerCase().replace(/ +(?= )/g, '')
  if (keyword == '') {
    isSearch = false
  }

  if (isSearch) {
    dataFilter = searchByKeyword(keyword)
  }

  if (sortOption == 1) {
    dataFilter.sort(compareViews)
  } else if (sortOption == 2) {
    dataFilter.sort(compareFavorites)
  } else if (sortOption == 3) {
    dataFilter.sort(comparePrice)
  } else if (sortOption == 4) {
    dataFilter.sort(comparePercentFavorites)
  } else if (sortOption == 5) {
    dataFilter.sort(compareQuantity)
  }

  if (filterByDateOption == 'custom') {
    

  } else if (filterByDateOption == 0) {

  } else {
    dataFilter = filterByDate(dataFilter, filterByDateOption)
  }

  if (dataFilter.length == 0) {
    dataFilter = 1
  }

  updateData(dataFilter)
}

function filterByDate(data, days) {
  let filterData = []
  for (let i = 0; i < data.length; i++) {
    if (getDayTimeLife(data[i].original_creation_tsz) <= days) {
      filterData.push(data[i])
    }
  }
  return filterData
}

function searchByKeyword(keyword, data = listingData) {
  keyword = keyword.split(' ')
  let dataSearch = []
  for (var i = 0; i < data.length; i++) {
    if (checkSearchByKeyword(keyword, i)) {
      dataSearch.push(data[i])
    }
  }
  return dataSearch
}

function updateData(dataFilter = listingData) {
  $('#product-search-list').empty()
  if (dataFilter == 1) {
    $('#loading').css('display', 'none')
    return
  }
  for (var i = 0; i < dataFilter.length; i++) {
    $('#product-search-list').append(`
        <div class="list-product-search-container">
        <a href="${dataFilter[i].img_url_original}" target="_blank"><img src="${dataFilter[i].img_url}"
            alt="" width="100%" loading='lazy'></a>
        
        <a class="mt-2" href="${dataFilter[i].url}" target="_blank">${dataFilter[i].title}</a>
        <div class="row">
            <p class="col-6"><i class="fas fa-dollar-sign mr-1"></i>${dataFilter[i].price}</p>
            <p class="col-6"><i class="fas fa-eye mr-1"></i>${dataFilter[i].views}</p>
        </div>
        <div class="row">
            <p class="col-6"><i class="fas fa-heart mr-1"></i>${dataFilter[i].num_favorers}</p>
            <p class="col-6"><i class="fas fa-heartbeat mr-1"></i>${dataFilter[i].percent_favor}%</p>
        </div>
    </div>
    `)
  }
  $('#loading').css('display', 'none')
}



/* ------------------------------------------------END MAIN SECTION------------------------------------------------ */

/* ------------------------------------------------SOCKET SECTION------------------------------------------------ */
socket.emit("product-tracking-join")
$('#loading').css('display', 'block')

socket.on("updating", function (data) {
  alert('Data Server is updating, please come back later!')
})

socket.on("return-product-tracking-join", function (data) {
  listingData = []
  listingData = data
  listingData.sort(compareViews)
  console.log(listingData[2].img_url_original)

  updateData()
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


function compareViews(a, b) {
  const bandA = a.views
  const bandB = b.views
  return compareAction(bandA, bandB)
}

function compareFavorites(a, b) {
  const bandA = a.num_favorers
  const bandB = b.num_favorers
  return compareAction(bandA, bandB)
}

function comparePrice(a, b) {
  const bandA = a.price
  const bandB = b.price
  return compareAction(bandA, bandB)
}

function comparePercentFavorites(a, b) {
  const bandA = a.percent_favor
  const bandB = b.percent_favor
  return compareAction(bandA, bandB)
}

function compareQuantity(a, b) {
  const bandA = a.quantity
  const bandB = b.quantity
  return compareAction(bandA, bandB)
}

function compareAction(bandA, bandB) {
  bandA = parseFloat(bandA)
  bandB = parseFloat(bandB)
  let comparison = 0;
  if (bandA > bandB) {
    comparison = 1;
  } else if (bandA < bandB) {
    comparison = -1;
  }
  return comparison * -1;
}

function getDayTimeLife(creation_time) {
  let timeNow = new Date().getTime()
  let life_time = Math.floor(timeNow / 1000) - creation_time
  return life_time / 86400
}

function getEpochTime(input) {
  var date = new Date(0)
  date.setUTCSeconds(input)
  time = String(date)
  time = time.split(' ')
  time = time[2] + '-' + convertMonthInString(time[1]) + '-' + time[3]
  return time
}

function convertMonthInString(month) {
  switch (month) {
    case 'Jan': return '01'
    case 'Feb': return '02'
    case 'Mar': return '03'
    case 'Apr': return '04'
    case 'May': return '05'
    case 'Jun': return '06'
    case 'Jul': return '07'
    case 'Aug': return '08'
    case 'Sep': return '09'
    case 'Oct': return '10'
    case 'Nov': return '11'
    case 'Dec': return '12'
  }
}

/* ------------------------------------------------END ADDITIONAL SECTION------------------------------------------------ */

/* ------------------------------------------------FILTER SECTION------------------------------------------------ */

function checkSearchByKeyword(keyword, index) {
  if (keyword.length == 1 && checkSearchTaxonomy(keyword, index)) {
    return true
  }

  for (let j = 0; j < keyword.length; j++) {
    if (listingData[index].title.toLowerCase().includes(keyword[j])) {
    } else { return false }
  } return true
}

function checkSearchTaxonomy(keyword, index) {
  for (var i = 0; i < listingData[index].taxonomy_path.length; i++) {
    if (listingData[index].taxonomy_path[i].toLowerCase().includes(keyword[0])) {
      return true
    }
  }
}

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

