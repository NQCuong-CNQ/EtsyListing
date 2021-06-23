var socket = io.connect("https://giftsvk.com", {
  port: 443,
  reconnect: true,
  transports: ['websocket']
})

var listingData = dataFilter = dataOriginal = [], filterByDateOption = 14,
  isSearch = false, sortOption = 5, pagLenght = 30, pagStart = 0,
  isGridView = isGettingData = true, pagEnd = pagLenght, chart

var dataSelect = [
  {
    id: "Father's Day",
    text: "Father's Day"
  },
  {
    id: "Pride Month",
    text: "Pride Month"
  },
  {
    id: "Independence Day",
    text: "Independence Day"
  },
  {
    id: "Canvas",
    text: "Canvas"
  },
  {
    id: "Art Print",
    text: "Art Print"
  },
  {
    id: "Shirt",
    text: "Shirt"
  },
  {
    id: "Mug",
    text: "Mug"
  },
  {
    id: "Blanket",
    text: "Blanket"
  },
  {
    id: "Mother's Day",
    text: "Mother's Day"
  },
  {
    id: "Valentine's Day",
    text: "Valentine's Day"
  },
  {
    id: "Patrick's Day",
    text: "Patrick's Day"
  },
  {
    id: "Wedding's Day",
    text: "Wedding's Day"
  },
  {
    id: "New Year's Day",
    text: "New Year's Day"
  },
  {
    id: "Memorial Day",
    text: "Memorial Day"
  },
  {
    id: "Thanksgiving",
    text: "Thanksgiving"
  },
  {
    id: "Christmas",
    text: "Christmas"
  },
  {
    id: "Halloween",
    text: "Halloween"
  },
  {
    id: "Personalize",
    text: "Personalize"
  }
]
/* ------------------------------------------------MAIN SECTION------------------------------------------------ */

IsJsonString = str => {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}
// $('#pod-filter-listing').on('click', ()=>{
//   filterByTypeOption = 0
//   searchOrFilterData()
//   $('#filter-listing-type').text('POD')
// })

// $('#digital-filter-listing').on('click', ()=>{
//   filterByTypeOption = 1
//   searchOrFilterData()
//   $('#filter-listing-type').text('Digital')
// })

$('#all-filter-listing-creation-date').on('click', () => {
  filterByDateOption = 0
  searchOrFilterData()
  $('#filter-listing-creation-date').text('All')
})

$('#1d-filter-listing-creation-date').on('click', () => {
  filterByDateOption = 1
  searchOrFilterData()
  $('#filter-listing-creation-date').text('Last 1 day')
})

$('#3d-filter-listing-creation-date').on('click', () => {
  filterByDateOption = 3
  searchOrFilterData()
  $('#filter-listing-creation-date').text('Last 3 days')
})

$('#7d-filter-listing-creation-date').on('click', () => {
  filterByDateOption = 7
  searchOrFilterData()
  $('#filter-listing-creation-date').text('Last 7 days')
})

$('#14d-filter-listing-creation-date').on('click', () => {
  filterByDateOption = 14
  searchOrFilterData()
  $('#filter-listing-creation-date').text('Last 14 days')
})

$('#show-15-entries-listing').on('click', () => {
  pagLenght = 15
  pagStart = 0
  pagEnd = pagLenght
  searchOrFilterData()
  $('#show-entries-listing').text('15')
})

$('#show-30-entries-listing').on('click', () => {
  pagLenght = 30
  pagStart = 0
  pagEnd = pagLenght
  searchOrFilterData()
  $('#show-entries-listing').text('30')
})

$('#show-50-entries-listing').on('click', () => {
  pagLenght = 50
  pagStart = 0
  pagEnd = pagLenght
  searchOrFilterData()
  $('#show-entries-listing').text('50')
})

$('#show-100-entries-listing').on('click', () => {
  pagLenght = 100
  pagStart = 0
  pagEnd = pagLenght
  searchOrFilterData()
  $('#show-entries-listing').text('100')
})

