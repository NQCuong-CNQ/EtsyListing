// var socket = io.connect("https://giftsvk.com:3000", {secure: true});

// socket.on("connect", function (data) {
//   socket.emit("join", { customId: "000CustomIdHere0000" });
// });

// socket.on("thread", function (data) {
//   $("#thread").append("<li>" + data + "</li>");
// });


// $("form").submit(function () {
//   var message = $("#message").val();
//   socket.emit("messages", message);
//   this.reset();
//   return false;
// });
// var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest()

var API_KEY = '2mlnbmgdqv6esclz98opmmuq'
var limit = 20
var offset = 0
var response
updateData()

$('#search-shop-button').on('click', function () {
  let shop_name = $('#search-shop-input').val()
  if (shop_name == "") {
    updateData()
    return
  }

  xhr.open("GET", `https://openapi.etsy.com/v2/shops/${shop_name}?api_key=${API_KEY}`, true)
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      let status = xhr.status
      if (status === 0 || (status >= 200 && status < 400)) {
        response = this.responseText
        // let count = JSON.parse(response).count
        response = JSON.parse(response).results
        $('#table_id').DataTable().clear().destroy();
        // for (var i = 0; i < 20; i++) {
          var d = new Date(0);
          d.setUTCSeconds(response[0].creation_tsz);
        $('#table').append(`<tr>
            <td onclick="getShopDetail(${response[0].shop_id}, '${response[0].shop_name}', ${response[0].listing_active_count})">${response[0].shop_name}</td>
            <td>${response[0].shop_id}</td>
            <td><a href='${response[0].url}' target="_blank">${response[0].url}</a></td>
            <td>${d}</td>
            <td>${response[0].currency_code}</td>
            <td>${response[0].listing_active_count}</td>
            <td>${response[0].digital_listing_count}</td>
            <td>${response[0].num_favorers}</td>
            <td>${response[0].languages}</td>
          </tr>`)
        // }

        $('#table_id').DataTable({
          paging: false,
          searching: false,
          ordering: false,
          scrollX: 400
        });
      } else {
      }
    }
  }
  xhr.send();
})

function getShopDetail(shop_id, shop_name, count) {
  $('#option-shop-section').css("display", "block")
  $('#list-shop-section').css("display", "none")
  $('#listing-shop-section').css("display", "none")
  $('#shop-id-option-section').text(shop_id)
  // alert(shop.name)
  $('#shop-name-option-section').text(shop_name)
  $('#listing-option-button').on('click', function(){
    getListingOption(shop_id, count)
  })
  $('#user-option-button').on('click', function(){
    getUserOption(shop_id)
  })
}



function getListingOption(shop_id, count) {

  $('#option-shop-section').css("display", "none")
  $('#list-shop-section').css("display", "none")
  $('#listing-shop-section').css("display", "block")
  // alert("sadf")
  // let id = shop.id

  offset = 0
  xhr.open("GET", `https://openapi.etsy.com/v2/shops/${shop_id}/listings/active?api_key=${API_KEY}&limit=${limit}&offset=${offset}`, true)
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      let status = xhr.status
      if (status === 0 || (status >= 200 && status < 400)) {
        let listing = this.responseText
        if(count == 0){
          return
        }
        // let count = JSON.parse(listing).count
        listing = JSON.parse(listing).results
        console.log(listing)
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
      } else {
      }
    }
  }
  xhr.send();
}

function getUserOption() {

}

function onNextPage() {
  offset += limit
  updateData()
}

function onPrevPage() {
  if(offset>0){
    offset -= limit
    updateData()
  }
}

function updateData() {
  xhr.open("GET", `https://openapi.etsy.com/v2/shops?api_key=${API_KEY}&limit=${limit}&offset=${offset}`, true)
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      let status = xhr.status
      if (status === 0 || (status >= 200 && status < 400)) {
        response = this.responseText
        // let count = JSON.parse(response).count
        response = JSON.parse(response).results
        $('#table_id').DataTable().clear().destroy();
        for (var i = 0; i < limit; i++) {
          var d = new Date(0);
          d.setUTCSeconds(response[i].creation_tsz);
          $('#table').append(`<tr>
              <td onclick="getShopDetail(${response[i].shop_id}, '${response[i].shop_name}', ${response[i].listing_active_count})">${response[i].shop_name}</td>
              <td>${response[i].shop_id}</td>
              <td><a href='${response[i].url}' target="_blank">${response[i].url}</a></td>
              <td>${d}</td>
              <td>${response[i].currency_code}</td>
              <td>${response[i].listing_active_count}</td>
              <td>${response[i].digital_listing_count}</td>
              <td>${response[i].num_favorers}</td>
              <td>${response[i].languages}</td>
          </tr>`)
        }

        $('#table_id').DataTable({
          paging: false,
          searching: false,
          ordering: false,
          scrollX: 400
        });
      } else {
      }
    }
  }
  xhr.send();
}
  //  console.log(getOrderCount())
  //   async function getOrderCount() {
  //       return new Promise((resolve, reject) => {
  //           try {
  //               $.ajax({
  //                   url: `https://openapi.etsy.com/v2/shops?api_key=${API_KEY}`,
  //                   type: "get",
  //                   contentType: "application/json",
  //                   dataType: "json",
  //                   success: function (data) {
  //                       resolve(data)
  //                   },
  //                   error: (jqXHR, textStatus, errorThrown) => {
  //                       console.log(jqXHR, textStatus, errorThrown)
  //                       reject(new Error(`!Error: statusCode - ${jqXHR.status} - ${errorThrown}`))
  //                   }
  //               })
  //           } catch (err) {
  //               reject(err)
  //           }
  //       })
  //   }
