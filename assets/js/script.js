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
    var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + coordinates.lat + '&lon=' + coordinates.long + '&units=imperial&appid=bb91dbeea5be1f229728f70ee62875cc'
    var fetchResponse = await fetch(apiUrl)
    if (fetchResponse.ok) {
        var weatherData = await fetchResponse.json()
    }
    return weatherData;
}

async function displayWeather(text) {
    let googleData = await convert(text);
    createHistoryItem(googleData);
    var locationName = googleData.results[0].formatted_address;
    let weatherData = await getWeatherInfo(googleData);
    createInfoPage(weatherData, locationName);
    create5Day(weatherData, locationName);
}

function createHistoryItem(googleDataObject) {
    var same = 0;
    var i = 0;
    var shortArray = [];
    var string = '';
    const object = {
        neighborhood: '',
        city: '',
        admin1: '',
        country: ''
    };
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
    var displayArray = [object.neighborhood, object.city, object.admin1, object.country]
    while (i < displayArray.length) {
        if (i < (displayArray.length - 1)) {
            if (displayArray[i]) {
                string += displayArray[i] + ', ';
            }
        } else {
            string += displayArray[i];
        }
        i++;
    }
    console.log(string);
    $(".collection > li").each(function () {
        var check = ($(this).text());
        if (check === string) {
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

/*function retieveHistory() {
    var storage = localStorage.getItem('nepho-history');
    var array = JSON.parse(storage);
    array.forEach(function (item, index) {
        convert(item).then(function (response) {
            createHistoryItem(response);
        });
        
    })


}*/

function createInfoPage(weatherObject, locationName) {
    let timezone = weatherObject.timezone;
    luxonObject = luxon.DateTime.now().setZone(timezone);
    var dateDisplay = luxonObject.toLocaleString(luxon.DateTime.DATETIME_HUGE);
    var iconCode = weatherObject.current.weather[0].icon;

    var location = $('<h4>')
        .addClass('info-location')
        .html(locationName + '<img class="current-icon" src="http://openweathermap.org/img/wn/' + iconCode + '@2x.png"/>')
    var date = $('<p>')
        .addClass('current-date')
        .text(dateDisplay);
    var temp = $('<p>')
        .addClass('current-temp')
        .html('Temperature: ' + weatherObject.current.temp + ' <span>&#176;</span>F')
    var wind = $('<p>')
        .addClass('current-wind')
        .text('Wind Speed: ' + weatherObject.current.wind_speed + 'mph')
    var humidity = $('<p>')
        .addClass('current-humidity' + '%')
        .text('Humidity: ' + weatherObject.current.humidity);
    var uvIndex = $('<span>')
        .addClass('current-uv')
        .text('UV Index: ' + weatherObject.current.uvi)

    $('.weather-info').html('');
    $('.weather-info').append(location, date, temp, wind, humidity, uvIndex);
    
    $('.weather-info').fadeIn(2000, function() {
        $('.weather-info').css('display', 'flex');
        $('.weather-info > *').each(function() {
            $('.current-icon').css('display', 'inline');
            $(this).fadeIn(2000, function() {
                $(this).css('.display', 'flex');
                
            })
        })
    })
}

function create5Day(weatherObject) {
    
    let timezone = weatherObject.timezone;
    luxonObject = luxon.DateTime.now().setZone(timezone);
    $('.five-day > div').each(function () {
        let increment = ($(this).attr('id'));
        var date = luxon.DateTime.now().plus({
            days: increment
        });
        var dateDisplay = date.toLocaleString(luxon.DateTime.DATE_SHORT);
        console.log(dateDisplay);
        $(this).text(dateDisplay);
    })

    $('.five-day').fadeIn(2000, function() {
        $('.five-day').css('display', 'flex');
        $('.five-day > *').each(function() {
            $(this).fadeIn(2000, function() {
                $(this).css('.display', 'flex');
                
            })
        })
    });
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


//retieveHistory();