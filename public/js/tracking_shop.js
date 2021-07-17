var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true,
    transports: ['websocket']
})

var shopData, chart, selected_shop, category = 'Canvas',
    timeCreatedShopFilter, salesLargerThan = null, monthFilterShop = null, filterType = 0, searchShop = null,
    pag_num = 1, total = 0, num_per_pag = 10, sort_by = 1

IsJsonString = str => {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}

$('#listing-back-btn').on('click', () => {
    $('#list-shop-section').css("display", "block")
    $('#listing-shop-section').css("display", "none")
    $('#user-shop-section').css("display", "none")
    $('#table-list').empty()
})

$('#user-back-btn').on('click', () => {
    $('#list-shop-section').css("display", "block")
    $('#listing-shop-section').css("display", "none")
    $('#user-shop-section').css("display", "none")
})

$('#pod-type-product-filter').on('click', () => {
    filterType = 0
    $('#dropdown-filter-type-product').text('POD')
    searchOrFilterData()
})

$('#digital-type-product-filter').on('click', () => {
    filterType = 1
    $('#dropdown-filter-type-product').text('Digital')
    searchOrFilterData()
})

// searchLocalShop = shopName => {
//     let shop = []
//     for (let item of shopData) {
//         if (item.shop_name.toLowerCase().includes(shopName)) {
//             shop.push(item)
//         }
//     }

//     return shop
// }

$('#find-shop-by-name').on('change', () => {
    searchShop = $('#find-shop-by-name').val().trim()
    searchOrFilterData()
})

getDayTimeLife = creation_time => {
    let timeNow = new Date().getTime()
    let life_time = ~~(timeNow / 1000) - creation_time
    return ~~(life_time / 86400)
}

getAvgSales = (total_sales, creation_time) => {
    let avgSales = total_sales / getDayTimeLife(creation_time)
    return avgSales.toFixed(2)
}

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
    }
}

getEpochTime = input => {
    var date = new Date(0)
    date.setUTCSeconds(input)
    time = String(date)
    time = time.split(' ')
    time = `${time[2]}-${convertMonthInString(time[1])}-${time[3]}`
    return time
}

getUpdateHistoryEpoch = input => {
    var date = new Date(0)
    date.setUTCSeconds(input)
    time = String(date)
    time = time.split(' ')
    time = time[2] + '/' + convertMonthInString(time[1]) + ' ' + time[4]
    return time
}

getEpochTimeChart = input => {
    var date = new Date(0)
    date.setUTCSeconds(input)
    time = String(date)
    time = time.split(' ')
    time = time[2] + '/' + convertMonthInString(time[1])
    return time
}

// timeCreatedShopFilterAction = dataFilter => {
//     let shopTimeDataFilter = [], daysInTime = 0

//     if (timeCreatedShopFilter == 1) {
//         daysInTime = 30
//     } else if (timeCreatedShopFilter == 2) {
//         daysInTime = 91
//     } else if (timeCreatedShopFilter == 3) {
//         daysInTime = 182
//     }

//     for (let item of dataFilter) {
//         if (getDayTimeLife(item.creation_tsz) <= daysInTime) {
//             shopTimeDataFilter.push(item)
//         }
//     }

//     return shopTimeDataFilter
// }

getMonthTime = input => {
    var date = new Date(0)
    date.setUTCSeconds(input)
    time = String(date)
    time = time.split(' ')
    time = convertMonthInString(time[1])
    return parseInt(time)
}

// timeCreatedShopFilterCustom = data => {
//     let filterData = []
//     let dateRange = $('#dropdown-filter-shop-time-created').text().split(' to ')

//     let dateFrom = new Date(dateRange[0]).getTime()
//     let dateTo = new Date(dateRange[1]).getTime()

//     for (let item of data) {
//         if (item.creation_tsz >= ~~(dateFrom / 1000) && item.creation_tsz <= ~~(dateTo / 1000)) {
//             filterData.push(item)
//         }
//     }

//     return filterData
// }

// getShopNameByID = id => {
//     for (let item of shopData) {
//         if (item.shop_id == id) {
//             return item.shop_name
//         }
//     }

//     return 'Shop'
// }

