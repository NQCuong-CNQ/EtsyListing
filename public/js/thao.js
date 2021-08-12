var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true,
    transports: ['websocket']
})

$('#btn-ok').on('click', function(){
    $('.first-page').css('display', 'none')
    $('.second-page').css('display', 'block')
})

$('#you-wish-btn').on('mousedown', function(){
    let x = Math.random(95) * 100
    let y = Math.random(95) * 100
    $('#you-wish-btn').css('position', `absolute`)
    $('#you-wish-btn').css('top', `${x}%`)
    $('#you-wish-btn').css('left', `${y}%`)
})  

$('#send-to').on('click', function(){
    let time = new Date().getTime()
    let text = $('#input').val().trim()
    console.log(text)
    socket.emit("thao-save", data)
})