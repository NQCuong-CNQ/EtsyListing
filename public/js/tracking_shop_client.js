var socket = io.connect("https://giftsvk.com:443", {
  port: 443,
  reconnect: true
})
// var socket = io.connect("http://localhost:80")
var shopData
var category = 'Canvas'
var shopCategory
var timeCreatedShopFilter = 0
var filterType = 0

/* ------------------------------------------------MAIN SECTION------------------------------------------------ */
$('#tracking-analysis-option-button').on('click', async function () {
  alert("Đang được phát triển!\nChức năng ghi lại toàn bộ số lượng listing theo ngày, vẽ biểu đồ và phân tích")
})

$('#pod-type-product-filter').on('click', async function () {
  filterType = 0
  $('#dropdown-filter-type-product').text('POD')
  searchOrFilterData()
})

$('#digital-type-product-filter').on('click', async function () {
  filterType = 1
  $('#dropdown-filter-type-product').text('Digital')
  searchOrFilterData()
})

$('#find-shop-by-name-button').on('click', async function () {
  let shopName = $('#find-shop-by-name').val().trim()
  if (shopName == '') {
    searchOrFilterData()
    return
  }

  let shop = searchLocalShop(shopName)
  if(shop == 0) {
    $('#loading').css('display', 'block')
    await socket.emit("find-shop-by-name", shopName)
  } else {
    updateData(shop)
  }
})

function searchLocalShop(shopName){
  let shop = []
  for (let i = 0; i < shopData.length; i++) {
    if(shopData[i].shop_name.includes(shopName)){
      shop.push(shopData[i])
    }
  } return shop
}

function searchOrFilterData() {
  let dataFilter = shopData

  if (filterType == 0) {
    dataFilter = getTypeProduct(dataFilter)
  } else if (filterType == 1) {
    dataFilter = getTypeProduct(dataFilter, true)
  }

  if (category == 'Canvas') {
    dataFilter = getCategoryProduct(dataFilter)
  } else if (category == 'Mug') {
    dataFilter = getCategoryProduct(dataFilter)
  } else if (category == 'Shirt') {
    dataFilter = getCategoryProduct(dataFilter)
  } else if (category == 'Blanket') {
    dataFilter = getCategoryProduct(dataFilter)
  } else if (category == 'Tumbler') {
    dataFilter = getCategoryProduct(dataFilter)
  } else if (category == 'All') {
  }

  if (timeCreatedShopFilter == 'custom') {
    dataFilter = timeCreatedShopFilterCustom(dataFilter)
  } else if (timeCreatedShopFilter > 0) {
    dataFilter = timeCreatedShopFilterAction(dataFilter)
  }

  updateData(dataFilter)
}

function timeCreatedShopFilterCustom(data){
  let filterData = []
  let dateRange = $('#dropdown-filter-shop-time-created').text().split(' to ')

  let dateFrom = new Date(dateRange[0]).getTime()
  let dateTo = new Date(dateRange[1]).getTime()

  for (let i = 0; i < data.length; i++) {
    if (data[i].creation_tsz >= Math.floor(dateFrom / 1000) && data[i].creation_tsz <= Math.floor(dateTo / 1000)) {
      filterData.push(data[i])
    }
  }

  return filterData
}

function getCategoryProduct(dataFilter) {
  $('#dropdown-filter-shop').text(category)

  let filterData = []
  let listShopName = []
  for (let i = 0; i < shopCategory.length; i++) {
    if (shopCategory[i].category.includes(category)) {
      listShopName.push(shopCategory[i].shop_name)
    }
  }

  for (let index = 0; index < listShopName.length; index++) {
    for (let j = 0; j < dataFilter.length; j++) {
      if (listShopName[index] == dataFilter[j].shop_name) {
        filterData.push(dataFilter[j])
      }
    }
  }
  return filterData
}

