var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true
})

$('#loading').css('display', 'block')
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
            <td>${formatShopName(data[i].name)}</td>
            <td>${data[i].customer_name}</td>
            <td>${getCarrierName(data[i].carrier_name)}</td>
            <td>${getCarrierCode(data[i].number_tracking)}</td>
            <td>${getCarrierCode(data[i].actual_input)}</td>
            <td>${formatOrderDate(data[i].order_date)}</td>
            <td>${data[i].order_status}</td>
            <td>${getEpochTime(data[i].time_add_tracking)}</td>
      </tr>`)
    }

    $('#table_id-tracking-history').DataTable({
        pageLength: 25,
        order: [[0, "desc"]],
    })
    $('#loading').css('display', 'none')
}

function formatShopName(shopName) {
    if (shopName == undefined) {
        return '---'
    }
}

function formatOrderDate(date) {
    if (date == undefined) {
        return '---'
    }
    return date.substring(5).split('.')[0].replace('-', '/')
}

function getCarrierCode(code) {
    if (code == undefined) {
        return '---'
    } else if (code.startsWith('9')) {
        return `<a href='https://tools.usps.com/go/TrackConfirmAction?tRef=fullpage&tLc=2&text28777=&tLabels=${code}' target='_blank'>${code}</a>`
    } else if (code.startsWith('1Z') || code.startsWith('8')) {
        return `<a href='https://www.ups.com/track?loc=null&tracknum=${code}&requester=WT/trackdetails' target='_blank'>${code}</a>`
    }
}

function getEpochTime(input) {
    if (input == undefined) {
        return '--/--/--'
    }
    var date = new Date(0)
    date.setUTCSeconds(input)
    time = String(date)
    time = time.split(' ')
    time = time[4] + ' ' + time[2] + '/' + convertMonthInString(time[1])
    return time
}

function getCarrierName(name) {
    if (name == undefined) {
        return '---'
    } return name
}

function convertMonthInString(month) {
    switch (month) {
        case 'Jan': return '01'
        case 'Feb': return '02'
        case 'Mar': return '03'
        case 'Apr': return '04'
        case 'May': return '05'
        case 'Jun': return '06'
        case 'Jul': return '07'
        case 'Aug': return '08'
        case 'Sep': return '09'
        case 'Oct': return '10'
        case 'Nov': return '11'
        case 'Dec': return '12'
    }
}