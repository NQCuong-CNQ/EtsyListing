const axios = require("axios")
const cheerio = require('cheerio')

module.exports.getWebsite = async function (req, res) {
    try {
        let shopName = req.query.shop
        // console.log('check ' + shopName)

        let siteUrl = `https://www.etsy.com/shop/${shopName}`
        let result = await getShopAvailable(siteUrl, shopName)
        
        // console.log(result)
        res.send(result + '')
    } catch (error) {
        console.log(error)
    }
}


async function getShopAvailable(siteUrl, name) {
    const $ = await fetchData(siteUrl)
    if ($ == 0) {
        return -1
    }

    let shopName = $('#content').text()
    if (shopName.includes('is currently not selling on Etsy')) {
        return 0
    }

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
        // console.log('error get url')
        return 0
    }

    if (result == 404) {
        // console.log('error 404')
        return 0
    }
    return cheerio.load(result.data)
}