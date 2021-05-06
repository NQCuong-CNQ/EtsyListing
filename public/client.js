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

$('#search-shop-button').on('click',function(){
  let shop_name = $('#search-shop-input').val()
  
  xhr.open("GET", `https://openapi.etsy.com/v2/shops/${shop_name}?api_key=${API_KEY}`, true)
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      let status = xhr.status
      if (status === 0 || (status >= 200 && status < 400)) {
        response = this.responseText
        let count = JSON.parse(response).count
        response = JSON.parse(response).results
        $('#table_id').DataTable().clear().destroy();
        // for (var i = 1; i < 20; i++) {
          $('#table').append(`<tr onclick="getShopDetail(${response[0].shop_id})">
              <td>${response[0].shop_name}</td>
              <td>${response[0].shop_id}</td>
              <td>${response[0].url}</td>
          </tr>`)
        // }
        
        $('#table_id').DataTable({
          paging: false,
        });
      } else {
      }
    }
  }
  xhr.send();
})

function getShopDetail(id){
  alert(id)
}

function onNextPage() {
  offset += limit
  updateData()
}

function onPrevPage() {
  offset -= limit
  updateData()
}

function updateData() {
  xhr.open("GET", `https://openapi.etsy.com/v2/shops?api_key=${API_KEY}&limit=${limit}&offset=${offset}`, true)
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      let status = xhr.status
      if (status === 0 || (status >= 200 && status < 400)) {
        response = this.responseText
        let count = JSON.parse(response).count
        response = JSON.parse(response).results
        $('#table_id').DataTable().clear().destroy();
        for (var i = 1; i < 20; i++) {
          $('#table').append(`<tr onclick="getShopDetail(${response[i].shop_id})">
              <td>${response[i].shop_name}</td>
              <td>${response[i].shop_id}</td>
              <td>${response[i].url}</td>
          </tr>`)
        }
        
        $('#table_id').DataTable({
          paging: false,
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