// $('#custom-filter-listing-creation-date').daterangepicker({
//   "showDropdowns": true,
//   "minYear": 2010,
//   "maxYear": 2023,
//   "startDate": "12/21/2020",
//   "opens": "center"
// }, function (start, end, label) {
//   filterByDateOption = 'custom'
//   $('#filter-listing-creation-date').text(start.format('MM-DD-YYYY') + ' to ' + end.format('MM-DD-YYYY'))
//   searchOrFilterData()
// })

$('#sort-by-view-listing').on('click', () => {
  sortOption = 1
  searchOrFilterData()
  $('#sort-by-listing').text('Views')
})

$('#sort-by-favorite-listing').on('click', () => {
  sortOption = 2
  searchOrFilterData()
  $('#sort-by-listing').text('Favorites')
})

$('#sort-by-day-listing').on('click', () => {
  sortOption = 3
  searchOrFilterData()
  $('#sort-by-listing').text('Days')
})

$('#sort-by-percent-favorite-listing').on('click', () => {
  sortOption = 4
  searchOrFilterData()
  $('#sort-by-listing').text('% Favorites')
})

$('#sort-by-sale-day-listing').on('click', () => {
  sortOption = 5
  searchOrFilterData()
  $('#sort-by-listing').text('Sales/day')
})

$('#find-product-by-keyword-button').on('click', () => {
  isSearch = true
  searchOrFilterData()
})

compareViews = (a, b) => {
  const bandA = a.views
  const bandB = b.views
  return compareAction(bandA, bandB)
}

compareFavorites = (a, b) => {
  const bandA = a.num_favorers
  const bandB = b.num_favorers
  return compareAction(bandA, bandB)
}

compareDay = (a, b) => {
  const bandA = a.original_creation_tsz
  const bandB = b.original_creation_tsz
  return compareAction(bandA, bandB)
}

comparePercentFavorites = (a, b) => {
  const bandA = a.percent_favor
  const bandB = b.percent_favor
  return compareAction(bandA, bandB)
}

compareSaleDay = (a, b) => {
  const bandA = a.sales_day
  const bandB = b.sales_day
  return compareAction(bandA, bandB)
}

