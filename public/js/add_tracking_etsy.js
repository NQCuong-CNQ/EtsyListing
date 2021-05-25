var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true
})

var data = []
var index = 0
var shopName
let trackData

main()
async function main() {
    await sleep(5000)
    shopName = $('[data-tour-anchor="etsy-channel"] [data-test-id="unsanitize"]').text().trim()
    console.log(shopName)
}

socket.on("track-order-return", async function (dataReceive) {
    await location.reload()
    await sleep(7000)
    data = dataReceive
    await addTracking()
})

async function addTracking() {
    console.log(index + '/' + data.length)
    if (index == data.length) {
        index = 0
        return
    }

    console.log(data[index])
    await addTrackingAction(data[index].pro_ID, data[index].track_number)
}

socket.on("track-order-step4", async function (name) {
    console.log('step 4' + name)
    if (name == shopName) {
        $('.position-absolute.position-bottom .flag-img button.btn-orange').click()

        trackData['time_add_tracking'] = Math.floor(new Date().getTime() / 1000)
        await socket.emit("track-order-step5", trackData)
        console.log('saved history' + trackData)
        await addTracking()
    }
})

async function addTrackingAction(id, number) {
    console.log(id + '/ ' + number)
    index++

    if (document.querySelector(`[href="/your/orders/sold?order_id=${id}"]`) == null) {
        await addTracking()
        return
    }
    let element = document.querySelector(`[href="/your/orders/sold?order_id=${id}"]`).closest('.flag')
    $(element).find(".wt-tooltip.wt-tooltip--bottom button")[1].click()

    await sleep(2000)

    trackData = new Object
    trackData['name'] = shopName
    trackData['id'] = id
    trackData['number_tracking'] = number

    await socket.emit("track-order-step1", trackData)
}

async function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}