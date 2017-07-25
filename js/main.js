var image = gup('image');
var url_verify, prediction;
var softSlider = document.getElementById('slider_result');
function filter(value) {
    if ((value % 20 === 0))return 1;
    if ((value % 10 === 0))return 2;
}
noUiSlider.create(softSlider, {
    start: 0,
    range: {
        min: 0,
        max: 100
    },
    animate: true,
    animationDuration: 1000,
    step: 1,
    connect: 'lower',
    pips: {
        mode: 'steps',
        filter: filter,
        density: 2,
        format: wNumb({
            postfix: '%'
        })
    }
});
var rangeSliderValueElement = document.getElementById('slider_input');

softSlider.noUiSlider.on('update', function (values, handle) {
    if (values[handle] > 80) {
        $('.noUi-connect').css('background-color', 'red');
    }
    else if (values[handle] > 60) {
        $('.noUi-connect').css('background-color', 'orange');
    }
    else {
        $('.noUi-connect').css('background-color', 'green');
    }
    rangeSliderValueElement.innerHTML = values[handle].slice(0, -3) + "%";
});

softSlider.noUiSlider.on('slide', function () {
    $('#submit').show();
});

if (image !== "") {
    $('#img_url').val(image);
    url_verify = image;
    $('#main,.desc_examples,.warning,#loading_examples').hide();
    $('.back').show();
    load_image();
}
$('#tiles').imagesLoaded(function () {

    var options = {
        autoResize: true,
        container: $('#main'),
        offset: 20,//10
        itemWidth: 415,//210
        outerOffset: 0
    };

    var handler = $('#tiles li');
    handler.wookmark(options);

    $("#loading_examples").hide();
});
function drop_img(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var imageUrl = evt.dataTransfer.getData('text/html');
    if (imageUrl === "") {
        $('#myModal h1').html("Oops! Something went wrong");
        $('#myModal p').html("You have to drag an image from the web. Images from local disk aren't accepted!");
        $('#myModal').reveal();
    }
    else {
        if (imageUrl.indexOf('<a href="https://www.youtube.com/watch?v=') > -1) {
            var id = imageUrl.substring(41, 52);
            url_verify = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
        }
        else if (imageUrl === "") {
            imageUrl = evt.dataTransfer.getData('text');
            var id = imageUrl.substring(32, 43);
            url_verify = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
        }
        else {
            if ($(imageUrl).children().length > 0) {
                url_verify = $(imageUrl).find('img').attr('src');
            } else {
                url_verify = $(imageUrl).attr('src');
            }
        }

        if (url_verify.length < 300) {
            if (url_verify.indexOf('i.ytimg.com') > -1) {
                if (url_verify.indexOf('vi_webp') > -1) {
                    url_verify = url_verify.substring(0, 40) + "hqdefault.webp";
                }
                else {
                    url_verify = url_verify.substring(0, 35) + "hqdefault.jpg";
                }
            }
            window.location.href = 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?image=' + url_verify;
        } else {
            $('#myModal h1').html("Oops! Something went wrong");
            $('#myModal p').html("The provived image URL is <b>" + url_verify.length + "</b> characters long<br/>We can not handle such big URL");
            $('#myModal').reveal();
        }
    }
}

function verify_text() {
    if ($("#img_url").val() !== "") {
        url_verify = $("#img_url").val();
        window.location.href = 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?image=' + $("#img_url").val();
    }
}

$("#img_url").keyup(function (e) {
    if (e.keyCode === 13) {
        verify_text();
    }
});

function gup(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null) return "";
    else return results[1];
}

