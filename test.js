const axios = require("axios")
const cheerio = require('cheerio')
ttt()
async function ttt() {
    try {

        let siteUrl = `https://www.etsy.com/search/shops?search_type=shop&search_query=KeresiSekicolo`
        let result = await getShopAvailable(siteUrl)
        result = result.replace('ressult', '').trim()
        if (parseInt(result) > 0) {
            siteUrl = `https://www.etsy.com/shop/KeresiSekicolo`
            result = await getShopAvailable2(siteUrl)
            console.log(result)
            if (parseInt(result) == 1) {
                siteUrl = `https://www.etsy.com/search?q=KeresiSekicolo`
                result = await getShopActuallyDie(siteUrl, 'KeresiSekicolo')
                if (parseInt(result) == 0) {
                    result = -1
                }
            }
        }
        console.log(result)
    } catch (error) {
        console.log(error)
    }
}

async function getShopAvailable(siteUrl) {
    const $ = await fetchData(siteUrl)
    if ($ == 0) {
        return 0
    }

    let shopName = $('#content').text()
    shopName = shopName.split('for shop names containing')
    shopName = shopName[0].slice(15)

    return shopName
}

async function getShopAvailable2(siteUrl) {
    const $ = await fetchData(siteUrl)
    if ($ == 0) {
        return 0
    }

    let shopName = $('#content').text()
    if (shopName.includes('is currently not selling on Etsy') || shopName.includes("We couldn't find any results")) {
        console.log('is currently not selling on Etsy')
        return 0
    }
    return 1
}

async function getShopActuallyDie(siteUrl, name) {
    const $ = await fetchData(siteUrl)
    if ($ == 0) {
        return 0
    }

    let shopName = $('#content').text()
    if (shopName.includes(name)) {
        return 1
    }
    return 0
}

async function fetchData(siteUrl) {
    let result

    try {
        result = await axios.get(siteUrl)
    } catch (err) {
        console.log('error get url')
        return 0
    }

    if (result == 404) {
        console.log('error 404')
        return 0
    }
    return cheerio.load(result.data)
}