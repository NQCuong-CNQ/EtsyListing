var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true,
    transports: ['websocket']
})

var data = []
var index = 0
var shopName
let trackData

main()
async function main() {
    await sleep(10000)
    shopName = $('[data-tour-anchor="etsy-channel"] [data-test-id="unsanitize"]').text().trim()
    console.log(shopName)
}

socket.on("get-email-customer-order", async function () {
    let mailData = new Object
    mailData['shopName'] = shopName
    mailData['mail'] = $('a.text-gray').text()

    await sleep(Math.floor(Math.random() * 2500))
    socket.emit("return-email-customer-order", mailData)
})

socket.on("reload-etsy", function () {
    location.href = 'https://www.etsy.com/your/orders/sold'
})

socket.on("track-order-return", async function (dataReceive) {
    data = dataReceive
    console.log('receive data: ' + data)
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
    if (name == shopName) {
        let numCarrier = $('[for="Select shipping carrier..."]').val()
        let nameCarrier = $(`[for="Select shipping carrier..."] option[value="${numCarrier}"]`).text()

        if (numCarrier === undefined || numCarrier == '') {
            numCarrier = $('[for="Select delivery carrier..."]').val()
            nameCarrier = $(`[for="Select delivery carrier..."] option[value="${numCarrier}"]`).text()
        }

        if (numCarrier === undefined || numCarrier == '') {
            numCarrier = $('[for="Select delivery company..."]').val()
            nameCarrier = $(`[for="Select delivery company..."] option[value="${numCarrier}"]`).text()
        }

        if (numCarrier === undefined || numCarrier == '') {
            numCarrier = $('[htmlfor="Select delivery company..."]').val()
            nameCarrier = $(`[htmlfor="Select delivery company..."] option[value="${numCarrier}"]`).text()
        }

        
        if (nameCarrier === 'Other' || nameCarrier == '') {
            nameCarrier = $('input[placeholder="Shipping carrier"]').val()
            if (nameCarrier === undefined || nameCarrier == '') {
                nameCarrier = $('input[placeholder="Delivery carrier"]').val()
            }
            if (nameCarrier === undefined || nameCarrier == '') {
                nameCarrier = $('input[placeholder="Delivery company"]').val()
            }
        }

        if(nameCarrier == 'FedEx'){
            return
        }

        let actualInput = $('input[placeholder="Enter tracking number (recommended)"]').val()

        if (actualInput.length <= 16) {
            return
        }

        if (nameCarrier == 'USPS' && !trackData['number_tracking'].startsWith('9')) {
            return
        }

        if (nameCarrier == 'UPS' && !(trackData['number_tracking'].startsWith('1Z') || trackData['number_tracking'].startsWith('8'))) {
            return
        }

        trackData['carrier_name'] = nameCarrier
        trackData['actual_input'] = actualInput

        if (actualInput == trackData['number_tracking']) {
            $('.position-absolute.position-bottom .flag-img button.btn-orange').trigger('click')
        } else {
            return
        }

        socket.emit("track-order-step5", trackData)
        console.log('saved history' + trackData)
        await sleep(8000)
        await addTracking()
    }
})

async function addTrackingAction(id, number) {
    console.log(id + '/ ' + number)
    index++

    if (document.querySelector(`[href="/your/orders/sold?order_id=${id}"]`) == null || number.length < 10) {
        await addTracking()
        return
    }
    let element = document.querySelector(`[href="/your/orders/sold?order_id=${id}"]`).closest('.flag')
    if (shopName == 'DennisGawlick') {
        $(element).find(".wt-tooltip.wt-tooltip--bottom button")[0].click()
    } else {
        $(element).find(".wt-tooltip.wt-tooltip--bottom button")[1].click()
    }

    await sleep(2000)

    trackData = new Object
    trackData['name'] = shopName
    trackData['id'] = id
    trackData['number_tracking'] = number

    socket.emit("track-order-step1", trackData)
}

async function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    )
}