compareAction = (bandA, bandB) => {
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

getDayTimeLife = creation_time => {
  let timeNow = new Date().getTime()
  let life_time = Math.floor(timeNow / 1000) - creation_time
  return life_time / 86400
}

convertMonthInString = month => {
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

getEpochTime = input => {
  var date = new Date(0)
  date.setUTCSeconds(input)
  time = String(date)
  time = time.split(' ')
  time = time[2] + '/' + convertMonthInString(time[1])
  return time
}

formatForSearch = string => {
  string = string.replace(/[^0-9a-zA-Z ]/g, '').replace(/s /g, ' ').toLowerCase()
  return string
}

getSearchLevel = keyword => {
  let searchData = []
  searchData['level1'] = []
  searchData['level2'] = []
  searchData['level3'] = []

  let level1 = ["Father's Day", "Pride Month", "Independence Day", "Mother's Day", "Valentine's Day", "Patrick's Day", "Wedding's Day", "New Year's Day",
    "Memorial Day", "Thanksgiving", "Christmas", "Presidents' Day", "Easter", "Halloween"]
  let level2 = ["Canvas", "Art Print", "Mug", "Shirt", "Blanket", "Tumbler"]
  let level3 = ["Personalize"]

  for (let item of keyword){
    if (level1.includes(item)) {
      searchData['level1'].push(formatForSearch(item))
    } else if (level2.includes(item)) {
      searchData['level2'].push(formatForSearch(item))
    } else if (level3.includes(item)) {
      searchData['level3'].push(formatForSearch(item))
    }
  }
  // for (let i = 0; i < keyword.length; i++) {
  //   if (level1.includes(keyword[i])) {
  //     searchData['level1'].push(formatForSearch(keyword[i]))
  //   } else if (level2.includes(keyword[i])) {
  //     searchData['level2'].push(formatForSearch(keyword[i]))
  //   } else if (level3.includes(keyword[i])) {
  //     searchData['level3'].push(formatForSearch(keyword[i]))
  //   }
  // }
  return searchData
}

searchByLevel = (key, data) => {
  let searchData = []
  for (let item of data){
    for (let itemKey of key){
      if (formatForSearch(item.title).indexOf(itemKey) != -1) {
        searchData.push(item)
      }
    }
  }
  // for (let i = 0; i < data.length; i++) {
  //   for (let j = 0; j < key.length; j++) {
  //     if (formatForSearch(data[i].title).indexOf(key[j]) != -1) {
  //       searchData.push(data[i])
  //     }
  //   }
  // }
  return searchData
}

searchByLevelCate = (key, data) => {
  let searchData = []

  for (let item of data){
    for (let itemKey of key){
      if (formatForSearch(item.title).indexOf(itemKey) != -1) {
        searchData.push(item)
      }
      else if (formatForSearch(item.taxonomy_path[item.taxonomy_path.length - 1]).indexOf(itemKey) != -1) {
        searchData.push(item)
      }
    }
  }

  // for (let i = 0; i < data.length; i++) {
  //   for (let j = 0; j < key.length; j++) {
  //     if (formatForSearch(data[i].title).indexOf(key[j]) != -1) {
  //       searchData.push(data[i])
  //     }
  //     else if (formatForSearch(data[i].taxonomy_path[data[i].taxonomy_path.length - 1]).indexOf(key[j]) != -1) {
  //       searchData.push(data[i])
  //     }
  //   }
  // }
  return searchData
}

searchByKeyword = (keyword, data) => {
  let dataSearch = data
  let searchKeyData = getSearchLevel(keyword)

  if (searchKeyData['level1'].length > 0) {
    dataSearch = searchByLevel(searchKeyData['level1'], dataSearch)
  }
  if (searchKeyData['level2'].length > 0) {
    dataSearch = searchByLevelCate(searchKeyData['level2'], dataSearch)
  }
  if (searchKeyData['level3'].length > 0) {
    dataSearch = searchByLevel(searchKeyData['level3'], dataSearch)
  }

  return dataSearch
}

filterByDate = (data, days) => {
  let filterData = []
  for (let item of data){
    if (getDayTimeLife(item.original_creation_tsz) <= days) {
      filterData.push(item)
    }
  }
  // for (let i = 0; i < data.length; i++) {
  //   if (getDayTimeLife(data[i].original_creation_tsz) <= days) {
  //     filterData.push(data[i])
  //   }
  // }
  return filterData
}

searchOrFilterData = () => {
  $('#loading').css('display', 'block')
  dataFilter = listingData

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
    dataFilter.sort(compareDay)
  } else if (sortOption == 4) {
    dataFilter.sort(comparePercentFavorites)
  } else if (sortOption == 5) {
    dataFilter.sort(compareSaleDay)
  }

  if (filterByDateOption == 'custom') {
    // dataFilter = filterByCustomDate(dataFilter)
  } else if (filterByDateOption == 0) {
  } else {
    dataFilter = filterByDate(dataFilter, filterByDateOption)
  }

  let keyword = $('#find-product-by-keyword').val()
  if (keyword == '') {
    isSearch = false
  }

  if (isSearch) {
    dataFilter = searchByKeyword(keyword, dataFilter)
  }

  if (dataFilter.length == 0) {
    dataFilter = 1
  }

  updateData(dataFilter)
}

updatePaginationBtn = data => {
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

$('#first-pagination').on('click', () => {
  pagStart = 0
  pagEnd = pagLenght
  updateData(dataFilter)
})

$('#last-pagination').on('click', () => {
  pagStart = Math.floor(dataFilter.length / pagLenght) * pagLenght
  pagEnd = dataFilter.length
  updateData(dataFilter)
})

$('#next-pagination').on('click', () => {
  pagStart += pagLenght
  pagEnd += pagLenght
  if (pagEnd > Math.floor(dataFilter.length / pagLenght) * pagLenght) {
    pagEnd = dataFilter.length
  }
  updateData(dataFilter)
})

$('#back-pagination').on('click', () => {
  pagStart -= pagLenght
  pagEnd = pagStart + pagLenght
  if (pagStart < 0) {
    pagStart = 0
    pagEnd = pagLenght
  }
  updateData(dataFilter)
})

scrollToTop = () => {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

updateData = (dataFilter = listingData) => {
  $('#product-list').empty()
  if (dataFilter == 1) {
    $('#loading').css('display', 'none')
    return
  }

  if (dataFilter.length < pagLenght) {
    pagEnd = dataFilter.length
  } else {
    if (pagEnd < pagLenght) {
      pagEnd = pagLenght
    }
  }
  updatePaginationBtn(dataFilter)

  $('#number-entries').text('Showing ' + pagStart + ' - ' + pagEnd + ' of ' + dataFilter.length + ' listing')
  $('#pagination-number').text(pagStart / pagLenght + 1)

  for (let i = pagStart; i < pagEnd; i++) {
    $('#product-list').append(`
        <div class="list-product-search-container">
          <div class="product-img-container">
              <div class="hover-product-container">
                  <a href="${dataFilter[i].img_url_original}" target="_blank"><button id="img-product-btn"><i class="fas fa-image"></i></button></a>
                  <button onclick="showAnalytic(dataFilter[${i}].listing_id)" id="analytic-product-btn"><i class="fas fa-chart-bar"></i></button>
              </div>
              <img src="${dataFilter[i].img_url}" alt="" width="100%" loading='lazy'>
          </div>
          
          <a class="mt-2" href="${dataFilter[i].url}" target="_blank">${dataFilter[i].title}</a>
          <div class="row pl-3 pr-2">
              <p class="col-4 p-0"><i class="fas fa-eye mr-1"></i>${dataFilter[i].views}</p>
              <p class="col-4 p-0"><i class="fas fa-heart mr-1"></i>${dataFilter[i].num_favorers}</p>
              <p class="col-4 p-0"><i class="fas fa-heartbeat mr-1"></i>${dataFilter[i].percent_favor}%</p>
          </div>  
          <div class="row pl-3 pr-2">
            <p class="col-4 p-0"><i class="fas fa-cart-plus mr-1"></i>${dataFilter[i].sales_day}</p>
            <p class="col-4 p-0"><i class="fas fa-calendar-alt mr-1"></i>${getEpochTime(dataFilter[i].original_creation_tsz)}</p>
          </div>
      </div>
    `)
  }

  $('#loading').css('display', 'none')
  scrollToTop()
}

let listingLocalData = window.localStorage.getItem('listing-data')
if (listingLocalData != null && IsJsonString(listingLocalData)) {
  listingData = JSON.parse(listingLocalData)

  searchOrFilterData()
  toastr.clear()
  toastr.info('Updating data...')
} else {
  $('#loading').css('display', 'block')
}

socket.emit("product-tracking-join")

socket.on("updating", () => {
  toastr.clear()
  toastr.warning('Data Server is updating, comeback later for updated products!')
})

handleDuplicates = () => {
  let dataDupPos = new Object
  let dataDupById, temp

  // for (let item of listingData){
  //   dataDupPos[`${item.listing_id}`] = ''
  // }

  for (let i = 0; i < listingData.length; i++) {
    dataDupPos[`${listingData[i].listing_id}`] = ''
  }

  // for (let item of listingData){
  //   dataDupPos[`${item.listing_id}`] += i + ','
  // }

  for (let i = 0; i < listingData.length; i++) {
    dataDupPos[`${listingData[i].listing_id}`] += i + ','
  }

  dataDupById = Object.keys(dataDupPos)
  let newData = []

  for (let i = 0; i < dataDupById.length; i++) {
    let arrPos = dataDupPos[dataDupById[i]].slice(0, -1).split(',')
    let lastPos = arrPos[arrPos.length - 1]

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
    temp['taxonomy_path'] = listingData[lastPos].taxonomy_path
    temp['is_digital'] = listingData[lastPos].is_digital
    temp['percent_favor'] = listingData[lastPos].percent_favor
    temp['sales_day'] = 0

    //caculate sales fer day
    if (arrPos.length > 1) {
      let numDays, totalCount, diff = 0

      for (let j = 0; j < arrPos.length - 1; j++) {
        if (listingData[arrPos[j]].date_update != listingData[arrPos[j + 1]].date_update) {
          diff = listingData[arrPos[j]].quantity - listingData[arrPos[j + 1]].quantity
          if (diff > 100 && (1 - listingData[arrPos[j + 1]].quantity / listingData[arrPos[j]].quantity > 0.5)) {

          }
          else if (diff >= 0 && diff < 2000) {
            numDays += listingData[arrPos[j + 1]].date_update - listingData[arrPos[j]].date_update
            totalCount += diff
          }
        }
      }
      if (totalCount > 0) {
        temp['sales_day'] = (totalCount / numDays).toFixed(2)
      }
    }
    newData.push(temp)
  }
  listingData = newData

  // handle for saving data to local
  let tempForSave, tempDataForSave = []

  for (let i = 0; i < listingData.length; i++) {
    if (i > 4000) {
      break
    }

    tempForSave = new Object()
    tempForSave['listing_id'] = listingData[i].listing_id
    tempForSave['title'] = listingData[i].title
    tempForSave['url'] = listingData[i].url
    tempForSave['img_url'] = listingData[i].img_url
    tempForSave['img_url_original'] = listingData[i].img_url_original
    tempForSave['views'] = listingData[i].views
    tempForSave['num_favorers'] = listingData[i].num_favorers
    tempForSave['price'] = listingData[i].price
    tempForSave['quantity'] = listingData[i].quantity
    tempForSave['original_creation_tsz'] = listingData[i].original_creation_tsz
    tempForSave['taxonomy_path'] = listingData[i].taxonomy_path
    tempForSave['is_digital'] = listingData[i].is_digital
    tempForSave['percent_favor'] = listingData[i].percent_favor
    tempForSave['date_update'] = listingData[i].date_update
    tempForSave['sales_day'] = listingData[i].sales_day

    tempDataForSave[i] = tempForSave
  }

  try {
    window.localStorage.setItem('listing-data', JSON.stringify(tempDataForSave))
  } catch (err) {
    console.log(err)
  }
}

socket.on("return-product-tracking-join", data => {
  listingData = dataOriginal = data
  handleDuplicates()
  searchOrFilterData()
  toastr.clear()
  toastr.success('Data Updated')
  isGettingData = false
})

// $("body").on('click', e=>{
//   if (e.target.className != "popup-analytic-container") {
//     $(".popup-analytic-container").css('display', 'none')
//   }
// })

showAnalytic = id => {
  if (isGettingData) {
    toastr.clear()
    toastr.warning('Please wait until data is updated!', { timeOut: 0 })
  } else {
    $('.popup-analytic-container').css('display', 'block')
    $('.popup-analytic-background').css('display', 'block')
    let tempData = []
    for(let item of dataOriginal){
      if (item.listing_id == id) {
        tempData.push(item)
      }
    }
    // for (let i = 0; i < dataOriginal.length; i++) {
    //   if (dataOriginal[i].listing_id == id) {
    //     tempData.push(dataOriginal[i])
    //   }
    // }

    var ctx = document.getElementById("chart-analytic-product").getContext("2d")
    var gradientblue = ctx.createLinearGradient(0, 0, 0, 225)
    gradientblue.addColorStop(0, "rgba(6,91,249,0.3)")
    gradientblue.addColorStop(1, "rgba(6,91,249, 0)")
    var gradientred = ctx.createLinearGradient(0, 0, 0, 225)
    gradientred.addColorStop(0, "rgba(255,0,40,0.3)")
    gradientred.addColorStop(1, "rgba(255,0,40, 0)")
    var gradientgreen = ctx.createLinearGradient(0, 0, 0, 225)
    gradientgreen.addColorStop(0, "rgba(47,208,87,0.3)")
    gradientgreen.addColorStop(1, "rgba(47,208,87, 0)")

    let label = [], quantity = [], num_favorers = [], views = []

    for (let i = 0; i < tempData.length - 1; i++) {
      if (tempData[i].date_update != tempData[i + 1].date_update) {
        label.push(getEpochTime(tempData[i].date_update * 86400))
        quantity.push(tempData[i].quantity)
        num_favorers.push(tempData[i].num_favorers)
        views.push(tempData[i].views)
      }
    }

    label.push(getEpochTime(tempData[tempData.length - 1].date_update * 86400))
    quantity.push(tempData[tempData.length - 1].quantity)
    num_favorers.push(tempData[tempData.length - 1].num_favorers)
    views.push(tempData[tempData.length - 1].views)

    chart = new Chart(document.getElementById("chart-analytic-product"), {
      type: "line",
      data: {
        labels: label,
        datasets: [{
          label: "Quantity",
          fill: true,
          backgroundColor: gradientblue,
          borderColor: window.theme.primary,
          data: quantity,
        }, {
          label: "Num Favorers",
          fill: true,
          backgroundColor: gradientred,
          borderColor: 'red',
          data: num_favorers,
        }, {
          label: "Views",
          fill: true,
          backgroundColor: gradientgreen,
          borderColor: 'green',
          data: views,
        }]
      },
      options: {
        maintainAspectRatio: false,
        legend: {
          display: true
        },
        tooltips: {
          intersect: false
        },
        hover: {
          intersect: true
        },
        plugins: {
          filler: {
            propagate: false
          }
        },
        scales: {
          xAxes: [{
            reverse: true,
            gridLines: {
              color: "rgba(0,0,0,0.0)"
            }
          }],
          yAxes: [{
            ticks: {
              stepSize: 1000
            },
            display: true,
            borderDash: [3, 3],
            gridLines: {
              color: "rgba(0,0,0,0.0)"
            }
          }]
        }
      }
    })
  }
}

$('#btn-close-chart').on('click', () => {
  $('.popup-analytic-container').css('display', 'none')
  $('.popup-analytic-background').css('display', 'none')
  chart.destroy()
})

$('.popup-analytic-background').on('click', () => {
  $('.popup-analytic-container').css('display', 'none')
  $('.popup-analytic-background').css('display', 'none')
  chart.destroy()
})

$('#find-product-by-keyword').on('keypress', e => {
  if (e.key == 'Enter') {
    $('#find-product-by-keyword-button').trigger('click')
  }
})

$('#find-product-by-keyword').select2({
  placeholder: "Keyword",
  data: dataSelect,
})

$('#find-product-by-keyword').on('change', e => {
  $('.select2-results__option--selected').on('unbind')
})

// function isDigital(data) {
//   if (data.is_digital == true || data.title.toLowerCase().includes('digital')) {
//     return true
//   } return false
// }

// function filterByType(data, isDigit = false) {
//   let filterData = []
//   for (let i = 0; i < data.length; i++) {
//     if (isDigital(data[i]) == isDigit) {
//       filterData.push(data[i])
//     }
//   }
//   return filterData
// }

// function filterByCustomDate(data) {
//   let filterData = []
//   let dateRange = $('#filter-listing-creation-date').text().split(' to ')

//   let dateFrom = new Date(dateRange[0]).getTime()
//   let dateTo = new Date(dateRange[1]).getTime()

//   for (let i = 0; i < data.length; i++) {
//     if (data[i].original_creation_tsz >= Math.floor(dateFrom / 1000) && data[i].original_creation_tsz <= Math.floor(dateTo / 1000)) {
//       filterData.push(data[i])
//     }
//   }

//   return filterData
// }