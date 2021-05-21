var socket = io.connect("https://giftsvk.com:443", {
    port: 443,
    reconnect: true
})

console.log("da ket noi !!!")
socket.on("track-order-return", async function (data) {
    for (var i = 0; i < data.length; i++){
        console.log(data[i])
        await addTracking(data[i].pro_ID, data[i].track_number)
        await sleep(1000)
    }
})

async function addTracking(id, number) {
    if(document.querySelector(`[href="/your/orders/sold?page=1&order_id=${id}"]`) == null){
        return
    }
    let element = document.querySelector(`[href="/your/orders/sold?page=1&order_id=${id}"]`).closest('.flag')
    $(element).find(".wt-tooltip.wt-tooltip--bottom button")[1].click()

    await sleep(4000)

    $('[placeholder="Enter tracking number (recommended)"]:eq(0)').val(number)
    if(number.charAt(0) == 9 || number.charAt(0) == 1){
        $('[for="Select shipping carrier..."] option[value="-1"]').prop("selected", true)
    }
    //  else if (number.charAt(0) == 8){
    //     $('[for="Select shipping carrier..."] option[value="2"]').prop("selected", true)
    // }

}

async function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}