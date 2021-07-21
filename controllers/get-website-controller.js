const axios = require("axios")
const cheerio = require('cheerio')

module.exports.getWebsite = async function (req, res) {
    console.log(req)
    let shopName = req.query.shop
    console.log('check ' + shopName)
    let siteUrl = `https://www.etsy.com/search/shops?search_type=shop&search_query=${shopName}`
    let result = await getShopAvailable(siteUrl)
    console.log(result)
    res.send(result)
}

async function getShopAvailable(siteUrl) {
    const $ = await fetchData(siteUrl)
    if ($ == 0) {
        return 0
    }

    let shopName = $('#content').text()
    shopName = shopName.split('for shop names containing')
    shopName = shopName[0].slice(15).trim()

    return shopName
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