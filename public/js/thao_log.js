var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true,
    transports: ['websocket']
})

socket.emit("get-log-thao")

getEpochTime = input => {
    var date = new Date(0)
    date.setUTCSeconds(input)
    time = String(date)
    console.log(time)
    time = time.split(' ')
    time = `${time[2]}-${convertMonthInString(time[1])}-${time[3]}`
    return time
}

socket.on("return-get-log-thao", data => {
    console.log(data)
    for (let i = 0; i < data.length; i++) {
        $('#logs').append(`<h2>${data[i].text} - ${getEpochTime(data[i].time)}</h2>`)
    }
})