function load_image() {
    $('#loading').show();
    $('#slider_result,#wrapper_result,#feedback,#thank_p').hide();
    $('#slider_input').css('visibility', 'hidden');
    $('#result_image').attr('src', url_verify);
    var imageObj = new Image();
    imageObj.src = url_verify;
    imageObj.onload = (function (e) {
        var height = this.height;
        if (height > 300) {
            height = 300
        }
        $('#number_result').css('top', (height / 2) - 64);
    });
    $.ajax({
        type: 'GET',
        url: 'http://160.40.51.20:8080/disturbingdetector/disturbingdetector/classify_violent?imageurl=' + url_verify,
        dataType: "jsonp",
        success: function (data) {
            prediction = data.prediction;
            var per = Math.round(data.prediction * 100);
            $('#slider_input').text(per + "%");
            softSlider.noUiSlider.set(per);
            $('#feedback').show();
            if (per > 80) {
                $('#text_result').html("The image seems to contain disturbing content");
                $('.noUi-connect').css('background-color', 'red');
            }
            else if (per > 60) {
                $('#text_result').html("The image may contain disturbing content");
                $('.noUi-connect').css('background-color', 'orange');
            }
            else if (per > 0) {
                $('#text_result').html("The image appears to be innocuous");
                $('.noUi-connect').css('background-color', 'green');
            }
            else {
                $('#text_result').html("Failed to fetch image");
                $('.noUi-connect').css('background-color', 'green');
                per = 0;
            }
            $('#wrapper_result').show(0, function () {
                $('#percentage').prop('number', $('#percentage').text().slice(0, -1)).animateNumber({
                        number: per,
                        numberStep: $.animateNumber.numberStepFactories.append(' %')
                    },
                    1000);
            });
            $('#loading').hide();
            $('#slider_result').show(0);
            $('#slider_input').css('visibility', 'visible');
        },
        error: function () {
            $('#myModal h1').html("Oops! Something went wrong");
            $('#myModal p').html("There was an error in processing. Please try again!");
            $('#myModal').reveal();
        },
        async: true
    });
}
$('#tiles').find('li').click(function () {
    window.location.href = 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname + '?image=' + 'http://' + window.location.host + window.location.pathname.replace('index.html', '/') + $(this).find('img').eq(0).attr('src');
});
$('.back').click(function () {
    window.location.href = 'http://' + window.location.hostname + ':' + window.location.port + window.location.pathname;
});
$('#reveal_images').click(function () {
    var options = {
        autoResize: true,
        container: $('#main'),
        offset: 20,
        itemWidth: 415,
        outerOffset: 0
    };
    var handler = $('#tiles li');
    if ($(this).attr('data-active') === "hidden") {
        $(this).html('Hide all <img src="imgs/eyecross.png" style="vertical-align: middle;">').attr('data-active', 'visible');
        $("[data-foggy='true']").removeClass('foggy');
        $('.reveal_image').attr('src', 'imgs/eyecross.png');
        handler.wookmark(options);
    }
    else {
        $(this).html('Reveal all <img src="imgs/eye.png" style="vertical-align: middle;">').attr('data-active', 'hidden');
        $("[data-foggy='true']").addClass('foggy');
        $('.reveal_image').attr('src', 'imgs/eye.png');
        handler.wookmark(options);
    }
});
$('.reveal_image').click(function (e) {
    e.stopPropagation();
    e.preventDefault();
    var options = {
        autoResize: true,
        container: $('#main'),
        offset: 20,
        itemWidth: 415,
        outerOffset: 0
    };
    var handler = $('#tiles li');
    if ($(this).siblings('img').hasClass('foggy')) {
        $(this).attr('src', 'imgs/eyecross.png');
        $(this).siblings('img').removeClass('foggy');
        handler.wookmark(options);
    }
    else {
        $(this).attr('src', 'imgs/eye.png');
        $(this).siblings('img').addClass('foggy');
        handler.wookmark(options);
    }
});
function imgError1(image) {
    image.src = "imgs/noimage.png";
    return true;
}
function feedback() {
    $.ajax({
        type: 'GET',
        url: 'http://160.40.51.20:8080/disturbing-feedback-manager/disturbing_feedback/get_feedback?url=' + url_verify + "&score=" + prediction + "&desired_score=" + softSlider.noUiSlider.get().slice(0, -3) / 100,
        dataType: "jsonp",
        success: function () {
            $('#feedback,#submit').hide();
            $('#thank_p').show();
        },
        error: function () {
            $('#feedback,#submit').hide();
            $('#thank_p').show();
        },
        async: true
    });
}