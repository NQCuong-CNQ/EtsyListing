var socket = io.connect("https://giftsvk.com")

socket.on("track-order-return", async function (data) {
    console.log(data)
    // await test()
})

async function test() {

    console.log("da ket noi")
    var id = '2053148040'

    let element = document.querySelector('[href="/your/orders/sold?page=1&order_id=2053148040"]').closest('.flag')
    $(element).find(".wt-tooltip.wt-tooltip--bottom button")[1].click()
}

async function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}