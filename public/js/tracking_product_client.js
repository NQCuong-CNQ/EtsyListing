var socket = io.connect("https://giftsvk.com", {
  port: 443,
  reconnect: true
})

var listingData = []
var dataFilter = []
var filterByDateOption = 0
var filterByTypeOption = 0
var isSearch = false
var sortOption = 1
var pagStart = 0
var pagEnd = 100
var isGridView = true

/* ------------------------------------------------MAIN SECTION------------------------------------------------ */

$('#pod-filter-listing').on('click', async function () {
  filterByTypeOption = 0
  searchOrFilterData()
  $('#filter-listing-type').text('POD')
})

$('#digital-filter-listing').on('click', async function () {
  filterByTypeOption = 1
  searchOrFilterData()
  $('#filter-listing-type').text('Digital')
})

$('#all-filter-listing-creation-date').on('click', async function () {
  filterByDateOption = 0
  searchOrFilterData()
  $('#filter-listing-creation-date').text('All')
})

$('#1d-filter-listing-creation-date').on('click', async function () {
  filterByDateOption = 1
  searchOrFilterData()
  $('#filter-listing-creation-date').text('Last 1 day')
})

$('#3d-filter-listing-creation-date').on('click', async function () {
  filterByDateOption = 3
  searchOrFilterData()
  $('#filter-listing-creation-date').text('Last 3 days')
})

$('#7d-filter-listing-creation-date').on('click', async function () {
  filterByDateOption = 7
  searchOrFilterData()
  $('#filter-listing-creation-date').text('Last 7 days')
})

