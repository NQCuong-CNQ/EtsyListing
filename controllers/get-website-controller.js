const axios = require("axios")
const cheerio = require('cheerio')

module.exports.getWebsite = async function (req, res) {
    try {
        let shopName = req.query.shop
        console.log('check ' + shopName)
        let siteUrl = `https://www.etsy.com/search/shops?search_type=shop&search_query=${shopName}`
        let result = await getShopAvailable(siteUrl)
        result = result.replace('ressult', '').trim()
        console.log(result)
        if (result > 0) {
            siteUrl = `https://www.etsy.com/search/shop/${shopName}`
            result = await getShopActuallyDie(siteUrl)
            if(result == 1){
                res.send(0)
            } else {
                res.send(1)
            }
        } else {
            res.send(0)
        }
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

async function getShopActuallyDie(siteUrl) {
    const $ = await fetchData(siteUrl)
    if ($ == 0) {
        return 0
    }

    let shopName = $('#content').text()
    if(shopName.includes('is currently not selling on Etsy')){
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