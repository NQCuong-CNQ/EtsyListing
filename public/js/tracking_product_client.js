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

$('#custom-filter-listing-creation-date').on('click', async function () {
  filterByDateOption = 'custom'
})

$('#custom-filter-listing-creation-date').daterangepicker({
  "showDropdowns": true,
  "minYear": 2010,
  "maxYear": 2023,
  "startDate": "12/21/2020",
  "opens": "center"
}, function (start, end, label) {
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

function updateData(dataFilter = listingData) {
  $('#product-search-list').empty()
  if (dataFilter == 1) {
    $('#loading').css('display', 'none')
    return
  }

  let count
  if (dataFilter.length > 100) {
    count = 100
  } else { count = dataFilter.length }

  for (var i = 0; i < count; i++) {
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

