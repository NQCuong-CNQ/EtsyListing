$('#btn-ok').on('click', function(){
    $('.first-page').css('display', 'none')
    $('.second-page').css('display', 'block')
})

$('#you-wish-btn').on('mousedown', function(){
    let x = Math.random(300) * 100
    let y = Math.random(200) * 100
    $('#you-wish-btn').css('transform', `translate(${x}px,${y}px)`)
})  