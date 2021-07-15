// ==UserScript==
// @name AZetsy
// @version 1.0.1
// @description Crawl, hijack, customize, edit, manage amazon products, manage and optimize amazon seller accounts
// @author @zickieloox
// @updateURL https://braumstar.com/js/extension/azetsy.user.js
// @match        https://www.etsy.com/your/*
// @match        https://app.customcat.com/*
// @require https://code.jquery.com/jquery-3.3.1.min.js
// @run-at document-idle
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_setClipboard
// ==/UserScript==

$('head').append('<div id="zicVersion">1.0.1</div>')
let oldTitle = $('title').eq(0).html()
let domainName = location.href

if (domainName.includes('/listings/create')) {
    $('title').eq(0).html('Loading Tools...')
    $.ajax({
        url: 'https://braumstar.com/js/extension/listing.js?v=',
        dataType: 'script',
        async: true
    }).done(function (data) {
        console.log('Guns are loaded!')
        $('title').eq(0).html(oldTitle)

        return
    }).fail(function () {
        alert('Something Wrong! Please contact the author (m.me/zickieloox) for more details.')

        // location.reload()
    })
} else if (domainName.includes('/orders/sold')) {
    $('title').eq(0).html('Loading Tools...')
    $.ajax({
        url: 'https://braumstar.com/js/extension/orders.js?v=',
        dataType: 'script',
        async: true
    }).done(function (data) {
        console.log('Guns are loaded!')
        $('title').eq(0).html(oldTitle)

        return
    }).fail(function () {
        alert('Something Wrong! Please contact the author (m.me/zickieloox) for more details.')

        // location.reload()
    })
} else if (domainName.includes('app.customcat.com/app/')) {
    $('title').eq(0).html('Loading Tools...')
    $.ajax({
        url: 'https://braumstar.com/js/extension/customcat.js?v=',
        dataType: 'script',
        async: true
    }).done(function (data) {
        console.log('Guns are loaded!')
        $('title').eq(0).html(oldTitle)

        return
    }).fail(function () {
        alert('Something Wrong! Please contact the author (m.me/zickieloox) for more details.')

        // location.reload()
    })
}
