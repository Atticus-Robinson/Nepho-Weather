var searchText;
var data;

function getWeatherInfo(latitude, longitude) {
    var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + latitude + '&lon=' + longitude + '&appid=bb91dbeea5be1f229728f70ee62875cc'
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                console.log(data);
            })
        }
    })
}

function latLonConvert(inputLocation) {
    var apiUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + inputLocation + '&key=AIzaSyD3SFsjzLRJjuS7MuUlRnfQT8kgo7iMIaQ'
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                data.results[0].address_components.forEach(function(item) {
                    switch (item.types[0]) {
                        case 'locality':
                            city = item.long_name;
                            break;
                        case 'administrative_area_level_1':
                            admin1 = item.long_name;
                            break;
                        case 'country':
                            country = item.short_name;
                            break;
                        default:
                            break;
                    }
                })
                var lat = data.results[0].geometry.location.lat;
                var long = data.results[0].geometry.location.lng;
                createHistoryItem(city, admin1, country);
                getWeatherInfo(lat, long);
            })
        }
    })
}

function createHistoryItem(admin1, admin2, country) {
    var check;
    var same;
    $('.search-history > li').each(function(index) {
        check = ($(this).attr('id'));
        if (check === admin1) {
            same = false;
            return;
        } else {
        }
    });
    if (same === false) return;
    var historyItem = $('<li>')
        .addClass('collection-item')
        .attr('id', admin1)
        .text(admin1 + ', ' + admin2 + ', ' + country);
    
    storeHistoryItem(admin1);
    $('.search-history').prepend(historyItem);
}

function storeHistoryItem(item) {

}

function createInfoPage() {

}

function create5Day() {

}

//Submit click event/enter
$('#search-button').on('click', function () {
    searchText = $('#location').val();
    $('#location').val('');
    if (searchText) {
        latLonConvert(searchText);
    }
})

$('#location').keypress(function (e) {
    if (e.which == 13) {
        searchText = $('#location').val();
        $('#location').val('');
        if (searchText) {
            latLonConvert(searchText);
        }
    }
});

$('.search-history').on('click', 'li', function(event) {
    event.preventDefault();
    latLonConvert($(this).text());
})