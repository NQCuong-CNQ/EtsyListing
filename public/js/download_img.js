var imgs = document.images
var arrImgs = []
for (let i = 0; i < imgs.length; i++) {
    if (imgs[i].offsetWidth > 250 && imgs[i].offsetHeight > 250) {
        console.log(imgs[i].currentSrc)
        arrImgs.push(imgs[i].currentSrc)
    }
}
for (let i = 0; i < arrImgs.length; i++) {
    $('body').prepend(`<img src="${arrImgs[i]}" width="200" height="200">`)
}