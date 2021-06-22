// ==UserScript==
// @name         CustomCat
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Cuong
// @match        https://app.customcat.com/app/102401/main/vieworders
// @match        https://app.customcat.com/signi*
// @match        https://app.customcat.com/account/dashboard
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.min.js
// ==/UserScript==

(function() {
    'use strict';

    var socket = io.connect("https://giftsvk.com", {
        port: 443,
        reconnect: true,
        transports: ['websocket']
    })
    //tét update
    console.log('Getting data...')

    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    var date = new Date()
    var end = date.toLocaleDateString("en-US", options)
    date.setDate(date.getDate() - 10)
    var start = date.toLocaleDateString("en-US", options)

    console.log(end + start)
    getData()

    setInterval(scheduleUpdate, 14400000) // 4h
    function scheduleUpdate() {
        location.href = 'https://app.customcat.com/app/102401/main/vieworders'
    }

    socket.on("run-add-tracking-by-user", async function (user) {
        if(user == 'Trang'){
            location.href = 'https://app.customcat.com/app/102401/main/vieworders'
        }
    })

    async function getData() {
        await sleep(5000)

        if(location.href.includes("https://app.customcat.com/signin")){
            $('#signin-form button').trigger('click')
            await sleep(3000)
            if(location.href.includes("https://app.customcat.com/signin")){
                $('#email').val('nlhtrang2209@gmail.com')
                await sleep(500)
                $('#password').val('vikingteam')
                await sleep(500)
                $('#signin-form button').trigger('click')
            }
            return
        } else if(location.href.includes("https://app.customcat.com/account/dashboard")){
            location.href = 'https://app.customcat.com/app/102401/main/vieworders'
            return
        }

        $.ajax({
            url: `https://app.customcat.com/app/102401/order/exportorders?start_date=${start}&end_date=${end}`,
            success: async function (result) {
                let userData = new Object
                userData['data'] = result
                userData['name'] = 'Trang'
                await socket.emit("track-order-join", userData)
                console.log('Data sent to server successful')
            }
        })
    }

    async function sleep(ms) {
        return new Promise(
            resolve => setTimeout(resolve, ms)
        );
    }
})();