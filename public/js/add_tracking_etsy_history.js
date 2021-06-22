var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true,
    transports: ['websocket']
})

var historyData = []
var isAddedChecked = true
var isMyAccount = true
var isTrangAccount = false
var isShowAll = false

$('#loading').css('display', 'block')

socket.emit("tracking-history-join")

let isAddedCheckedStorage = window.localStorage.getItem('is-tracking-history-checked')
if (isAddedCheckedStorage == 1) {
    $('#show-added-tracking').prop("checked", true)
    isAddedChecked = true
} else {
    $('#show-added-tracking').prop("checked", false)
    isAddedChecked = false
}

let isMyCheckedStorage = window.localStorage.getItem('is-my-account-checked')
if (isMyCheckedStorage == 1) {
    $('#show-my-account-tracking').prop("checked", true)
    isMyAccount = true
} else {
    $('#show-my-account-tracking').prop("checked", false)
    isMyAccount = false
}

let isTrangCheckedStorage = window.localStorage.getItem('is-trang-account-checked')
if (isTrangCheckedStorage == 1) {
    $('#show-trang-account-tracking').prop("checked", true)
    isTrangAccount = true
} else {
    $('#show-trang-account-tracking').prop("checked", false)
    isTrangAccount = false
}

socket.on("tracking-history-return-data", async function (data) {
    historyData = data
    filterData()
})

function filterData() {
    let filterData = historyData

    if (isMyAccount && isTrangAccount) {
    } else if (isMyAccount) {
        filterData = filterMyAccount(filterData)
    } else if (isTrangAccount) {
        filterData = filterTrangAccount(filterData)
    } else {
        filterData = []
    }

    if (isAddedChecked) {
        filterData = filterAdded(filterData)
    }

    filterData.sort(compareDay)
    updateData(filterData)
}

function filterTrangAccount(data) {
    let dataFilter = []
    for (var i = 0; i < data.length; i++) {
        if (data[i].user == 'Trang') {
            dataFilter.push(data[i])
        }
    }
    return dataFilter
}

function filterMyAccount(data) {
    let dataFilter = []
    for (var i = 0; i < data.length; i++) {
        if (data[i].user == 'My') {
            dataFilter.push(data[i])
        }
    }
    return dataFilter
}

$('#show-added-tracking').on('change', function () {
    if ($(this).prop("checked")) {
        isAddedChecked = true
        filterData()
        window.localStorage.setItem('is-tracking-history-checked', 1)
    }
    else {
        isAddedChecked = false
        filterData()
        window.localStorage.setItem('is-tracking-history-checked', 0)
    }
})


$('#show-my-account-tracking').on('change', function () {
    if ($(this).prop("checked")) {
        isMyAccount = true
        filterData()
        window.localStorage.setItem('is-my-account-checked', 1)
    }
    else {
        isMyAccount = false
        filterData()
        window.localStorage.setItem('is-my-account-checked', 0)
    }
})


$('#show-trang-account-tracking').on('change', function () {
    if ($(this).prop("checked")) {
        isTrangAccount = true
        filterData()
        window.localStorage.setItem('is-trang-account-checked', 1)
    }
    else {
        isTrangAccount = false
        filterData()
        window.localStorage.setItem('is-trang-account-checked', 0)
    }
})

$('#show-all-tracking').on('change', function () {
    if ($(this).prop("checked")) {
        $('#loading').css('display', 'block')
        socket.emit("tracking-history-get-all")
    }
    else {
        historyData.splice(0, historyData.length - 100)
        filterData()
    }
})

function filterAdded(data) {
    let dataFilter = []
    for (var i = 0; i < data.length; i++) {
        if (data[i].time_add_tracking !== undefined) {
            dataFilter.push(data[i])
        }
    }
    return dataFilter
}

function updateData(data = historyData) {
    $('#table_id-tracking-history').DataTable().clear().destroy()
    for (var i = 0; i < data.length; i++) {
        $('#table_id-tracking-history-body').append(`<tr>
            <td>${data[i].id}</td>
            <td>${formatShopName(data[i].name)}</td>
            <td>${formatCustomerName(data[i].customer_name)}</td>
            <td>${formatCustomerEmail(data[i].customer_email)}</td>
            <td>${getCarrierCode(data[i].number_tracking)}</td>
            <td>${getActualCarrierCode(data[i].number_tracking, data[i].actual_input)}</td>
            <td>${getCarrierName(data[i].number_tracking, data[i].carrier_name)}</td>
            <td>${formatOrderDate(data[i].order_date)}</td>
            <td>${formatOrderStatus(data[i].order_status)}</td>
            <td>${getEpochTime(data[i].time_add_tracking)}</td>
        </tr>`)
    }

    $('#table_id-tracking-history').DataTable({
        pageLength: 25,
        scrollX: 0,
        ordering: false
    })
    $('#loading').css('display', 'none')
}

