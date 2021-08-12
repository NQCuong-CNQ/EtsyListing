var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true,
    transports: ['websocket']
})

var count = 0

$('#btn-ok').on('click', function(){
    $('.first-page').css('display', 'none')
    $('.second-page').css('display', 'block')
})

$('#you-wish-btn').on('mousedown', function(){
    if(count == 4){
        $('#you-wish-btn').css('top', `auto`)
        $('#you-wish-btn').css('left', `auto`)
        count++
        return
    }
    else if(count == 5){
        $('#love-btn').on('click')
        count = -1
    }
    console.log(count)
    count++

    let x = Math.random() * 85 + 1
    let y = Math.random() * 85 + 1
    if(window.innerWidth <= 600){
        x = Math.random() * 55 + 1
        y = Math.random() * 55 + 1
    }

    $('#you-wish-btn').css('position', `absolute`)
    $('#you-wish-btn').css('top', `${x}%`)
    $('#you-wish-btn').css('left', `${y}%`)
    $('#love-btn').css('margin', `0`)
})  

$('#send-to').on('click', function(){
    let data = new Object
    let time = new Date().toLocaleString()
    let text = $('#input').val().trim()
    
    if(text == ''){
        
    } else {
        data['time'] = time
        data['text'] = text
        console.log(data)
    
        socket.emit("thao-save", data)
        $('#exampleModal').modal('hide')

        $('#modal-done').modal('show')
    }
})

$('#btn-done').on('click', function(){
    $('#modal-done').modal('hide')
})