function getTypeProduct(dataFilter, isDigit = false) {
  let filterData = []
  for (let i = 0; i < dataFilter.length; i++) {
    if (isDigitShop(dataFilter[i]) == isDigit) {
      filterData.push(dataFilter[i])
    }
  }
  return filterData
}

function isDigitShop(data) {
  if (data.digital_listing_count > (data.listing_active_count / 10)) {
    return true
  } return false
}

function updateData(data = shopData) {
  $('#table-shop').DataTable().clear().destroy()
  for (var i = 0; i < data.length; i++) {
    $('#table-shop-body').append(`<tr>
        <td onclick="getShopDetail(${i})"><i class="fas fa-info-circle pointer"></i></td>
        <td>
          <a href='${data[i].url}' target="_blank">${data[i].shop_name}
            <div> 
              <img src="${data[i].imgs_listing[0]}" alt="Empty" width="70px" height="70px">
              <img src="${data[i].imgs_listing[1]}" alt="Empty" width="70px" height="70px">
              <img src="${data[i].imgs_listing[2]}" alt="Empty" width="70px" height="70px">
              <img src="${data[i].imgs_listing[3]}" alt="Empty" width="70px" height="70px">
            </div>
            <div class="mt-1">
              <img src="${data[i].imgs_listing[4]}" alt="Empty" width="70px" height="70px">
              <img src="${data[i].imgs_listing[5]}" alt="Empty" width="70px" height="70px">
              <img src="${data[i].imgs_listing[6]}" alt="Empty" width="70px" height="70px">
              <img src="${data[i].imgs_listing[7]}" alt="Empty" width="70px" height="70px">
            </div>
          </a>
        </td>
        <td>${getAvgSales(data[i].total_sales, data[i].creation_tsz)}</td>
        <td>${data[i].total_sales.toLocaleString()}</td>
        <td>${data[i].num_favorers.toLocaleString()}</td>
        <td>${getEpochTime(data[i].creation_tsz)}</td>
        <td>${data[i].currency_code}</td>
        <td>${data[i].listing_active_count.toLocaleString()}</td>
        <td>${data[i].digital_listing_count.toLocaleString()}</td>
        <td>${data[i].languages}</td>
        <td>${data[i].shop_id}</td>
    </tr>`)
  }

  $('#table-shop').DataTable({
    pageLength: 10,
    order: [[2, "desc"]],
    searching: false,
  })
}

async function getShopDetail(i) {
  await socket.emit("shop-tracking", shopData[i].shop_id)
  $('#loading').css('display', 'block')
  $('#title-page').text('Shop Detail')

  $('#option-shop-section').css("display", "block")
  $('#list-shop-section').css("display", "none")
  $('#listing-shop-section').css("display", "none")
  $('#user-shop-section').css("display", "none")

  $('#shop-id-option-section').text(shopData[i].shop_id)
  $('#shop-name-option-section').text('Shop name: ' + shopData[i].shop_name)
  $('#shop-title-option-section').text(shopData[i].title)
  $('#shop-url-option-section').text(shopData[i].url)
  $('#shop-announcement-option-section').text(shopData[i].announcement)
  $('#shop-creation-time-option-section').text(getEpochTime(shopData[i].creation_tsz))
  $('#shop-currency_code-option-section').text(shopData[i].currency_code)
  $('#shop-digital_listing_count-option-section').text(shopData[i].digital_listing_count.toLocaleString())
  $('#shop-is_vacation-option-section').text(shopData[i].is_vacation)
  $('#shop-last_updated_tsz-option-section').text(getEpochTime(shopData[i].last_updated_tsz))
  $('#shop-listing_active_count-option-section').text(shopData[i].listing_active_count.toLocaleString())
  $('#shop-num_favorers-option-section').text(shopData[i].num_favorers.toLocaleString())
  $('#shop-policy_payment-option-section').text(shopData[i].policy_payment)
  $('#shop-policy_refunds-option-section').text(shopData[i].policy_refunds)
  $('#shop-policy_shipping-option-section').text(shopData[i].policy_shipping)
  $('#shop-sale_message-option-section').text(shopData[i].sale_message)
  $('#shop-policy_additional-option-section').text(shopData[i].policy_additional)
  $('#shop-user_id-option-section').text(shopData[i].user_id)

  $('#listing-option-button').on('click', async function () {
    await getListingOption(i)
  })
  $('#user-option-button').on('click', async function () {
    await getUserOption(i)
  })
}

