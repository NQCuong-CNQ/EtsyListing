const Client_UUID = create_UUID()

var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true,
    transports: ['websocket'],
    query: {
        type: 2,
        client_id: Client_UUID,
    }
})

function create_UUID() {
    let dt = new Date().getTime()
    let uuid = 'xxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (dt + Math.random() * 16) % 16 | 0
        dt = Math.floor(dt / 16)
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
    return uuid
}

socket.on('response-list-to-client', data => {
    console.log(data)
})

$('#submit-btn').on('click', () => {

    let data = {
        client_id: Client_UUID,
        shop: 'AnthonyEJ',
        product_type: $('#dropdown-product-type').val(),
        description: $('#description').val().trim(),
        custom_images: $('#custom-images').val().trim(),
        main_images: $('#main-images').val().trim(),
        title: $('#title').val().trim(),
        tags: $('#tags').val().trim(),
    }
    socket.emit('client-list-new', data)

    // $.ajax({
    //     url: '/listing',
    //     type: "get",
    //     contentType: "application/json",
    //     dataType: "json",
    //     data: {
    //         id: id,
    //         actual_input: actual_input,
    //         carrier_name: carrier_name,
    //     },
    //     success: function (data) {
    //         toastr.clear()
    //         toastr.success('Done!')
    //     },
    //     error: (jqXHR, textStatus, errorThrown) => {
    //         console.log(jqXHR, textStatus, errorThrown)
    //     }
    // })
})

if ($('#dropdown-product-type').val() == 'canvas') {
    let description = ''
    let customImages = ''
    let tags = ''

    description = `"Materials

Cotton, Polyester

Description

- Our Canvas are made out of high-end satin material that provide the observer with availability to view the image from a wide angle point-of-view without experiencing any visible glow or shadows.

- Our Canvas are abrasion-resistant to print production, packaging, and handling processes ensuring that the product gets to you in the best condition ready to be hanged.

- We take framing very seriously. Pine frames are made in-house.

- Our package is specifically designed for safe transport. Our plastic sleeve keeps the item secure and in place. The over-extended edges provide additional resilience against outside forces making sure the package reaches its destination damage-free. If you order more than one artwork, they will be shipped separately to ensure safe delivery.

- Shipped quickly.

- Printed, designed, and shipped from the USA.

- SATISFACTION GUARANTEED - We know you will love it!"
NOTE: Our canvases are shipped by Ground shipping option, orders that utilize Ground shipping cannot be delivered to a PO Box. 
Also, Canvas has a size big, it can't be delivered to the PO box. In case, please provide us a valid address, you guys can use your relative or neighborhood ones. `
    customImages = `https://i.etsystatic.com/25080108/r/il/340a94/2805082222/il_794xN.2805082222_enua.jpg
https://i.etsystatic.com/25080108/r/il/684d06/2846384440/il_794xN.2846384440_r370.jpg`
    tags = ''

    $('#custom-images').val(customImages)
    $('#description').val(description)
}