getShopUserByID = id => {
    for (let item of shopData) {
        if (item.shop_id == id) {
            return item.user_id
        }
    }

    return null
}

showShopChart = data => {
    $('#loading').css('display', 'none')
    $('.popup-analytic-container').css('display', 'block')
    $('.popup-analytic-background').css('display', 'block')

    var ctx = document.getElementById("chart-total-sales").getContext("2d")
    var gradientblue = ctx.createLinearGradient(0, 0, 0, 225)
    gradientblue.addColorStop(0, "rgba(6,91,249,0.3)")
    gradientblue.addColorStop(1, "rgba(6,91,249, 0)")
    var gradientred = ctx.createLinearGradient(0, 0, 0, 225)
    gradientred.addColorStop(0, "rgba(255,0,40,0.3)")
    gradientred.addColorStop(1, "rgba(255,0,40, 0)")
    var gradientgreen = ctx.createLinearGradient(0, 0, 0, 225)
    gradientgreen.addColorStop(0, "rgba(47,208,87,0.3)")
    gradientgreen.addColorStop(1, "rgba(47,208,87, 0)")

    let label = [], total_sales = [], num_favorers = [], listing_active_count = []

    for (let item of data) {
        label.push(getEpochTimeChart(item.time_update))
        total_sales.push(item.total_sales)
        num_favorers.push(item.num_favorers)
        listing_active_count.push(item.listing_active_count)
    }

    chart = new Chart(document.getElementById("chart-total-sales"), {
        type: "line",
        data: {
            labels: label,
            datasets: [{
                label: "Total Sales",
                fill: true,
                backgroundColor: gradientblue,
                borderColor: window.theme.primary,
                data: total_sales,
            }, {
                label: "Num Favorers",
                fill: true,
                backgroundColor: gradientred,
                borderColor: 'red',
                data: num_favorers,
            }, {
                label: "Listing Active Count",
                fill: true,
                backgroundColor: gradientgreen,
                borderColor: 'green',
                data: listing_active_count,
            }]
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            tooltips: {
                intersect: false
            },
            hover: {
                intersect: true
            },
            plugins: {
                filler: {
                    propagate: false
                }
            },
            scales: {
                xAxes: [{
                    reverse: true,
                    gridLines: {
                        color: "rgba(0,0,0,0.0)"
                    }
                }],
                yAxes: [{
                    ticks: {
                        stepSize: 1000
                    },
                    display: true,
                    borderDash: [3, 3],
                    gridLines: {
                        color: "rgba(0,0,0,0.0)"
                    }
                }]
            }
        }
    })
}

getShopDetail = (id, shopName) => {
    selected_shop = id
    $('#loading').css('display', 'block')

    try {
        $.ajax({
            url: '/tracking-shop/get-shop-tracking',
            type: "get",
            contentType: "application/json",
            dataType: "json",
            data: {
                shop_id: id,
            },
            success: function (data) {
                showShopChart(data.data)
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR, textStatus, errorThrown)
            }
        })
    } catch (err) {
        console.log(err)
    }

    $('#shop-name-chart').text(`${shopName} Analytics`)
}

