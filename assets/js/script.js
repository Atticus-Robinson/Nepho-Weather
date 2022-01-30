var searchText;
var googleData, weatherData;
const historyArray = [];

function getWeatherInfo(inputLocation) {
    var coordinates = latLonConvert(inputLocation);
    var latitude = coordinates.lat;
    var longitude = coordinates.long;
    console.log(latitude);
    console.log(longitude);
    var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + latitude + '&lon=' + longitude + '&appid=bb91dbeea5be1f229728f70ee62875cc'
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (weatherData) {
                console.log(weatherData);
            })
        }
    })
}

function latLonConvert(location) {
    var googApi = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + location + '&key=AIzaSyD3SFsjzLRJjuS7MuUlRnfQT8kgo7iMIaQ'
    fetch(googApi).then(function (response) {
        if (response.ok) {
            response.json().then(function (googleData) {
                var lat = googleData.results[0].geometry.location.lat;
                var long = googleData.results[0].geometry.location.lng;
                console.log(lat, long);
                return {lat, long};
            })
        }
    })
}

function createHistoryItem(inputText) {
    console.log(googleData);
    /*var check;
    var same;


    data.results[0].address_components.forEach(function (item) {
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
    $('.search-history > li').each(function (index) {
        check = ($(this).attr('id'));
        if (check === admin1) {
            same = false;
            return;
        } else {}
    });
    if (same === false) return;
    var historyItem = $('<li>')
        .addClass('collection-item')
        .attr('id', admin1)
        .text(admin1 + ', ' + admin2 + ', ' + country);

    $('.search-history').prepend(historyItem);*/
}

function storeHistoryItem(item) {
    historyArray.unshift(item);
    var string = JSON.stringify(historyArray);
    localStorage.setItem("nepho-search-history", string);
}

function retieveHistory() {
    var storage = localStorage.getItem("nepho-search-history");
    var array = JSON.parse(storage);
    array.forEach(function (currentValue) {
        historyArray.push(currentValue);
    })
    console.log(historyArray);
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
        getWeatherInfo(searchText);
        storeHistoryItem(searchText);
    }
})

$('#location').keypress(function (e) {
    if (e.which == 13) {
        searchText = $('#location').val();
        $('#location').val('');
        if (searchText) {
            getWeatherInfo(searchText);
            storeHistoryItem(searchText);
        }
    }
});

$('.search-history').on('click', 'li', function (event) {
    event.preventDefault();
})

retieveHistory();