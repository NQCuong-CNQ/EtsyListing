var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true,
    transports: ['websocket']
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
    let date_ob = new Date()
    if (date_ob.getHours() == 11) {
        location.href = 'https://app.customcat.com/app/102401/main/vieworders'
    } else if (date_ob.getHours() == 19) {
        location.href = 'https://app.customcat.com/app/102401/main/vieworders'
    } else if (date_ob.getHours() == 2) {
        location.href = 'https://app.customcat.com/app/102401/main/vieworders'
    }
}

socket.on("run-add-tracking-by-user", async function (user) {
    if(user == 'Trang'){
        location.href = 'https://app.customcat.com/app/102401/main/vieworders'
    }
})

async function getData() {
    await sleep(5000)

    if (location.href.includes("https://app.customcat.com/signin")) {
        $('#signin-form button').trigger('click')
        return
    } else if (location.href.includes("https://app.customcat.com/account/dashboard")) {
        location.href = 'https://app.customcat.com/app/102401/main/vieworders'
        return
    }

    $.ajax({
        url: `https://app.customcat.com/app/102401/order/exportorders?start_date=${start}&end_date=${end}`,
        success: async function (result) {
            let userData = new Object
            userData['data'] = result
            userData['name'] = 'Trang'
            await socket.emit("track-order-join", userData)
            console.log('Data sent to server successful')
        }
    })
}

async function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}