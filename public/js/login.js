var input = $('.validate-input .input');

$('.js-tilt').tilt({
    scale: 1.1
})

$('.login-form-btn').on('click', () => {
    try {
        $.ajax({
            url: '/login',
            type: "post",
            contentType: "application/json",
            dataType: "json",
            data: {
                user_name: $('#user_name').val().trim(),
                password: $('#password').val().trim(),
            },
            success: function (data) {
                document.cookie = `token=${data.token}`
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.log(jqXHR, textStatus, errorThrown)
            }
        })
    } catch (err) {
        console.log(err)
    }
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
