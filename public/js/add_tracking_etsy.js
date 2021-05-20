var socket = io.connect("https://giftsvk.com")

sleep(5000)
console.log("da ket noi")
var id = '2053148040'

let element = $(`[href="/your/orders/sold?page=1&order_id=${id}"]:eq(0)`).parent().parent().parent().parent().parent().parent().parent().parent().parent()[0]
element.$('.wt-tooltip.wt-tooltip--bottom button')[1].click()

async function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}