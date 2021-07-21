const axios = require("axios")
const cheerio = require('cheerio')
ttt()
async function ttt() {
    try {
        let siteUrl = `https://www.etsy.com/shop/AndreaSelley`
        let result = await getShopActuallyDie(siteUrl)
        console.log(result)
        if (parseInt(result) == 1) {
            siteUrl = `https://www.etsy.com/search?q=AndreaSelley`
            result = await getShopActuallyDie(siteUrl)
            if (parseInt(result) == 1) {
                result = -1
            }
        }
        console.log(result)
    } catch (error) {
        console.log(error)
    }
}

async function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    )
}

async function getShopActuallyDie(siteUrl) {
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