updateData = (data = shopData) => {
    try {
        $('#table-shop-body').empty()
        for (let item of data) {
            $('#table-shop-body').append(`<tr>
            <td onclick="getShopDetail(${item.shop_id}, ${item.shop_name})"><i class="fas fa-info-circle pointer"></i></td>
            <td>
            <a href="${item.url}" target="_blank">${item.shop_name}
                <div> 
                <img src="${item.imgs_listing[0]}" loading="lazy" alt="Empty" width="70px" height="70px">
                <img src="${item.imgs_listing[1]}" loading="lazy" alt="Empty" width="70px" height="70px">
                <img src="${item.imgs_listing[2]}" loading="lazy" alt="Empty" width="70px" height="70px">
                <img src="${item.imgs_listing[3]}" loading="lazy" alt="Empty" width="70px" height="70px">
                </div>
                <div class="mt-1">
                <img src="${item.imgs_listing[4]}" loading="lazy" alt="Empty" width="70px" height="70px">
                <img src="${item.imgs_listing[5]}" loading="lazy" alt="Empty" width="70px" height="70px">
                <img src="${item.imgs_listing[6]}" loading="lazy" alt="Empty" width="70px" height="70px">
                <img src="${item.imgs_listing[7]}" loading="lazy" alt="Empty" width="70px" height="70px">
                </div>
            </a>
            </td>
            <td>${getAvgSales(item.total_sales, item.creation_tsz)}</td>
            <td>${item.total_sales.toLocaleString()}</td>
            <td>${item.num_favorers.toLocaleString()}</td>
            <td>${getEpochTime(item.creation_tsz)}</td>
            <td>${item.listing_active_count.toLocaleString()}</td>
            <td>${item.digital_listing_count.toLocaleString()}</td>
            <td>${item.currency_code}</td>
            <td>${item.languages}</td>
        </tr>`)
        }

        let start_pos = num_per_pag * (pag_num - 1) + 1
        let end_pos = num_per_pag * pag_num > total ? total : num_per_pag * pag_num
        $('#total-table').text(`Showing ${start_pos} - ${end_pos} of ${total} rows`)
        updatePag()
    } catch (err) {
        console.log(err)
    }
}

getData = (offset) => {
    try {
        $.ajax({
            url: '/tracking-shop/getAll',
            type: "get",
            contentType: "application/json",
            dataType: "json",
            data: {
                offset: offset,
                limit: num_per_pag,
                type: filterType,
                category: category,
                month: monthFilterShop,
                sales: salesLargerThan,
                search: searchShop,
                sort_by: sort_by,
            },
            success: function (data) {
                $('#loading').css('display', 'none')
                total = data.total

                if (data.isSearch == 1 && data.total == 0) {

                    return
                }
                updateData(data.shopData)
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR, textStatus, errorThrown)
            }
        })
    } catch (err) {
        console.log(err)
    }
}

searchOrFilterData = () => {
    $('#loading').css('display', 'block')
    let offset = (pag_num - 1) * num_per_pag
    getData(offset)
}

searchOrFilterData()

getListingOption = id => {
    socket.emit("get_listing_shop_id", id)
    $('#loading').css('display', 'block')
    $('#title-page').text('Listing Detail')
    $('#list-shop-section').css("display", "none")
    $('#listing-shop-section').css("display", "block")
    $('#user-shop-section').css("display", "none")
}

getUserOption = id => {
    socket.emit("get_user_by_user_id", shopData.find(({ shop_id }) => shop_id == id).user_id)
    $('#loading').css('display', 'block')
    $('#title-page').text('User Detail')
    $('#list-shop-section').css("display", "none")
    $('#listing-shop-section').css("display", "none")
    $('#user-shop-section').css("display", "block")
}

$('#listing-option-button').on('click', () => {
    getListingOption(selected_shop)
    $('.popup-analytic-container').css('display', 'none')
    $('.popup-analytic-background').css('display', 'none')
    chart.destroy()
})

$('#user-option-button').on('click', () => {
    getUserOption(selected_shop)
    $('.popup-analytic-container').css('display', 'none')
    $('.popup-analytic-background').css('display', 'none')
    chart.destroy()
})

// let shopLocalData = window.localStorage.getItem('listing-shop')

// socket.on("return-shop-data", data => {
//     shopData = data
//     $('#loading').css('display', 'none')
//     searchOrFilterData()

//     let temp
//     let tempData = []

//     for (let i = 0; i < data.length; i++) {
//         if (i > 1500) {
//             break
//         }

//         temp = new Object()
//         temp['shop_name'] = data[i].shop_name
//         temp['url'] = data[i].url
//         temp['imgs_listing'] = data[i].imgs_listing
//         temp['total_sales'] = data[i].total_sales
//         temp['num_favorers'] = data[i].num_favorers
//         temp['creation_tsz'] = data[i].creation_tsz
//         temp['digital_listing_count'] = data[i].digital_listing_count
//         temp['listing_active_count'] = data[i].listing_active_count
//         temp['currency_code'] = data[i].currency_code
//         temp['shop_id'] = data[i].shop_id
//         temp['languages'] = data[i].languages
//         tempData[i] = temp
//     }

//     toastr.clear()
//     toastr.success('Data Updated')

