var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true
})

socket.emit("tracking-history-join")

socket.on("tracking-history-return-data", async function (data) {
    updateData(data)
})

function updateData(data) {
    $('#table_id-tracking-history').DataTable().clear().destroy()
    for (var i = 0; i < data.length; i++) {
        $('#table_id-tracking-history-body').append(`<tr>
            <td>${i}</td>
            <td>${data[i].id}</td>
            <td>${data[i].name}</td>
            <td>${data[i].number_tracking}</td>
            <td>${data[i].time_add_tracking}</td>
      </tr>`)
    }

    $('#table_id-tracking-history').DataTable({
        pageLength: 25,
        order: [[0, "desc"]],
    })
}
