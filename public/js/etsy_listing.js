const _id = window['Etsy'].Context.data.input_shop_name

var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true,
    transports: ['websocket'],
    query: {
        type: 1,
        etsy_id: _id,
    }
})

document.title = 'Listing tool loaded'

socket.on('etsy-list-new', async function(data){
    //do stuff
    console.log(data)

    //on done
    let response = {
        client_id: data.client_id,
        shop: data.shop,
        status: 1,
    }
    socket.emit('etsy-list-done', response)
})