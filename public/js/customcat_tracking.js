var socket = io.connect("https://giftsvk.com")

console.log('Getting data...')

var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
var date = new Date()
var end = date.toLocaleDateString("en-US", options)
date.setDate(date.getDate() - 2)
var start = date.toLocaleDateString("en-US", options)

console.log(end + start)
$.ajax({
    url: `https://app.customcat.com/app/122009/order/exportorders?start_date=${start}&end_date=${end}`,
    success: async function (result) {
        await socket.emit("track-order-join", result)
        console.log('Data sent to server successful')
    }
})