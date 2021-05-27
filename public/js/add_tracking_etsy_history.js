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
            <td>${data[i].name}</td>
            <td>${getCarrierName(data[i].carrier_name)}</td>
            <td>${getCarrierCode(data[i].number_tracking)}</td>
            
            <td>${getEpochTime(data[i].time_add_tracking)}</td>
      </tr>`)
    }
//<td>${getCarrierCode(data[i].actual_input)}</td>
    $('#table_id-tracking-history').DataTable({
        pageLength: 25,
        order: [[0, "desc"]],
    })
    $('#loading').css('display', 'none')
}

function getCarrierCode(code) {
    if (code == undefined) {
        return 'Not saved yet'
    } else if (code.startWith('9')) {
        return `<a href='https://tools.usps.com/go/TrackConfirmAction?tRef=fullpage&tLc=2&text28777=&tLabels=${code}' target='_blank'>${code}</a>`
    } else if (code.startWith('1Z') || code.startWith('8')) {
        return `<a href='https://www.ups.com/track?loc=null&tracknum=${code}&requester=WT/trackdetails' target='_blank'>${code}</a>`
    }
}

function getEpochTime(input) {
    var date = new Date(0)
    date.setUTCSeconds(input)
    time = String(date)
    time = time.split(' ')
    time = time[4] + ' ' + time[2] + '/' + convertMonthInString(time[1])
    return time
}

function getCarrierName(name) {
    if (name == undefined) {
        return 'Not saved yet'
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