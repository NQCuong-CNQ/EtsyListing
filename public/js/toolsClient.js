var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true,
    transports: ['websocket']
})

$('#submit-user-button').on('click', () => {
    if ($('#input-user-name').val().trim() == '' || $('#input-user-pass').val().trim() == '') {
        toastr.clear()
        toastr.warning('Vui lòng điền đầy đủ thông tin!')
        return
    }
    $('#loading').css('display', 'block')
    let data = { userName: $('#input-user-name').val().trim(), pass: $('#input-user-pass').val().trim() }
    socket.emit("new-user-braumstar", data)
})

socket.on("return-new-user-braumstar", data => {
    $('#loading').css('display', 'none')
    if (data == -1) {
        toastr.clear()
        toastr.warning('Đã có user này!')
    }
    else if (data == 1) {
        toastr.clear()
        toastr.success('Thêm thành công')
    }
    else {
        toastr.clear()
        toastr.error('Thêm thất bại!')
    }
})

$('#submit-shop-button').on('click', () => {
    if ($('#input-shop-name').val().trim() == '' || $('#input-user-shop-name').val().trim() == '' || $('#input-country-shop-name').val().trim() == '') {
        toastr.clear()
        toastr.warning('Vui lòng điền đầy đủ thông tin!')
        return
    }
    $('#loading').css('display', 'block')
    let data = { shopname: $('#input-shop-name').val(), user: $('#input-user-shop-name').val().trim(), country: $('#input-country-shop-name').val().trim() }
    socket.emit("add-shop-braumstar", data)
})

socket.on("return-add-shop-braumstar", data => {
    $('#loading').css('display', 'none')
    if (data == 1) {
        toastr.clear()
        toastr.success('Thêm thành công')
        $('#input-shop-name').val('')
    }
    else {
        toastr.clear()
        toastr.error('Thêm thất bại!')
    }
})

$('#submit-shop-die-button').on('click', () => {
    if ($('#input-shop-die-name').val().trim() == '') {
        toastr.clear()
        toastr.warning('Vui lòng điền đầy đủ thông tin!')
        return
    }
    $('#loading').css('display', 'block')
    let data = { shopname: $('#input-shop-die-name').val() }
    socket.emit("delete-shop-braumstar", data)
})

socket.on("return-delete-shop-braumstar", data => {
    $('#loading').css('display', 'none')
    if (data == 1) {
        toastr.clear()
        toastr.success('Xóa thành công')
        $('#input-shop-die-name').val('')
    }
    else {
        toastr.clear()
        toastr.error('Xóa thất bại!')
    }
})

$('#submit-shop-list-button').on('click', () => {
    if ($('#input-user-shop-list').val().trim() == '') {
        toastr.clear()
        toastr.warning('Vui lòng điền đầy đủ thông tin!')
        return
    }
    $('#loading').css('display', 'block')

    let data = $('#input-user-shop-list').val().trim()
    socket.emit("get-list-shop-braumstar", data)
})

socket.on("list-shop-braumstar", data => {
    $('#loading').css('display', 'none')

    if (data == '') {
        toastr.clear()
        toastr.warning('Không tìm thấy shop nào.')
        $('#input-user-shop-list').val('')
    }
    let shop = ''
    for (let i = 0; i < data.length; i++) {
        shop += data[i].brandName + '\n'
    }
    $('#list-shop').text(shop)
})

$('#input-user-shop-list').on('keypress', e => {
    if (e.key == 'Enter') {
        $('#submit-shop-list-button').trigger('click')
    }
})

$('#input-user-name').on('keypress', e => {
    if (e.key == 'Enter') {
        $('#submit-user-button').trigger('click')
    }
})
$('#input-user-pass').on('keypress', e => {
    if (e.key == 'Enter') {
        $('#submit-user-button').trigger('click')
    }
})
$('#input-user-shop-name').on('keypress', e => {
    if (e.key == 'Enter') {
        $('#submit-shop-button').trigger('click')
    }
})
$('#input-country-shop-name').on('keypress', e => {
    if (e.key == 'Enter') {
        $('#submit-shop-button').trigger('click')
    }
})
