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

$('#fix-tracking-history-btn').on('click', () => {
    $('#fix-tracking-history-btn').toggleClass("active-fix-tracking")
    let content = $('#fix-tracking-history-btn').next()
    if (content.css("display") === "block") {
        content.css("display", "none")
    } else {
        content.css("display", "block")
    }
})

$('#run-add-tracking-my-btn').on('click', () => {
    socket.emit("run-add-tracking", 'My')
})

$('#run-add-tracking-trang-btn').on('click', () => {
    socket.emit("run-add-tracking", 'Trang')
})

socket.on("return-fix-tracking-history", data => {
    toastr.clear()
    toastr.success('Thành công!')
})

$('#check-limit-btn').on('click', () => {
    socket.emit("check-limit-api")
})

socket.on("return-check-limit-api", data => {
    let index = data.indexOf('x-ratelimit-remaining')
    data = data.slice(index, index + 28).trim()
    toastr.clear()
    toastr.success(data)
})