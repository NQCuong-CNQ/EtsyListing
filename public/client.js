var socket = io.connect("http://giftsvk.com:80")
// var socket = io.connect("http://localhost:80")
var shopData
var listingData

socket.on("connect", function (data) {
  socket.emit("join")
})

socet.on("dataTransfer", function (data) {
  shopData = data
  console.log('asdfsda')
  updateData(shopData)
  console.log('ddd')
})

function updateData(shopData) {
  $('#table_id').DataTable().clear().destroy()
  for (var i = 0; i < shopData.length; i++) {
    $('#table').append(`<tr>
        <td onclick="getShopDetail(${i})"><i class="fas fa-info-circle pointer"></i></td>
        <td>${shopData[i].shop_name}</td>
        <td>${shopData[i].shop_id}</td>
        <td><a href='${shopData[i].url}' target="_blank">www.etsy.com/shop...</a></td>
        <td>${shopData[i].total_sales}</td>
        <td>${getTime(shopData[i].creation_tsz)}</td>
        <td>${shopData[i].currency_code}</td>
        <td>${shopData[i].listing_active_count}</td>
        <td>${shopData[i].digital_listing_count}</td>
        <td>${shopData[i].num_favorers}</td>
        <td>${shopData[i].languages}</td>
    </tr>`)
  }

  $('#table_id').DataTable({
    scrollX: 400,
    pageLength: 25
  })
}

async function getShopDetail(i) {
  $('#option-shop-section').css("display", "block")
  $('#list-shop-section').css("display", "none")
  $('#listing-shop-section').css("display", "none")
  $('#user-shop-section').css("display", "none")
  $('#shop-id-option-section').text(shopData[i].shop_id)
  $('#shop-name-option-section').text(shopData[i].shop_name)

  $('#listing-option-button').on('click', async function () {
    await getListingOption(i)
  })
  $('#user-option-button').on('click', async function () {
    await getUserOption(i)
  })
}

async function getUserOption(i) {
  $('#option-shop-section').css("display", "none")
  $('#list-shop-section').css("display", "none")
  $('#listing-shop-section').css("display", "none")
  $('#user-shop-section').css("display", "block")

  await socket.emit("get_user_by_user_id", shopData[i].user_id)

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
    $('#user_buy_count').text(data.transaction_buy_count)
    $('#user_sold_count').text(data.transaction_sold_count)
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
  await socket.emit("shop_id", shopData[i].shop_id)

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
            <td>${data[i].title}</td>
            <td>${taxonomy}</td>
            <td>${data[i].price}</td>
            <td>${getTime(data[i].creation_tsz)}</td>
            <td>${data[i].views}</td>
            <td>${data[i].num_favorers}</td>
            <td>${data[i].quantity}</td>
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
      pageLength: 25
    })
  })
}