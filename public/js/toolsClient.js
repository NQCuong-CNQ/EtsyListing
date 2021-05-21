var socket = io.connect("https://giftsvk.com:443")
// var socket = io.connect("http://localhost:80")

$('#submit-user-button').on('click', async function () {
    if($('#input-user-name').val().trim() == '' || $('#input-user-pass').val().trim() == ''){
        alert("Vui lòng điền đầy đủ thông tin")
        return
    }
    $('#loading').css('display', 'block')
    let data = { userName: $('#input-user-name').val().trim(), pass: $('#input-user-pass').val().trim() }
    await socket.emit("new-user-braumstar", data)
})

socket.on("return-new-user-braumstar", function (data) {
    $('#loading').css('display', 'none')
    if (data == -1) {
        alert('Đã có user này')
    }
    else if (data == 1) {
        alert('Thêm thành công')
    }
    else {
        alert('Thêm thất bại')
    }
})

$('#submit-shop-button').on('click', async function () {
    if($('#input-shop-name').val().trim() == '' || $('#input-user-shop-name').val().trim() == '' || $('#input-country-shop-name').val().trim() == ''){
        alert("Vui lòng điền đầy đủ thông tin")
        return
    }
    $('#loading').css('display', 'block')
    let data = { shopname: $('#input-shop-name').val(), user: $('#input-user-shop-name').val().trim(), country: $('#input-country-shop-name').val().trim() }
    await socket.emit("add-shop-braumstar", data)
})

socket.on("return-add-shop-braumstar", function (data) {
    $('#loading').css('display', 'none')
    if (data == 1) {
        alert('Thêm thành công')
        $('#input-shop-name').val('')
    }
    else {
        alert('Thêm thất bại')
    }
})

$('#submit-shop-die-button').on('click', async function () {
    if($('#input-shop-die-name').val().trim() == ''){
        alert("Vui lòng điền đầy đủ thông tin")
        return
    }
    $('#loading').css('display', 'block')
    let data = { shopname: $('#input-shop-die-name').val() }
    await socket.emit("delete-shop-braumstar", data)
})

socket.on("return-delete-shop-braumstar", function (data) {
    $('#loading').css('display', 'none')
    if (data == 1) {
        alert('Xóa thành công')
        $('#input-shop-die-name').val('')
    }
    else {
        alert('Xóa thất bại')
    }
})

$('#submit-shop-list-button').on('click', async function () {
    if($('#input-user-shop-list').val().trim() == ''){
        alert("Vui lòng điền đầy đủ thông tin")
        return
    }
    $('#loading').css('display', 'block')

    let data = $('#input-user-shop-list').val().trim()
    await socket.emit("get-list-shop-braumstar", data)
})

socket.on("list-shop-braumstar", function (data) {
    $('#loading').css('display', 'none')

    if (data == '') {
        alert('Không tìm thấy shop nào.')
        $('#input-user-shop-list').val('')
    }
    let shop = ''
    for (let i = 0; i < data.length; i++) {
        shop += data[i].brandName + '\n'
    }
    $('#list-shop').text(shop)
})