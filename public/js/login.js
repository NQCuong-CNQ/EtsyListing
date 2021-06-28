var input = $('.validate-input .input');

$('.js-tilt').tilt({
    scale: 1.1
})

$('.validate-form .input').each(function () {
    $(this).on('focus', function () {
        hideValidate(this);
    });
});

function showValidate(input) {
    var thisAlert = $(input).parent();

    $(thisAlert).addClass('alert-validate');
}

function hideValidate(input) {
    var thisAlert = $(input).parent();

    $(thisAlert).removeClass('alert-validate');
}