//     try {
//         window.localStorage.setItem('listing-shop', JSON.stringify(tempData))
//     } catch (error) {
//         console.log(error)
//     }

//     socket.emit("get-total-shop")
// })

socket.on("return-find-shop-by-name", data => {
    $('#loading').css('display', 'none')
    if (data != 0) {
        updateData(data)

        var date = new Date().getTime()
        date = ~~(date / 1000) - (547 * 86400)

        if (data[0].creation_tsz < date) {
            toastr.clear()
            toastr.warning(`Can not save for tracking! \n Shop ${data[0].shop_name} has creation time more than 1.5 years`, { timeOut: 8000 })
        } else if (data[0].total_sales < 10) {
            toastr.clear()
            toastr.warning(`Can not save for tracking! \n Shop ${data[0].shop_name} has total sales less than 10`, { timeOut: 8000 })
        } else if (data[0].total_sales > 5000) {
            toastr.clear()
            toastr.warning(`Can not save for tracking! \n Shop ${data[0].shop_name} has total sales more than 5000`, { timeOut: 8000 })
        } else {
            toastr.clear()
            toastr.success(`Save ${data[0].shop_name} for tracking!`)
        }
    } else {
        toastr.clear()
        toastr.error('This shop is not available')
        $('#find-shop-by-name').val('')
    }
})

$('#btn-close-chart').on('click', () => {
    $('.popup-analytic-container').css('display', 'none')
    $('.popup-analytic-background').css('display', 'none')
    chart.destroy()
})

$('.popup-analytic-background').on('click', () => {
    $('.popup-analytic-container').css('display', 'none')
    $('.popup-analytic-background').css('display', 'none')
    chart.destroy()
})

socket.on("return-user-data", data => {
    $('#loading').css('display', 'none')
    $('#user_img').attr('src', data.image_url_75x75)
    $('#user_id').text(data.user_id)
    $('#user_bio').text(data.bio)
    $('#user_birth_day').text(data.birth_day)
    $('#user_birth_month').text(data.birth_month)
    $('#user_city').text(data.city)
    $('#user_country_id').text(data.country_id)
    $('#user_fname').text(data.first_name)
    $('#user_lname').text(data.last_name)
    $('#user_avata').text(data.image_url_75x75)
    $('#user_creation_time').text(data.join_tsz)
    $('#user_location').text(data.location)
    $('#user_region').text(data.region)
    $('#user_buy_count').text(data.transaction_buy_count.toLocaleString())
    $('#user_sold_count').text(data.transaction_sold_count.toLocaleString())
})

socket.on("return-listing-data", data => {
    $('#loading').css('display', 'none')
    for (let i = 0; i < data.length; i++) {
        let taxonomy = data[i].taxonomy_path
        taxonomy = taxonomy[taxonomy.length - 1]
        $('#table-list').append(`<tr>
          <td>${i + 1}</td>
          <td><a href='${data[i].url}' target="_blank">${data[i].title}</a></td>
          <td>${taxonomy}</td>
          <td>${data[i].price.toLocaleString()}</td>
          <td>${getEpochTime(data[i].creation_tsz)}</td>
          <td>${data[i].views.toLocaleString()}</td>
          <td>${data[i].num_favorers.toLocaleString()}</td>
          <td>${data[i].quantity.toLocaleString()}</td>
          <td>${data[i].listing_id}</td>
        </tr>`)
    }
})

$('#find-shop-by-name').on('change', e => {
    if (e.key == 'Enter') {
        $('#find-shop-by-name-button').trigger('click')
    }
})

$('#all-shop-filter').on('click', () => {
    category = null
    $('#dropdown-filter-shop').text('All')
    searchOrFilterData()
})

$('#canvas-shop-filter').on('click', () => {
    category = 'Canvas'
    $('#dropdown-filter-shop').text(category)
    searchOrFilterData()
})

$('#shirt-shop-filter').on('click', () => {
    category = 'Shirt'
    $('#dropdown-filter-shop').text(category)
    searchOrFilterData()
})

$('#mug-shop-filter').on('click', () => {
    category = 'Mug'
    $('#dropdown-filter-shop').text(category)
    searchOrFilterData()
})

