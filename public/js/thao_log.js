var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true,
    transports: ['websocket']
})

socket.emit("get-log-thao")

socket.on("return-get-log-thao", data => {
    console.log(data)
    for (let i = 0; i < data.length; i++) {
        $('#logs').append(`<h2>${data[i].text}   -   ${data[i].time}</h2>`)
    }
})