var socket = io.connect("http://giftsvk.com:80")
// var socket = io.connect("http://localhost:80")
var shopData
var listingData
var category

socket.on("connect", async function (data) {
  await socket.emit("join")

  await socket.on("dataTransfer", function (data) {
    shopData = data
    updateData()
  })

  await socket.emit("get-total-shop")
  await socket.on("total-shop", function (data) {
    $('#fun-fact').text("Bạn có biết? Tổng số shop được tạo ra trên Etsy lên đến " + data.toLocaleString() + " shop")
  })

  await socket.on("last-updated", function (data) {
    $('#last-updated').text("Last updated: " + data.updateHistory)
  })
})

function updateData() {
  $('#table_id').DataTable().clear().destroy()
  for (var i = 0; i < shopData.length; i++) {
    $('#table').append(`<tr>
        <td onclick="getShopDetail(${i})"><i class="fas fa-info-circle pointer"></i></td>
        <td>${shopData[i].shop_name}</td>
        <td><a href='${shopData[i].url}' target="_blank">www.etsy.com/shop...</a></td>
        <td>${shopData[i].total_sales.toLocaleString()}</td>
        <td>${getTime(shopData[i].creation_tsz)}</td>
        <td>${shopData[i].currency_code}</td>
        <td>${shopData[i].listing_active_count.toLocaleString()}</td>
        <td>${shopData[i].num_favorers.toLocaleString()}</td>
        <td>${shopData[i].languages}</td>
        <td>${shopData[i].shop_id}</td>
    </tr>`)
  }

  $('#table_id').DataTable({
    scrollX: 400,
    pageLength: 25
  })
}

async function getShopDetail(i) {
  await socket.emit("shop-tracking", shopData[i].shop_id)

  await socket.on("shop-tracking-data", function (data) {
    var ctx = document.getElementById("chart-total-sales").getContext("2d");
    var gradient = ctx.createLinearGradient(0, 0, 0, 225);
    gradient.addColorStop(0, "rgba(215, 227, 244, 1)");
    gradient.addColorStop(1, "rgba(215, 227, 244, 0)");

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
          backgroundColor: gradient,
          borderColor: window.theme.primary,
          data: total_sales,
        }, {
          label: "Num Favorers",
          fill: true,
          backgroundColor: gradient,
          borderColor: 'red',
          data: num_favorers,
        }, {
          label: "Listing Active Count",
          fill: true,
          backgroundColor: gradient,
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

  $('#option-shop-section').css("display", "block")
  $('#list-shop-section').css("display", "none")
  $('#listing-shop-section').css("display", "none")
  $('#user-shop-section').css("display", "none")

  $('#shop-id-option-section').text(shopData[i].shop_id)
  $('#shop-name-option-section').text('Shop name: ' + shopData[i].shop_name)
  $('#shop-title-option-section').text(shopData[i].title)
  $('#shop-url-option-section').text(shopData[i].url)
  $('#shop-announcement-option-section').text(shopData[i].announcement)
  $('#shop-creation-time-option-section').text(getTime(shopData[i].creation_tsz))
  $('#shop-currency_code-option-section').text(shopData[i].currency_code)
  $('#shop-digital_listing_count-option-section').text(shopData[i].digital_listing_count.toLocaleString())
  $('#shop-is_vacation-option-section').text(shopData[i].is_vacation)
  $('#shop-last_updated_tsz-option-section').text(getTime(shopData[i].last_updated_tsz))
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

$('#all-shop-filter').on('click', async function () {
  $('#dropdown-filter-shop').text('All')
  updateData()
})

$('#canvas-shop-filter').on('click', async function () {
  category = 'Canvas'
  await shopFilterAction(category)
})

$('#shirt-shop-filter').on('click', async function () {
  category = 'Shirt'
  await shopFilterAction(category)
})

$('#mug-shop-filter').on('click', async function () {
  category = 'Mug'
  await shopFilterAction(category)
})

$('#blanket-shop-filter').on('click', async function () {
  category = 'Blanket'
  await shopFilterAction(category)
})

async function shopFilterAction(category) {
  $('#dropdown-filter-shop').text(category)
  await socket.emit("get-shop-filter")
  await socket.on("shopCategoryDataTransfer", function (data) {
    let listShopName = []
    for (let i = 0; i < data.length; i++) {
      if (data[i].category.includes(category)) {
        listShopName.push(data[i].shop_name)
      }
    }

    var shopDataFilter = []
    for (let index = 0; index < listShopName.length; index++) {
      for (let j = 0; j < shopData.length; j++) {
        if (listShopName[index] == shopData[j].shop_name) {
          shopDataFilter.push(shopData[j])
        }
      }
    }
    updateData(shopDataFilter)
  })
}

async function getUserOption(i) {
  await socket.emit("get_user_by_user_id", shopData[i].user_id)

  $('#option-shop-section').css("display", "none")
  $('#list-shop-section').css("display", "none")
  $('#listing-shop-section').css("display", "none")
  $('#user-shop-section').css("display", "block")

  await socket.on("userDataTransfer", function (data) {
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
}

function getTime(input) {
  var date = new Date(0)
  date.setUTCSeconds(input)
  time = String(date)
  time = time.substr(0, time.length - 16)
  return time
}

async function getListingOption(i) {
  await socket.emit("get_listing_shop_id", shopData[i].shop_id)

  $('#option-shop-section').css("display", "none")
  $('#list-shop-section').css("display", "none")
  $('#listing-shop-section').css("display", "block")
  $('#user-shop-section').css("display", "none")

  await socket.on("listingDataTransfer", function (data) {
    $('#table_id-list').DataTable().clear().destroy()
    for (var i = 0; i < data.length; i++) {
      let taxonomy = data[i].taxonomy_path
      taxonomy = taxonomy[taxonomy.length - 1]
      $('#table-list').append(`<tr>
            <td>${i}</td>
            <td>${data[i].title}</td>
            <td>${taxonomy}</td>
            <td>${data[i].price.toLocaleString()}</td>
            <td>${getTime(data[i].creation_tsz)}</td>
            <td>${data[i].views.toLocaleString()}</td>
            <td>${data[i].num_favorers.toLocaleString()}</td>
            <td>${data[i].quantity.toLocaleString()}</td>
            <td><a href='${data[i].url}' target="_blank">www.etsy.com/listing...</a></td>
            <td>${data[i].occasion}</td>
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

$('#tracking-analysis-option-button').on('click', async function () {
  alert("Đang được phát triển!\nChức năng ghi lại toàn bộ số lượng listing theo ngày, vẽ biểu đồ và phân tích")
})