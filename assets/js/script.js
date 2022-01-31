var searchText;
var googleData, weatherData;
var objectMatch;
const coordinates = {};
const weather = {};
const historyArray = [];

async function convert(location) {
    var googApi = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + location + '&key=AIzaSyD3SFsjzLRJjuS7MuUlRnfQT8kgo7iMIaQ'
    var fetchReponse = await fetch(googApi);
    if (fetchReponse.ok) {
        var googleData = await fetchReponse.json();
    }
    return googleData;
}

async function getWeatherInfo(googleObject) {

    coordinates.lat = googleObject.results[0].geometry.location.lat;
    coordinates.long = googleObject.results[0].geometry.location.lng;
    var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + coordinates.lat + '&lon=' + coordinates.long + '&appid=bb91dbeea5be1f229728f70ee62875cc'
    var fetchResponse = await fetch(apiUrl)
    if (fetchResponse.ok) {
        var weatherData = await fetchResponse.json()
    }
    return weatherData;
}

async function displayWeather(text) {
    let googleData = await convert(text);
    createHistoryItem(googleData);
    let weatherData = await getWeatherInfo(googleData);
    createInfoPage(weatherData);
    create5Day(weatherData);
}

function createHistoryItem(googleDataObject) {
    var same = 0;
    var shortArray = [];
    const object = {
        neighborhood: '',
        city: '',
        admin1: '',
        country: ''
    };
    console.log(googleDataObject);
    googleDataObject.results[0].address_components.forEach(function (item) {
        switch (item.types[0]) {
            case 'neighborhood':
                object.neighborhood = item.long_name;
                break;
            case 'locality':
                object.city = item.long_name;
                break;
            case 'administrative_area_level_1':
                object.admin1 = item.long_name;
                break;
            case 'country':
                object.country = item.short_name;
                break;
            default:
                break;
        }
    })
    if (object.neighborhood === '') {
        var string = object.city + ', ' + object.admin1 + ', ' + object.country;
    } else {
        var string = object.neighborhood + ', ' + object.city + ', ' + object.admin1 + ', ' + object.country;
    }
    $(".collection > li").each(function () {
        var check = ($(this).text());
        if (check === string) {
            console.log('match');
            same++;
            return same;
        }
    });
    if (same === 0) {
        var historyItem = $('<li>')
            .addClass('collection-item sort name')
            .attr('name', string)
            .text(string);
        for (var x in object) {
            if (object[x]) {
                shortArray.push(object[x]);
            }

        }
        storeHistoryItem(shortArray[0]);
        $('.search-history').prepend(historyItem);
    } else {
        return;
    }
}

function storeHistoryItem(arrayItem) {
    historyArray.unshift(arrayItem);
    var string = JSON.stringify(historyArray);
    localStorage.setItem('nepho-history', string);
}

function retieveHistory() {
    var storage = localStorage.getItem('nepho-history');
    var array = JSON.parse(storage);
    array.forEach(function (item, index) {
        convert(item).then(function (response) {
            createHistoryItem(response);
        });
        
    })


}

function createInfoPage(weatherObject) {
    //console.log(weatherObject);
}

function create5Day(weatherObject) {
    //console.log(weatherObject);
}

//Submit click event/enter
$('#search-button').on('click', function () {
    searchText = $('#location').val();
    $('#location').val('');
    if (searchText) {
        displayWeather(searchText);
    }
})
$('#location').keypress(function (e) {
    if (e.which == 13) {
        searchText = $('#location').val();
        $('#location').val('');
        if (searchText) {
            displayWeather(searchText);
        }
    }
});

$('.search-history').on('click', 'li', function (event) {
    event.preventDefault();
    var itemText = ($(event.target).text());
})

retieveHistory();