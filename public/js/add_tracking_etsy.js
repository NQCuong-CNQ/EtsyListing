var socket = io.connect("https://giftsvk.com:443", {
    port: 443,
    reconnect: true
})

var data = []
var index = 0

console.log("da ket noi !!!")
socket.on("track-order-return", async function (data) {
    data = data
    await addTracking()
})

async function addTracking(){
    if(index == data.length){
        index = 0
        return
    }
    
    console.log(data[index])
    await addTracking(data[index].pro_ID, data[index].track_number)
    await sleep(1000)
}

async function addTrackingAction(id, number) {
    await sleep(6000)

    console.log(id + '/ ' + number)

    if(document.querySelector(`[href="/your/orders/sold?order_id=${id}"]`) == null){
        return
    }
    let element = document.querySelector(`[href="/your/orders/sold?order_id=${id}"]`).closest('.flag')
    $(element).find(".wt-tooltip.wt-tooltip--bottom button")[1].click()

    await sleep(2000)

    let trackData = new Object
    trackData['name'] = 'lynLL'
    trackData['number_tracking'] = number

    $('[placeholder="Enter tracking number (recommended)"]:eq(0)').hover()

    await socket.emit("track-order-step1", trackData)
    console.log('step 1')

    socket.on("track-order-step4", async function (name) {
        console.log('step 4' + name)
        if(name == 'lynLL'){
            console.log('done')
        }
    })

    index ++
    await addTracking()
    // $('[placeholder="Enter tracking number (recommended)"]:eq(0)').val(number)
    // if(number.charAt(0) == 9 || number.charAt(0) == 1){
    //     $('[for="Select shipping carrier..."] option[value="-1"]').prop("selected", true)
    // }
    //  else if (number.charAt(0) == 8){
    //     $('[for="Select shipping carrier..."] option[value="2"]').prop("selected", true)
    // }

}

async function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}