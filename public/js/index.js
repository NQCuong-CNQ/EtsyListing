var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true,
    transports: ['websocket']
})


$('#ping-vps').on('click', () => {
    $('#status').empty()
    socket.emit("run-ping-vps")
})

$('#ping-customcat').on('click', () => {
    $('#status').empty()
    socket.emit("run-ping-customcat")
})

socket.on("return-ping-vps", data => {
    $('#status').append(`<h4>${data} online</h4>`)
})

socket.on("return-ping-customcat", data => {
    $('#status').append(`<h4>${data} online</h4>`)
})