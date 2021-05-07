var socket = io.connect("http://localhost:80")
var shopData

socket.on("connect", function (data) {
  socket.emit("join", { customId: "000CustomIdHere0000" })
})

socket.on("dataTransfer", function (data) {
  shopData = data
  updateData(shopData)
})

function updateData(shopData) {
  $('#table_id').DataTable().clear().destroy()
  for (var i = 0; i < shopData.length; i++) {
    var d = new Date(0)
    d.setUTCSeconds(shopData[i].creation_tsz)
    $('#table').append(`<tr>
              <td onclick="getShopDetail(${shopData[i].shop_id}, '${shopData[i].shop_name}', ${shopData[i].listing_active_count})">${shopData[i].shop_name}</td>
              <td>${shopData[i].shop_id}</td>
              <td><a href='${shopData[i].url}' target="_blank">${shopData[i].url}</a></td>
              <td>${shopData[i].total_sales}</td>
              <td>${d}</td>
              <td>${shopData[i].currency_code}</td>
              <td>${shopData[i].listing_active_count}</td>
              <td>${shopData[i].digital_listing_count}</td>
              <td>${shopData[i].num_favorers}</td>
              <td>${shopData[i].languages}</td>
          </tr>`)
  }

  $('#table_id').DataTable({
    scrollX: 400
  })
}
// $("form").submit(function () {
//   var message = $("#message").val();
//   socket.emit("messages", message);
//   this.reset();
//   return false;
// });
// var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
// var xhr = new XMLHttpRequest()

// var API_KEY = '2mlnbmgdqv6esclz98opmmuq'
// var limit = 20
// var offset = 0
// var shopData
// updateData()

// $('#search-shop-button').on('click', function () {
//   let shop_name = $('#search-shop-input').val()
//   if (shop_name == "") {
//     updateData(shopData)
//     return
//   }

  // xhr.open("GET", `https://openapi.etsy.com/v2/shops/${shop_name}?api_key=${API_KEY}`, true)
  // xhr.onreadystatechange = function () {
  //   if (xhr.readyState === XMLHttpRequest.DONE) {
  //     let status = xhr.status
  //     if (status === 0 || (status >= 200 && status < 400)) {
  //       shopData = this.shopDataText
  //       // let count = JSON.parse(shopData).count
  //       shopData = JSON.parse(shopData).results
  //       $('#table_id').DataTable().clear().destroy();
  //       // for (var i = 0; i < 20; i++) {
  //       var d = new Date(0);
  //       d.setUTCSeconds(shopData[0].creation_tsz);
  //       $('#table').append(`<tr>
  //           <td onclick="getShopDetail(${shopData[0].shop_id}, '${shopData[0].shop_name}', ${shopData[0].listing_active_count})">${shopData[0].shop_name}</td>
  //           <td>${shopData[0].shop_id}</td>
  //           <td><a href='${shopData[0].url}' target="_blank">${shopData[0].url}</a></td>
  //           <td>${d}</td>
  //           <td>${shopData[0].currency_code}</td>
  //           <td>${shopData[0].listing_active_count}</td>
  //           <td>${shopData[0].digital_listing_count}</td>
  //           <td>${shopData[0].num_favorers}</td>
  //           <td>${shopData[0].languages}</td>
  //         </tr>`)
  //       // }

  //       $('#table_id').DataTable({
  //         paging: false,
  //         searching: false,
  //         ordering: false,
  //         scrollX: 400
  //       });
  //     } else {
  //     }
  //   }
  // }
  // xhr.send();
// })

function getShopDetail(shop_id, shop_name, count) {
  $('#option-shop-section').css("display", "block")
  $('#list-shop-section').css("display", "none")
  $('#listing-shop-section').css("display", "none")
  $('#shop-id-option-section').text(shop_id)
  // alert(shop.name)
  $('#shop-name-option-section').text(shop_name)
  $('#listing-option-button').on('click', function () {
    getListingOption(shop_id, count)
  })
  $('#user-option-button').on('click', function () {
    getUserOption(shop_id)
  })
}



function getListingOption(shop_id, count) {
  $('#option-shop-section').css("display", "none")
  $('#list-shop-section').css("display", "none")
  $('#listing-shop-section').css("display", "block")

  // offset = 0
  // xhr.open("GET", `https://openapi.etsy.com/v2/shops/${shop_id}/listings/active?api_key=${API_KEY}&limit=${limit}&offset=${offset}`, true)
  // xhr.onreadystatechange = function () {
  //   if (xhr.readyState === XMLHttpRequest.DONE) {
  //     let status = xhr.status
  //     if (status === 0 || (status >= 200 && status < 400)) {
  //       let listing = this.shopDataText
  //       if (count == 0) {
  //         return
  //       }
  //       // let count = JSON.parse(listing).count
  //       listing = JSON.parse(listing).results
  //       console.log(listing)
        $('#table_id-list').DataTable().clear().destroy()
        for (var i = 0; i < count; i++) {
          var d = new Date(0);
          d.setUTCSeconds(listing[i].creation_tsz);
          $('#table-list').append(`<tr>
            <td>${listing[i].listing_id}</td>
            <td>${listing[i].state}</td>
            <td>${listing[i].title}</td>
            <td>${d}</td>
            <td>${listing[i].price}</td>
            <td>${listing[i].quantity}</td>
            <td>${listing[i].taxonomy_id}</td>
            <td><a href='${listing[i].url}' target="_blank">${listing[i].url}</a></td>
            <td>${listing[i].views}</td>
            <td>${listing[i].num_favorers}</td>
            <td>${listing[i].occasion}</td>
            <td>${listing[i].is_customizable}</td>
            <td>${listing[i].is_digital}</td>
            <td>${listing[i].has_variations}</td>
          </tr>`)
        }

        $('#table_id-list').DataTable({
          paging: false,
          searching: false,
          ordering: false,
          scrollX: 400
        })
//       } else {
//       }
//     }
//   }
//   xhr.send();
}