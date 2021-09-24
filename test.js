
const axios = require("axios")
const cheerio = require('cheerio')
let listKeyWord = ["mug", "blanket", "tshirt", "canvas", "art print poster",
        "halloween canvas", "halloween tshirt", "halloween art print", "halloween mug", "halloween blanket",
        "fall season tshirt", "fall season canvas", "fall season art print", "fall season mug", "fall season blanket",
    ]

var siteUrl = `https://www.etsy.com/search?q=halloween_canvas&page=1&ref=pagination`
main()
async function main(){
  console.log(await getSearchProductFromWeb())
}

async function getSearchProductFromWeb() {
  const $ = await fetchData(siteUrl)
  
  if ($ == 0) {
      return 0
  }
  let searchProduct = $('[data-search-results]').html()
  if (searchProduct == '') {
      return 0
  }
  console.log(searchProduct)
  searchProduct = searchProduct.split('href="https://www.etsy.com/listing/')
  for (let i = 0; i < searchProduct.length; i++) {
      searchProduct[i] = searchProduct[i].substring(0, 12).split('/')[0]
  }

  searchProduct.shift()
  return searchProduct
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