function formatCustomerName(name) {
    if (name === undefined) {
        return '---'
    } return name
}

function formatOrderStatus(status) {
    if (status === undefined) {
        return '---'
    } return status
}

function formatCustomerEmail(email) {
    if (email === undefined) {
        return '---'
    } return email
}

function formatShopName(shopName) {
    if (shopName === undefined) {
        return '---'
    } return shopName
}

function formatOrderDate(date) {
    if (date === undefined) {
        return '---'
    }
    return date.substring(5).split('.')[0].replace('-', '/')
}

function getActualCarrierCode(code, actualCode) {
    if (actualCode === undefined || actualCode == '') {
        return '---'
    } else if (code == actualCode) {
        return `<p class="p-input-true">same</p>`
    }
    return `<p class="p-input-wrong">${actualCode}</p>`
}

function getCarrierCode(code) {
    if (code === undefined || code == '') {
        return '---'
    } else if (code.startsWith('9')) {
        return `<a href='https://tools.usps.com/go/TrackConfirmAction?tRef=fullpage&tLc=2&text28777=&tLabels=${code}' target='_blank'>${code}</a>`
    } else if (code.startsWith('1Z') || code.startsWith('8')) {
        return `<a href='https://www.ups.com/track?loc=null&tracknum=${code}&requester=WT/trackdetails' target='_blank'>${code}</a>`
    } return code
}

function compareDay(a, b) {
    const bandA = a.time_add_tracking
    const bandB = b.time_add_tracking
    return compareAction(bandA, bandB)
}

function compareAction(bandA, bandB) {
    bandA = parseFloat(bandA)
    bandB = parseFloat(bandB)
    let comparison = 0;
    if (bandA > bandB) {
        comparison = 1;
    } else if (bandA < bandB) {
        comparison = -1;
    }
    return comparison * -1;
}

function getEpochTime(input) {
    if (input === undefined) {
        return '-- / -- / --'
    }
    var date = new Date(0)
    date.setUTCSeconds(input)
    time = String(date)
    time = time.split(' ')
    time = time[4] + ' ' + time[2] + '/' + convertMonthInString(time[1])
    return time
}

function getCarrierName(track, name) {
    if (name === undefined || name == '') {
        return '---'
    } else if (track.startsWith('9') && name == 'USPS') {
        return `<p class="p-input-true">${name}</p>`
    } else if ((track.startsWith('8') || track.startsWith('1Z')) && name == 'UPS') {
        return `<p class="p-input-true">${name}</p>`
    }
    return `<p class="p-input-wrong">${name}</p>`
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
    } return month
}

$('#fix-tracking-history-btn').on('click', function () {
    this.classList.toggle("active-fix-tracking")
    var content = this.nextElementSibling
    if (content.style.display === "block") {
        content.style.display = "none"
    } else {
        content.style.display = "block"
    }
})

$('#submit-fix-btn').on('click', async function () {
    let fixData = new Object

    fixData['id'] = $('#id-fix-tracking-history').val().trim()
    if (fixData['id'] == '') {
        toastr.clear()
        toastr.warning('Vui lòng nhập ID !')
        return
    }

    if ($('#input-code-tracking-history').val() != '') {
        fixData['actual_input'] = $('#input-code-tracking-history').val().trim()
    }

    if ($('#input-carrier-tracking-history').val() != '') {
        fixData['carrier_name'] = $('#input-carrier-tracking-history').val().trim()
    }

    if (fixData['actual_input'] === undefined && fixData['carrier_name'] === undefined) {
        toastr.clear()
        toastr.warning('Vui lòng nhập Code hoặc Carrier !')
        return
    }

    socket.emit("fix-tracking-history", fixData)
})

$('#run-add-tracking-my-btn').on('click', async function () {
    socket.emit("run-add-tracking", 'My')
})

$('#run-add-tracking-trang-btn').on('click', async function () {
    socket.emit("run-add-tracking", 'Trang')
})

socket.on("return-fix-tracking-history", async function (data) {
    toastr.clear()
    toastr.success('Thành công!')
})

$('#check-limit-btn').on('click', async function () {
    socket.emit("check-limit-api")
})

socket.on("return-check-limit-api", async function (data) {
    let index = data.indexOf('x-ratelimit-remaining')
    data = data.slice(index, index + 28).trim()
    toastr.clear()
    toastr.success(data)
})

$('#refresh-btn').on('click', async function () {
    $('#loading').css('display', 'block')
    socket.emit("tracking-history-join")
})