$('#blanket-shop-filter').on('click', () => {
    category = 'Blanket'
    $('#dropdown-filter-shop').text(category)
    searchOrFilterData()
})

$('#tumbler-shop-filter').on('click', () => {
    category = 'Tumbler'
    $('#dropdown-filter-shop').text(category)
    searchOrFilterData()
})

// $('#all-time-created-shop-filter').on('click', () => {
//     timeCreatedShopFilter = 0
//     $('#dropdown-filter-shop-time-created').text('All')
//     searchOrFilterData()
// })

// $('#1m-time-created-shop-filter').on('click', () => {
//     timeCreatedShopFilter = 1
//     $('#dropdown-filter-shop-time-created').text('In 1 months')
//     searchOrFilterData()
// })

// $('#3m-time-created-shop-filter').on('click', () => {
//     timeCreatedShopFilter = 2
//     $('#dropdown-filter-shop-time-created').text('In 3 months')
//     searchOrFilterData()
// })

// $('#6m-time-created-shop-filter').on('click', () => {
//     timeCreatedShopFilter = 3
//     $('#dropdown-filter-shop-time-created').text('In 6 months')
//     searchOrFilterData()
// })

// $('#custom-time-created-shop-filter').daterangepicker({
//     "showDropdowns": true,
//     "minYear": 2010,
//     "maxYear": parseInt(moment().format('YYYY'), 10),
//     "startDate": moment().format('MM-DD-YYYY'),
//     "opens": "center"
// }, function (start, end, label) {
//     timeCreatedShopFilter = 'custom'
//     $('#dropdown-filter-shop-time-created').text(start.format('MM-DD-YYYY') + ' to ' + end.format('MM-DD-YYYY'))
//     searchOrFilterData()
// })

$('#sales-larger-than').on('change', () => {
    salesLargerThan = $('#sales-larger-than').val().trim()
    if (salesLargerThan == '') {
        salesLargerThan = 0
        searchOrFilterData()
    } else {
        salesLargerThan = parseInt(salesLargerThan)
        if (Number.isInteger(salesLargerThan) == false) {
            toastr.clear()
            toastr.warning('Please input a number !')
            $('#sales-larger-than').val('')
        } else if (salesLargerThan < 10) {
            salesLargerThan = 0
            searchOrFilterData()
        } else {
            searchOrFilterData()
        }
    }
})

$('#month-filter-shop').on('change', () => {
    monthFilterShop = $('#month-filter-shop').val().trim()
    if (monthFilterShop == '') {
        monthFilterShop = 0
        searchOrFilterData()
    } else {
        monthFilterShop = parseInt(monthFilterShop)
        if (Number.isInteger(monthFilterShop) && monthFilterShop >= 1 && monthFilterShop <= 12) {
            searchOrFilterData()
        } else {
            toastr.clear()
            toastr.warning('Please input a valid number!')
            $('#month-filter-shop').val('')
        }
    }
})

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

$('#first-pag').on('click', () => {
    pag_num = 1
    searchOrFilterData()
})

$('#prev-pag').on('click', () => {
    pag_num--
    searchOrFilterData()
})

$('#next-pag').on('click', () => {
    pag_num++
    searchOrFilterData()
})

$('#last-pag').on('click', () => {
    pag_num = ~~(total / num_per_pag) + 1
    searchOrFilterData()
})

$('#sort-by-sales-day').on('click', () => {
    sort_by = 1
    $('#dropdown-filter-sort-by').text('Sales/Day')
    searchOrFilterData()
})

$('#sort-by-total-sales').on('click', () => {
    sort_by = 2
    $('#dropdown-filter-sort-by').text('Total Sales')
    searchOrFilterData()
})

$('#sort-by-creation-time').on('click', () => {
    sort_by = 3
    $('#dropdown-filter-sort-by').text('Creation Time')
    searchOrFilterData()
})

$('#sort-by-num-favorers').on('click', () => {
    sort_by = 4
    $('#dropdown-filter-sort-by').text('Num Favorers')
    searchOrFilterData()
})

$('#sort-by-listing-count').on('click', () => {
    sort_by = 5
    $('#dropdown-filter-sort-by').text('Listing Count')
    searchOrFilterData()
})
