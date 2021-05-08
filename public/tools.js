// var socket = io.connect("http://giftsvk.com:80")
var socket = io.connect("http://localhost:80")

$('#submit-user-button').on('click', async function () {
    let data = { userName: $('#input-user-name').val(), pass: $('#input-user-pass').val() }
    socket.emit("new-user", data)
})
