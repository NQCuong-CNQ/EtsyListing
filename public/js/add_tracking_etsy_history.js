var isAddedChecked = true, isMyAccount = true,
    isTrangAccount = false, isShowAll = false,
    num_per_pag = 25, pag_num = 1, total = 0, search = null, search_by = 1

$('#loading').css('display', 'block')

convertMonthInString = month => {
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

getEpochTime = input => {
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

getCarrierName = (track, name) => {
    if (name === undefined || name == '') {
        return '---'
    } else if (track.startsWith('9') && name == 'USPS') {
        return `<p class="p-input-true">${name}</p>`
    } else if ((track.startsWith('8') || track.startsWith('1Z')) && name == 'UPS') {
        return `<p class="p-input-true">${name}</p>`
    }
    return `<p class="p-input-wrong">${name}</p>`
}

let isAddedCheckedStorage = window.localStorage.getItem('is-tracking-history-checked')
if (isAddedCheckedStorage == 1) {
    $('#show-added-tracking').prop("checked", true)
    isAddedChecked = true
} else if (isAddedCheckedStorage == 0) {
    $('#show-added-tracking').prop("checked", false)
    isAddedChecked = false
}

let isMyCheckedStorage = window.localStorage.getItem('is-my-account-checked')
if (isMyCheckedStorage == 1) {
    $('#show-my-account-tracking').prop("checked", true)
    isMyAccount = true
} else if (isMyCheckedStorage == 0) {
    $('#show-my-account-tracking').prop("checked", false)
    isMyAccount = false
}

let isTrangCheckedStorage = window.localStorage.getItem('is-trang-account-checked')
if (isTrangCheckedStorage == 1) {
    $('#show-trang-account-tracking').prop("checked", true)
    isTrangAccount = true
} else if (isTrangCheckedStorage == 0) {
    $('#show-trang-account-tracking').prop("checked", false)
    isTrangAccount = false
}

getData = (offset, limit, showAccount) => {
    try {
        $.ajax({
            url: '/add_tracking_history/getAll',
            type: "get",
            contentType: "application/json",
            dataType: "json",
            data: {
                offset: offset,
                limit: limit,
                showAdded: isAddedChecked,
                showAccount: showAccount,
                search: search,
                searchBy: search_by,
            },
            success: function (data) {
                total = data.total
                updateData(data.data)
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR, textStatus, errorThrown)
            }
        })
    } catch (err) {
        console.log(err)
    }
}

filterData = () => {
    let offset = num_per_pag * (pag_num - 1), limit = num_per_pag, showAccount = null
    $('#loading').css('display', 'block')

    if (isMyAccount && isTrangAccount) {
        showAccount = null
    } else if (isMyAccount) {
        showAccount = 'My'
    } else if (isTrangAccount) {
        showAccount = 'Trang'
    } else {
        showAccount = ' '
    }

    getData(offset, limit, showAccount)
}

$(function () {
    filterData()
}

$('#show-added-tracking').on('change', () => {
    if ($('#show-added-tracking').prop("checked")) {
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

$('#show-my-account-tracking').on('change', () => {
    if ($('#show-my-account-tracking').prop("checked")) {
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

$('#show-trang-account-tracking').on('change', () => {
    if ($('#show-trang-account-tracking').prop("checked")) {
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

formatCustomerName = name => {
        if (name === undefined) {
            return '---'
        } return name
    }

formatOrderStatus = status => {
        if (status === undefined) {
            return '---'
        } return status
    }

formatCustomerEmail = email => {
        if (email === undefined) {
            return '---'
        } return email
    }

formatShopName = shopName => {
        if (shopName === undefined) {
            return '---'
        } return shopName
    }

formatOrderDate = date => {
        if (date === undefined) {
            return '---'
        }
        return date.substring(5).split('.')[0].replace('-', '/')
    }

getActualCarrierCode = (code, actualCode) => {
        if (actualCode === undefined || actualCode == '') {
            return '---'
        } else if (code == actualCode) {
            return `<p class="p-input-true">same</p>`
        }
        return `<p class="p-input-wrong">${actualCode}</p>`
    }

getCarrierCode = code => {
        if (code === undefined || code == '') {
            return '---'
        } else if (code.startsWith('9')) {
            return `<a href='https://tools.usps.com/go/TrackConfirmAction?tRef=fullpage&tLc=2&text28777=&tLabels=${code}' target='_blank'>${code}</a>`
        } else if (code.startsWith('1Z') || code.startsWith('8')) {
            return `<a href='https://www.ups.com/track?loc=null&tracknum=${code}&requester=WT/trackdetails' target='_blank'>${code}</a>`
        } return code
    }

updateData = (data) => {
        $('#table_id-tracking-history-body').empty()
        for (let item of data) {
            $('#table_id-tracking-history-body').append(`<tr>
            <td>${item.id}</td>
            <td>${formatShopName(item.name)}</td>
            <td>${formatCustomerName(item.customer_name)}</td>
            <td>${formatCustomerEmail(item.customer_email)}</td>
            <td>${getCarrierCode(item.number_tracking)}</td>
            <td>${getActualCarrierCode(item.number_tracking, item.actual_input)}</td>
            <td>${getCarrierName(item.number_tracking, item.carrier_name)}</td>
            <td>${formatOrderDate(item.order_date)}</td>
            <td>${formatOrderStatus(item.order_status)}</td>
            <td>${getEpochTime(item.time_add_tracking)}</td>
        </tr>`)
        }
        $('#loading').css('display', 'none')

        let start_pos = num_per_pag * (pag_num - 1) + 1
        let end_pos = num_per_pag * pag_num > total ? total : num_per_pag * pag_num
        $('#total-table').text(`Showing ${start_pos} - ${end_pos} of ${total} rows`)
        updatePag()
    }

updatePag = () => {
        $('#num-pag').text(`${pag_num}`)
        $('#first-pag').removeClass('pag_disabled')
        $('#prev-pag').removeClass('pag_disabled')
        $('#last-pag').removeClass('pag_disabled')
        $('#next-pag').removeClass('pag_disabled')

        if (pag_num == 1) {
            $('#first-pag').addClass('pag_disabled')
            $('#prev-pag').addClass('pag_disabled')
        }
        if (pag_num == ~~(total / num_per_pag) + 1) {
            $('#last-pag').addClass('pag_disabled')
            $('#next-pag').addClass('pag_disabled')
        }
    }

$('#search').on('change', () => {
        search = $('#search').val().trim()
        filterData()
    })

$('#first-pag').on('click', () => {
        pag_num = 1
        filterData()
    })

$('#prev-pag').on('click', () => {
        pag_num--
        filterData()
    })

$('#next-pag').on('click', () => {
        pag_num++
        filterData()
    })

$('#last-pag').on('click', () => {
        pag_num = ~~(total / num_per_pag) + 1
        filterData()
    })

$('#fix-tracking-history-btn').on('click', () => {
        $('#fix-tracking-history-btn').toggleClass("active-fix-tracking")
        let content = $('#fix-tracking-history-btn').next()
        if (content.css("display") === "block") {
            content.css("display", "none")
        } else {
            content.css("display", "block")
        }
    })

$('#submit-fix-btn').on('click', () => {
        let id, actual_input, carrier_name

        id = $('#id-fix-tracking-history').val().trim()
        if (id == '') {
            toastr.clear()
            toastr.warning('Vui lòng nhập ID !')
            return
        }

        if ($('#input-code-tracking-history').val() != '') {
            actual_input = $('#input-code-tracking-history').val().trim()
        }

        if ($('#input-carrier-tracking-history').val() != '') {
            carrier_name = $('#input-carrier-tracking-history').val().trim()
        }

        if (actual_input === undefined && carrier_name === undefined) {
            toastr.clear()
            toastr.warning('Vui lòng nhập Code hoặc Carrier !')
            return
        }

        toastr.clear()
        toastr.success('Processing...')

        try {
            $.ajax({
                url: '/add_tracking_history/fix',
                type: "get",
                contentType: "application/json",
                dataType: "json",
                data: {
                    id: id,
                    actual_input: actual_input,
                    carrier_name: carrier_name,
                },
                success: function (data) {
                    toastr.clear()
                    toastr.success('Done!')
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    console.log(jqXHR, textStatus, errorThrown)
                }
            })
        } catch (err) {
            console.log(err)
        }
    })


$('#search-by-id').on('click', () => {
        $('#search-by').text('Order ID')
        search_by = 1
        filterData()
    })

$('#search-by-shop').on('click', () => {
        $('#search-by').text('Shop Name')
        search_by = 2
        filterData()
    })

$('#search-by-customer').on('click', () => {
        $('#search-by').text('Customer Name')
        search_by = 3
        filterData()
    })

