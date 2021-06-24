var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true,
    transports: ['websocket']
})

socket.emit("get-add-tracking-status")

$('#ping-vps').on('click', () => {
    $('#status').empty()
    socket.emit("run-ping-vps")
})

$('#ping-customcat').on('click', () => {
    $('#status').empty()
    socket.emit("run-ping-customcat")
})

$('#update-server').on('click', () => {
    socket.emit("run-update-server")
})

socket.on("return-ping-vps", data => {
    $('#status').append(`<h4>${data} online</h4>`)
})

socket.on("return-ping-customcat", data => {
    $('#status').append(`<h4>${data} online</h4>`)
})

socket.on("add-tracking-status", data => {
    $('#auto-add-status').empty()
    for (let item of data) {
        $('#auto-add-status').append(`<h4>${item} done</h4>`)
    }
    console.log(data)
})