async function getListingOption(i) {
  await socket.emit("get_listing_shop_id", shopData[i].shop_id)
  $('#loading').css('display', 'block')
  $('#title-page').text('Listing Detail')

  $('#option-shop-section').css("display", "none")
  $('#list-shop-section').css("display", "none")
  $('#listing-shop-section').css("display", "block")
  $('#user-shop-section').css("display", "none")
}

async function getUserOption(i) {
  await socket.emit("get_user_by_user_id", shopData[i].user_id)
  $('#loading').css('display', 'block')
  $('#title-page').text('User Detail')

  $('#option-shop-section').css("display", "none")
  $('#list-shop-section').css("display", "none")
  $('#listing-shop-section').css("display", "none")
  $('#user-shop-section').css("display", "block")
}
/* ------------------------------------------------END MAIN SECTION------------------------------------------------ */

/* ------------------------------------------------SOCKET SECTION------------------------------------------------ */

let shopLocalData = window.localStorage.getItem('listing-shop')
let categoryLocalData = window.localStorage.getItem('listing-shop-category')

if(categoryLocalData != null){ 
  shopCategory = JSON.parse(categoryLocalData)

  if(shopLocalData != null){
    toastr.info('Load old data from local storage') 
    shopData = JSON.parse(shopLocalData)
    
    searchOrFilterData()
    toastr.info('Updating data...')
  } else {
    $('#loading').css('display', 'block')
  }
} else {
  $('#loading').css('display', 'block')
}

socket.emit("join")

socket.on("updating", function (data) {
  alert('Data Server is updating, please come back later!')
  $('#getting-data-loading').text('Data Server is updating, please come back later!')
})

socket.on("dataTransfer", async function (data) {
  shopData = data
  $('#loading').css('display', 'none')
  searchOrFilterData()

  let temp
  let tempData = []
  
  for(let i = 0; i < data.length; i++){
    temp = new Object()
    temp['shop_name'] = data[i].shop_name
    temp['imgs_listing'] = data[i].imgs_listing
    temp['total_sales'] = data[i].total_sales
    temp['creation_tsz'] = data[i].creation_tsz
    temp['currency_code'] = data[i].currency_code
    temp['digital_listing_count'] = data[i].digital_listing_count
    temp['listing_active_count'] = data[i].listing_active_count
    temp['num_favorers'] = data[i].num_favorers
    temp['shop_id'] = data[i].shop_id
    temp['languages'] = data[i].languages
    tempData[i]=temp
  }

  toastr.success('Data Updated')
  window.localStorage.setItem('listing-shop', JSON.stringify(tempData))
  await socket.emit("get-total-shop")
})

socket.on("return-find-shop-by-name", function (data) {
  $('#loading').css('display', 'none')
  if(data != 0){
    updateData(data)
  } else {
    alert('This shop is not available')
  }
})

socket.on("total-shop", function (data) {
  $('#fun-fact').text("Bạn có biết? Tổng số shop được tạo ra trên Etsy lên đến " + data.toLocaleString() + " shop")
})

socket.on("last-updated", function (data) {
  $('#last-updated').text("Last updated: " + data.updateHistory)
})

