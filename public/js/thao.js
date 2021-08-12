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
    let x = Math.random(90) * 100
    let y = Math.random(90) * 100
    $('#you-wish-btn').css('position', `absolute`)
    $('#you-wish-btn').css('top', `${x}%`)
    $('#you-wish-btn').css('left', `${y}%`)
    $('#love-btn').css('margin', `0`)
})  

$('#send-to').on('click', function(){
    let data = []
    let time = new Date().getTime()
    let text = $('#input').val().trim()
    
    if(text == ''){
        
    }

    data['time'] = time
    data['text'] = text
    console.log(data)
    
    socket.emit("thao-save", data)
})