$('#custom-filter-listing-creation-date').daterangepicker({
  "showDropdowns": true,
  "minYear": 2010,
  "maxYear": 2023,
  "startDate": "12/21/2020",
  "opens": "center"
}, function (start, end, label) {
  filterByDateOption = 'custom'
  $('#filter-listing-creation-date').text(start.format('MM-DD-YYYY') + ' to ' + end.format('MM-DD-YYYY'))
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

$('#sort-by-sale-day-listing').on('click', async function () {
  sortOption = 5
  searchOrFilterData()
  $('#sort-by-listing').text('Sales/day')
})

$('#find-product-by-keyword-button').on('click', async function () {
  isSearch = true
  searchOrFilterData()
})

function searchOrFilterData() {
  $('#loading').css('display', 'block')
  dataFilter = listingData

  let keyword = $('#find-product-by-keyword').val().trim().toLowerCase().replace(/ +(?= )/g, '')
  if (keyword == '') {
    isSearch = false
  }

  if (isSearch) {
    dataFilter = searchByKeyword(keyword)
  }

  // if (filterByTypeOption == 0) {
  //   dataFilter = filterByType(dataFilter)
  // } else if (filterByTypeOption == 1) {
  //   dataFilter = filterByType(dataFilter, true)
  // }

  if (sortOption == 1) {
    dataFilter.sort(compareViews)
  } else if (sortOption == 2) {
    dataFilter.sort(compareFavorites)
  } else if (sortOption == 3) {
    dataFilter.sort(comparePrice)
  } else if (sortOption == 4) {
    dataFilter.sort(comparePercentFavorites)
  } else if (sortOption == 5) {
    dataFilter.sort(compareSaleDay)
  }

  if (filterByDateOption == 'custom') {
    dataFilter = filterByCustomDate(dataFilter)
  } else if (filterByDateOption == 0) {
  } else {
    dataFilter = filterByDate(dataFilter, filterByDateOption)
  }

  if (dataFilter.length == 0) {
    dataFilter = 1
  }

  updateData(dataFilter)
}

$('#first-pagination').on('click', async function () {
  pagStart = 0
  pagEnd = 100
  updateData(dataFilter)
})

$('#last-pagination').on('click', async function () {
  pagStart = Math.floor(dataFilter.length / 100) * 100
  pagEnd = dataFilter.length
  updateData(dataFilter)
})

$('#next-pagination').on('click', async function () {
  pagStart += 100
  pagEnd += 100
  if (pagEnd > Math.floor(dataFilter.length / 100) * 100) {
    pagEnd = dataFilter.length
  }
  updateData(dataFilter)
})

$('#back-pagination').on('click', async function () {
  pagStart -= 100
  pagEnd = pagStart + 100
  if (pagStart < 0) {
    pagStart = 0
    pagEnd = 100
  }
  updateData(dataFilter)
})

function updateData(dataFilter = listingData) {
  $('#product-list').empty()
  if (dataFilter == 1) {
    $('#loading').css('display', 'none')
    return
  }

  if (dataFilter.length < 100) {
    pagEnd = dataFilter.length
  } else {
    if (pagEnd < 100) {
      pagEnd = 100
    }
  }
  updatePaginationBtn(dataFilter)

  $('#number-entries').text('Showing ' + pagStart + ' - ' + pagEnd + ' of ' + dataFilter.length + ' listing')
  $('#pagination-number').text(pagStart / 100 + 1)

  for (var i = pagStart; i < pagEnd; i++) {
    $('#product-list').append(`
        <div class="list-product-search-container">
          <a href="${dataFilter[i].img_url_original}" target="_blank"><img src="${dataFilter[i].img_url}"
              alt="" width="100%" loading='lazy'></a>
          <a class="mt-2" href="${dataFilter[i].url}" target="_blank">${dataFilter[i].title}</a>
          <div class="row pl-3 pr-2">
              <p class="col-4 p-0"><i class="fas fa-eye mr-1"></i>${dataFilter[i].views}</p>
              <p class="col-4 p-0"><i class="fas fa-heart mr-1"></i>${dataFilter[i].num_favorers}</p>
          </div>  
          <div class="row pl-3 pr-2">
              <p class="col-4 p-0"><i class="fas fa-heartbeat mr-1"></i>${dataFilter[i].percent_favor}%</p>
          </div>
      </div>
    `)
  }
  $('#loading').css('display', 'none')
  scrollToTop()
}

/* ------------------------------------------------END MAIN SECTION------------------------------------------------ */

/* ------------------------------------------------SOCKET SECTION------------------------------------------------ */

let listingLocalData = window.localStorage.getItem('listing-data')
if (listingLocalData != null) {
  listingData = JSON.parse(listingLocalData)
  // handleDuplicates()
  searchOrFilterData()
  toastr.clear()
  toastr.info('Updating data...')
} else {
  $('#loading').css('display', 'block')
}

socket.emit("product-tracking-join")

socket.on("updating", function (data) {
  toastr.clear()
  toastr.warning('Data Server is updating, cannot get new information!')
})

socket.on("return-product-tracking-join", function (data) {
  listingData = data

  handleDuplicates()
  searchOrFilterData()
  toastr.clear()
  toastr.success('Data Updated')

  let temp
  let tempData = []

  for (let i = 0; i < data.length; i++) {
    temp = new Object()
    temp['listing_id'] = data[i].listing_id
    temp['title'] = data[i].title
    temp['url'] = data[i].url
    temp['img_url'] = data[i].img_url
    temp['img_url_original'] = data[i].img_url_original
    temp['views'] = data[i].views
    temp['num_favorers'] = data[i].num_favorers
    temp['price'] = data[i].price
    temp['quantity'] = data[i].quantity
    temp['original_creation_tsz'] = data[i].original_creation_tsz
    temp['is_digital'] = data[i].is_digital
    temp['percent_favor'] = data[i].percent_favor
    tempData[i] = temp
  }

  window.localStorage.setItem('listing-data', JSON.stringify(tempData))
})

function handleDuplicates() {
  let dataDupPos = new Object
  let dataDupById

  for (let i = 0; i < listingData.length; i++) {
    dataDupPos[`${listingData[i].listing_id}`] += i + ','
  }

  dataDupById = Object.keys(dataDupPos)
  for (let i = 0; i < dataDupById.length; i++) {
    dataDupPos[`${dataDupById[i]}`] = dataDupPos[`${dataDupById[i]}`].replace(/undefined/g, '')
  }
  console.log(dataDupPos)
  console.log(dataDupById)

  let newData = []
  let temp
  for (let i = 0; i < dataDupById.length; i++) {
    let arrPos = dataDupPos[dataDupById[i]].split(',')
    let lastPos = arrPos[arrPos.length - 2]
    // console.log('arrPos'+dataDupById[i])
    // console.log('arrPos'+arrPos)
    // console.log('lastPos'+lastPos)
    temp = new Object()
    temp['listing_id'] = listingData[lastPos].listing_id
    temp['title'] = listingData[lastPos].title
    temp['url'] = listingData[lastPos].url
    temp['img_url'] = listingData[lastPos].img_url
    temp['img_url_original'] = listingData[lastPos].img_url_original
    temp['views'] = listingData[lastPos].views
    temp['num_favorers'] = listingData[lastPos].num_favorers
    temp['price'] = listingData[lastPos].price
    temp['quantity'] = listingData[lastPos].quantity
    temp['original_creation_tsz'] = listingData[lastPos].original_creation_tsz
    temp['is_digital'] = listingData[lastPos].is_digital
    temp['percent_favor'] = listingData[lastPos].percent_favor
    temp['sales_day'] = 0
    if(arrPos.length > 2){
      let numDays = (listingData[lastPos].original_creation_tsz - listingData[arrPos[0]].original_creation_tsz)/86400
      // console.log('numDays'+numDays)
      if(numDays > 1){
        let totalCount 
        for (let j = 0; j < arrPos.length; j++) {
          totalCount = listingData[lastPos].quantity - listingData[arrPos[0]].quantity
        }
        temp['sales_day'] = Math.floor(totalCount/numDays)
      }
    }
    // console.log('temp'+temp)
    newData.push(temp)
  }
  listingData = newData
  console.log(listingData)
}

/* ------------------------------------------------END SOCKET SECTION------------------------------------------------ */

/* ------------------------------------------------ADDITIONAL SECTION------------------------------------------------ */

// $('.grid-view-listing').on('click', async function () {
//   if (isGridView) {
//     isGridView = false
//     $('.grid-view-listing').html('<i class="fas fa-list-ul"></i>')

//   } else {
//     isGridView = true
//     $('.grid-view-listing').html('<i class="fas fa-th"></i>')
//   }
// })

function scrollToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

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

function compareSaleDay(a, b) {
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

// function isDigital(data) {
//   if (data.is_digital == true || data.title.toLowerCase().includes('digital')) {
//     return true
//   } return false
// }

function updatePaginationBtn(data) {
  if (pagEnd == data.length) {
    $('#next-pagination').css('pointer-events', 'none')
    $('#last-pagination').css('pointer-events', 'none')
    $('#next-pagination').css('color', 'lightgray')
    $('#last-pagination').css('color', 'lightgray')
  } else {
    $('#next-pagination').css('pointer-events', 'auto')
    $('#last-pagination').css('pointer-events', 'auto')
    $('#next-pagination').css('color', 'black')
    $('#last-pagination').css('color', 'black')
  }
  if (pagStart == 0) {
    $('#back-pagination').css('pointer-events', 'none')
    $('#first-pagination').css('pointer-events', 'none')
    $('#back-pagination').css('color', 'lightgray')
    $('#first-pagination').css('color', 'lightgray')
  } else {
    $('#back-pagination').css('pointer-events', 'auto')
    $('#first-pagination').css('pointer-events', 'auto')
    $('#back-pagination').css('color', 'black')
    $('#first-pagination').css('color', 'black')
  }
}

/* ------------------------------------------------END ADDITIONAL SECTION------------------------------------------------ */

/* ------------------------------------------------FILTER SECTION------------------------------------------------ */

// function filterByType(data, isDigit = false) {
//   let filterData = []
//   for (var i = 0; i < data.length; i++) {
//     if (isDigital(data[i]) == isDigit) {
//       filterData.push(data[i])
//     }
//   }
//   return filterData
// }

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

function filterByCustomDate(data) {
  let filterData = []
  let dateRange = $('#filter-listing-creation-date').text().split(' to ')

  let dateFrom = new Date(dateRange[0]).getTime()
  let dateTo = new Date(dateRange[1]).getTime()

  for (let i = 0; i < data.length; i++) {
    if (data[i].original_creation_tsz >= Math.floor(dateFrom / 1000) && data[i].original_creation_tsz <= Math.floor(dateTo / 1000)) {
      filterData.push(data[i])
    }
  }

  return filterData
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

/* ------------------------------------------------END FILTER SECTION------------------------------------------------ */