socket.on("shop-tracking-data", function (data) {
  $('#loading').css('display', 'none')
  var ctx = document.getElementById("chart-total-sales").getContext("2d");
  var gradientblue = ctx.createLinearGradient(0, 0, 0, 225);
  gradientblue.addColorStop(0, "rgba(6,91,249,0.3)");
  gradientblue.addColorStop(1, "rgba(6,91,249, 0)");
  var gradientred = ctx.createLinearGradient(0, 0, 0, 225);
  gradientred.addColorStop(0, "rgba(255,0,40,0.3)");
  gradientred.addColorStop(1, "rgba(255,0,40, 0)");
  var gradientgreen = ctx.createLinearGradient(0, 0, 0, 225);
  gradientgreen.addColorStop(0, "rgba(47,208,87,0.3)");
  gradientgreen.addColorStop(1, "rgba(47,208,87, 0)");

  let label = []
  let total_sales = []
  let num_favorers = []
  let listing_active_count = []
  for (let index = 0; index < data.length; index++) {
    let time = data[index].time_update.split('-')
    label.push(time[2].substr(0, 2).trim() + '/' + time[1])
    total_sales.push(data[index].total_sales)
    num_favorers.push(data[index].num_favorers)
    listing_active_count.push(data[index].listing_active_count)
  }
  new Chart(document.getElementById("chart-total-sales"), {
    type: "line",
    data: {
      labels: label,
      datasets: [{
        label: "Total Sales",
        fill: true,
        backgroundColor: gradientblue,
        borderColor: window.theme.primary,
        data: total_sales,
      }, {
        label: "Num Favorers",
        fill: true,
        backgroundColor: gradientred,
        borderColor: 'red',
        data: num_favorers,
      }, {
        label: "Listing Active Count",
        fill: true,
        backgroundColor: gradientgreen,
        borderColor: 'green',
        data: listing_active_count,
      }]
    },
    options: {
      maintainAspectRatio: false,
      legend: {
        display: false
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
  });
})

socket.on("shopCategoryDataTransfer", function (data) {
  shopCategory = data
  window.localStorage.setItem('listing-shop-category', JSON.stringify(shopCategory))
})

socket.on("userDataTransfer", function (data) {
  $('#loading').css('display', 'none')
  $('#user_img').attr('src', data.image_url_75x75)
  $('#user_id').text(data.user_id)
  $('#user_bio').text(data.bio)
  $('#user_birth_day').text(data.birth_day)
  $('#user_birth_month').text(data.birth_month)
  $('#user_city').text(data.city)
  $('#user_country_id').text(data.country_id)
  $('#user_fname').text(data.first_name)
  $('#user_lname').text(data.last_name)
  $('#user_avata').text(data.image_url_75x75)
  $('#user_creation_time').text(data.join_tsz)
  $('#user_location').text(data.location)
  $('#user_region').text(data.region)
  $('#user_buy_count').text(data.transaction_buy_count.toLocaleString())
  $('#user_sold_count').text(data.transaction_sold_count.toLocaleString())
})

socket.on("listingDataTransfer", function (data) {
  $('#loading').css('display', 'none')
  $('#table_id-list').DataTable().clear().destroy()
  for (var i = 0; i < data.length; i++) {
    let taxonomy = data[i].taxonomy_path
    taxonomy = taxonomy[taxonomy.length - 1]
    $('#table-list').append(`<tr>
          <td>${i+1}</td>
          <td><a href='${data[i].url}' target="_blank">${data[i].title}</a></td>
          <td>${taxonomy}</td>
          <td>${data[i].price.toLocaleString()}</td>
          <td>${getEpochTime(data[i].creation_tsz)}</td>
          <td>${data[i].views.toLocaleString()}</td>
          <td>${data[i].num_favorers.toLocaleString()}</td>
          <td>${data[i].quantity.toLocaleString()}</td>
          <td>${data[i].is_customizable}</td>
          <td>${data[i].is_digital}</td>
          <td>${data[i].has_variations}</td>
          <td>${data[i].state}</td>
          <td>${data[i].listing_id}</td>
        </tr>`)
  }

  $('#table_id-list').DataTable({
    scrollX: 400,
    pageLength: 10
  })
})

/* ------------------------------------------------END SOCKET SECTION------------------------------------------------ */

/* ------------------------------------------------ADDITIONAL SECTION------------------------------------------------ */

function getDayTimeLife(creation_time) {
  let timeNow = new Date().getTime()
  let life_time = Math.floor(timeNow / 1000) - creation_time
  return Math.floor(life_time / 86400)
}

function getAvgSales(total_sales, creation_time) {
  let avgSales = total_sales / getDayTimeLife(creation_time)
  return avgSales.toFixed(2)
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

var coll = document.getElementsByClassName("collapsible")
for (let i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function () {
    this.classList.toggle("active")
    var content = this.nextElementSibling
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block"
    }
  })
}

/* ------------------------------------------------END ADDITIONAL SECTION------------------------------------------------ */

/* ------------------------------------------------FILTER SECTION------------------------------------------------ */

$('#all-shop-filter').on('click', async function () {
  category = 'All'
  $('#dropdown-filter-shop').text('All')
  searchOrFilterData()
})

$('#canvas-shop-filter').on('click', async function () {
  category = 'Canvas'
  searchOrFilterData()
})

$('#shirt-shop-filter').on('click', async function () {
  category = 'Shirt'
  searchOrFilterData()
})

$('#mug-shop-filter').on('click', async function () {
  category = 'Mug'
  searchOrFilterData()
})

$('#blanket-shop-filter').on('click', async function () {
  category = 'Blanket'
  searchOrFilterData()
})

$('#tumbler-shop-filter').on('click', async function () {
  category = 'Tumbler'
  searchOrFilterData()
})

$('#all-time-created-shop-filter').on('click', async function () {
  timeCreatedShopFilter = 0
  $('#dropdown-filter-shop-time-created').text('All')
  searchOrFilterData()
})

$('#6m-time-created-shop-filter').on('click', async function () {
  timeCreatedShopFilter = 1
  $('#dropdown-filter-shop-time-created').text('In 6 months')
  searchOrFilterData()
})

$('#in1y-time-created-shop-filter').on('click', async function () {
  timeCreatedShopFilter = 2
  $('#dropdown-filter-shop-time-created').text('In 1 year')
  searchOrFilterData()
})

$('#over1y-time-created-shop-filter').on('click', async function () {
  timeCreatedShopFilter = 3
  $('#dropdown-filter-shop-time-created').text('Over 1 years')
  searchOrFilterData()
})

$('#custom-time-created-shop-filter').daterangepicker({
  "showDropdowns": true,
  "minYear": 2010,
  "maxYear": 2023,
  "startDate": "12/21/2020",
  "opens": "center"
}, function (start, end, label) {
  timeCreatedShopFilter = 'custom'
  $('#dropdown-filter-shop-time-created').text(start.format('MM-DD-YYYY') + ' to ' + end.format('MM-DD-YYYY'))
  searchOrFilterData()
})

function timeCreatedShopFilterAction(dataFilter) {
  let shopTimeDataFilter = []
  let daysInTime = 0

  if (timeCreatedShopFilter == 1) {
    daysInTime = 182
  }
  if (timeCreatedShopFilter > 1) {
    daysInTime = 365
  }

  for (let i = 0; i < dataFilter.length; i++) {
    if (timeCreatedShopFilter <= 2 && getDayTimeLife(dataFilter[i].creation_tsz) <= daysInTime) {
      shopTimeDataFilter.push(dataFilter[i])
    } else if (timeCreatedShopFilter == 3 && getDayTimeLife(dataFilter[i].creation_tsz) > daysInTime) {
      shopTimeDataFilter.push(dataFilter[i])
    }
  }
  return shopTimeDataFilter
}

/* ------------------------------------------------END FILTER SECTION------------------------------------------------ */