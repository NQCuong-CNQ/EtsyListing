var socket = io.connect("https://giftsvk.com")

$.ajax({
    url: "https://app.customcat.com/app/122009/order/exportorders?start_date=05/18/2021&end_date=05/20/2021",
    success: async function (result) {
        await socket.emit("track-order-join", result)
    }
})