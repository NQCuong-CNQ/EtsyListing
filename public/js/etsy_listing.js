const _id = window['Etsy'].Context.data.input_shop_name

var socket = io.connect('https://giftsvk.com', {
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
    let dataListing = {
        publish: data.publish,
        title: data.title,
        description: data.description,
        price: '29.99',
        quantity: '999',
        // tags: tags,
        shipping_profile_id: data.shipping_profile_id,
        who_made: 'i_did',
        is_supply: 'false',
        is_handmade: true,
        when_made: 'made_to_order',
        taxonomy_id: 1029,
        should_auto_renew: true,
        // image_ids: imageIds,
        // inventory: inventory,
        _nnc: window['Etsy'].Context.data.csrf_nonce,
        is_personalizable: data.is_personalizable,
        personalization_is_required: data.personalization_is_required,
        personalization_instructions: data.personalization_instructions,
        personalization_field_collection: [{
            personalization_is_required: data.personalization_is_required,
            personalization_instructions: data.personalization_instructions,
        }],
        section_id: 32827039,
        should_advertise: true,
        // /listing_images
    }

    console.log(dataListing)

    $.ajax({
        url: `https://www.etsy.com/api/v3/ajax/shop/${window['Etsy'].Context.data.shop_id}/listings`,
        type: "post",
        contentType: "application/json",
        data: JSON.stringify(dataListing),
        dataType: "json",
        success: function (data) {
            console.log('done')
        },
        error: (jqXHR, textStatus, errorThrown) => {
            console.log(jqXHR, textStatus, errorThrown)
        }
    })
    //on done
    let response = {
        client_id: data.client_id,
        shop: data.shop,
        status: 1,
    }
    socket.emit('etsy-list-done', response)
})

// image_ids{}
// inventory{
//     children{
//         property_id: 501,
//         property_name: 'Dimensions'
//         values{

//         }
//     }
// }
// is_personalizable: true
// listing_images
// personalization_field_collection{
//     personalization_instructions:
//     personalization_is_required
// }
// production_partner_ids{1324976}
// publish:false
// quantity
// shipping_profile_id:111158145514
// tags{
//     'tags1',
//     'tags2',
// }
// taxonomy_id: 482
// title:'title'
// type:'physical'
// when_made:'made_to_order'
// who_made:'i_did'
// currency_code: 'USD'
// currency_symbol: '$'