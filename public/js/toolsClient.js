var socket = io.connect("http://giftsvk.com:80")
// var socket = io.connect("http://localhost:80")

$('#submit-user-button').on('click', async function () {
    let data = { userName: $('#input-user-name').val().trim(), pass: $('#input-user-pass').val().trim() }
    socket.emit("new-user-braumstar", data)

    socket.on("return-new-user-braumstar", function (data) {
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
})

$('#submit-shop-button').on('click', async function () {
    let data = { shopname: $('#input-shop-name').val(), user: $('#input-user-shop-name').val().trim(), country: $('#input-country-shop-name').val().trim() }
    socket.emit("add-shop-braumstar", data)

    socket.on("return-add-shop-braumstar", function (data) {
        if (data == 1) {
            alert('Thêm thành công')
        }
        else {
            alert('Thêm thất bại')
        }
    })
})

$('#submit-shop-die-button').on('click', async function () {
    let data = { shopname: $('#input-shop-die-name').val() }
    socket.emit("delete-shop-braumstar", data)

    socket.on("return-delete-shop-braumstar", function (data) {
        if (data == 1) {
            alert('Xóa thành công')
        }
        else {
            alert('Xóa thất bại')
        }
    })
})

$('#submit-shop-list-button').on('click', async function () {
    let data = $('#input-user-shop-list').val().trim()
    await socket.emit("get-list-shop-braumstar", data)

    socket.on("list-shop-braumstar", function (data) {
        if (data == '') {
            alert('Không tìm thấy shop nào.')
        }
        let shop = ''
        for (let i = 0; i < data.length; i++) {
            shop += data[i].brandName + '\n'
        }
        // shop = shop.substring(0, shop.length - 2);
        $('#list-shop').text(shop)
    })
})
