var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true
})

console.log('Getting data...')

var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
var date = new Date()
var end = date.toLocaleDateString("en-US", options)
date.setDate(date.getDate() - 5)    
var start = date.toLocaleDateString("en-US", options)

console.log(end + start)
getData()

setInterval(scheduleUpdate, 3600000) // 1h
function scheduleUpdate() {
  location.reload()
}

async function getData() {
    await sleep(3000)
    $.ajax({
        url: `https://app.customcat.com/app/122009/order/exportorders?start_date=${start}&end_date=${end}`,
        success: async function (result) {
            await socket.emit("track-order-join", result)
            console.log('Data sent to server successful')
        }
    })
}

async function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}