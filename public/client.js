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

var API_KEY = '2mlnbmgdqv6esclz98opmmuq'

main()
async function main() {

    console.log(getOrderCount())
    async function getOrderCount() {
        return new Promise((resolve, reject) => {
            try {
                $.ajax({
                    url: `https://openapi.etsy.com/v2/shops?api_key=${API_KEY}`,
                    type: "get",
                    contentType: "application/json",
                    dataType: "json",
                    success: function (data) {
                        resolve(data)
                    },
                    error: (jqXHR, textStatus, errorThrown) => {
                        console.log(jqXHR, textStatus, errorThrown)
                        reject(new Error(`!Error: statusCode - ${jqXHR.status} - ${errorThrown}`))
                    }
                })
            } catch (err) {
                reject(err)
            }
        })
    }
}