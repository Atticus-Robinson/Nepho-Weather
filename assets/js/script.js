var googleData, weatherData;
var fadeStatus;
var uvCat = "";
var uvColor = "";
var uvText = "";
const coordinates = {};
const weather = {};
const historyArray = [];

//Take a location input, pass to Geocode API, create Geocode object, return object
async function convert(location) {
  let googApi =
    "https://maps.googleapis.com/maps/api/geocode/json?address=" +
    location +
    "&key=AIzaSyD3SFsjzLRJjuS7MuUlRnfQT8kgo7iMIaQ";
  let fetchReponse = await fetch(googApi);
  if (fetchReponse.ok) {
    googleData = await fetchReponse.json();
  }
  return googleData;
}

//Take Geocode object, store coordinates, fetch Weather object, return object
async function getWeatherInfo(googleObject) {
  coordinates.lat = googleObject.results[0].geometry.location.lat;
  coordinates.long = googleObject.results[0].geometry.location.lng;
  let apiUrl =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    coordinates.lat +
    "&lon=" +
    coordinates.long +
    "&units=imperial&appid=bb91dbeea5be1f229728f70ee62875cc";
  let fetchResponse = await fetch(apiUrl);
  if (fetchResponse.ok) {
    weatherData = await fetchResponse.json();
  }
  return weatherData;
}

//Take input text, convert to Geocode object, createHistory item from text, convert Geocode object to Weather object, create page displays
function displayWeather(text) {
  googleData = convert(text).then(function () {
    let locationName = googleData.results[0].formatted_address;
    weatherData = getWeatherInfo(googleData).then(function () {
      console.log(googleData);
      createHistoryItem(googleData);
      createInfoPage(weatherData, locationName);
      create5Day(weatherData, locationName);
    });
  });
}

//Take a Geocode object, and create a history item
function createHistoryItem(googleDataObject) {
  let same = 0;
  let i = 0;
  const shortArray = [];
  let string = "";
  const object = {
    neighborhood: "",
    city: "",
    admin1: "",
    country: "",
  };

  //For each address component in the object, store the item into the correspoding key in const object
  googleDataObject.results[0].address_components.forEach(function (item) {
    switch (item.types[0]) {
      case "neighborhood":
        object.neighborhood = item.long_name;
        break;
      case "locality":
        object.city = item.long_name;
        break;
      case "administrative_area_level_1":
        object.admin1 = item.long_name;
        break;
      case "country":
        object.country = item.short_name;
        break;
      default:
        break;
    }
  });

  //Create array to display onto page
  const displayArray = [
    object.neighborhood,
    object.city,
    object.admin1,
    object.country,
  ];
  //If array item isn't the last item, append a ','. This will create a readable line e.g Nashville Tennesee US => Nashville, Tennesee, US
  while (i < displayArray.length) {
    if (i < displayArray.length - 1) {
      if (displayArray[i]) {
        string += displayArray[i] + ", ";
      }
    } else {
      string += displayArray[i];
    }
    i++;
  }

  //If the item to be stored already exists in the list, change same for check later
  $(".collection > li").each(function () {
    let check = $(this).text();
    if (check === string) {
      same++;
      return same;
    }
  });

  //If there is no matched item, create <li>
  if (same === 0) {
    var historyItem = $("<li>")
      .addClass("collection-item sort name")
      .attr("name", string)
      .text(string);

    //For each value in the object, if it exists, push it into the short array
    for (var x in object) {
      if (object[x]) {
        shortArray.push(object[x]);
      }
    }

    //Take the first two items in the shortArray and pass to storeHistoryItem for storage in local storage. This will increase the likelyhood of a unique storage item in the case of similar location name e.g. Madison WI and Madison TN
    storeHistoryItem(shortArray[0], shortArray[1]);

    //Add item to search ul
    $(".search-history").prepend(historyItem);
  } else {
    return same;
  }
}

//Store history item based on two smallest specified areas e.g [Brooklyn] []
function storeHistoryItem(arrayItem, arrayItem2) {
  let storeItem = `${arrayItem} ${arrayItem2}`;
  historyArray.unshift(storeItem);
  let string = JSON.stringify(historyArray);
  localStorage.setItem("nepho-history", string);
}

//Retrieve local storage
function retieveHistory() {
  //debugger;
  let storage = localStorage.getItem("nepho-history");

  //Create array from storage parse
  let array = JSON.parse(storage);

  //For each array item - convert to Google Geocode Object and call pass into createHistoryItem
  if(!array) return;
  array.forEach(async function (item) {
    let value = await convert(item);
    createHistoryItem(value);
  });
}

//Create detailed weather page for current time at location
function createInfoPage(weatherObject, locationName) {
  //Store timezone for usage in Luxon object
  let timezone = weatherObject.timezone;

  //Create Luxon object from timezone
  //ISSUE --- Creating datetime object for now() rather than the location can results in day offset issues. If location is a day forward
  luxonObject = luxon.DateTime.now().setZone(timezone);

  //Store date display from Luxon object 'DATETIME_HUGE' e.g. Friday, October 14, 1983, 1:30 PM Eastern Daylight Time
  let dateDisplay = luxonObject.toLocaleString(luxon.DateTime.DATETIME_HUGE);

  //Store icon code from weather object
  let iconCode = weatherObject.current.weather[0].icon;

  //Set fade panel status for use in checking animation. Value is depended on what the last animation was, either in or out
  fadeStatus = $(".fade-panel").attr("fade-status");

  //If fadeStatus === in (there was already an animation run, content is on the page). This ensures that the next fade in doesn't run until the fade out completes.
  if (fadeStatus === "in") {
    //Start fade out
    outFade();

    //After duration of fade out, run fade in and change text. If text is changed before fade out completes the user will see the change
    setTimeout(function () {
      inFade();
      let location = $("<h4>")
        .addClass("info-location")
        .html(
          `${locationName}<img class="current-icon" src="http://openweathermap.org/img/wn/${iconCode}@2x.png"/>`
        );
      let date = $("<p>").addClass("current-date").text(dateDisplay);
      let temp = $("<p>")
        .addClass("current-temp")
        .html(
          `Temperature: ${weatherObject.current.temp} <span>&#176;</span>F`
        );
      let wind = $("<p>")
        .addClass("current-wind")
        .text(`Wind Speed: ${weatherObject.current.wind_speed}mph`);
      let humidity = $("<p>")
        .addClass("current-humidity" + "%")
        .text(`Humidity: ${weatherObject.current.humidity}`);
      //Check UV against danger range
      uvChecker(weatherObject.current.uvi);
      let uvIndex = $("<p>")
        .addClass("current-uv ")
        .html(
          `${uvCat} UV Index: <span class="${uvColor} ${uvText} uvSpan">${weatherObject.current.uvi}</span>`
        );

      $(".containerW").html("");
      $(".containerW").append(location, date, temp, wind, humidity, uvIndex);
    }, 1100);
  }

  //If there is no fade status present, no animations have been run. No need for fade out
  if (!fadeStatus) {
    inFade();
    let location = $("<h4>")
      .addClass("info-location")
      .html(
        `${locationName}<img class="current-icon" src="http://openweathermap.org/img/wn/${iconCode}@2x.png"/>`
      );
    let date = $("<p>").addClass("current-date").text(dateDisplay);
    let temp = $("<p>")
      .addClass("current-temp")
      .html(`Temperature: ${weatherObject.current.temp} <span>&#176;</span>F`);
    let wind = $("<p>")
      .addClass("current-wind")
      .text(`Wind Speed: ${weatherObject.current.wind_speed}mph`);
    let humidity = $("<p>")
      .addClass("current-humidity" + "%")
      .text(`Humidity: ${weatherObject.current.humidity}`);
    uvChecker(weatherObject.current.uvi);
    let uvIndex = $("<p>")
      .addClass("current-uv ")
      .html(
        `${uvCat} UV Index: <span class="${uvColor} ${uvText} uvSpan">${weatherObject.current.uvi}</span>`
      );

    $(".containerW").html("");
    $(".containerW").append(location, date, temp, wind, humidity, uvIndex);
  }
}

//Create 5-day weather projection
function create5Day(weatherObject) {
  //Store timezone for usage in Luxon object
  let timezone = weatherObject.timezone;

  //Create Luxon object from timezone
  luxonObject = luxon.DateTime.now().setZone(timezone);

  //If fadeStatus === in (there was already an animation run, content is on the page). This ensures that the next fade in doesn't run until the fade out completes.
  if (fadeStatus === "in") {
    setTimeout(function () {
      //For each div under 5 day container
      $(".five-day > div").each(function () {
        //Get day# from id
        let increment = $(this).attr("id");

        //Create Luxon object from selected day (increment days in the future)
        let date = luxon.DateTime.now().plus({
          days: increment,
        });
        let dateDisplay = $("<p>")
          .addClass("card-date")
          .text(date.toLocaleString(luxon.DateTime.DATE_SHORT));

        let iconCode = weatherObject.daily[increment].weather[0].icon;
        let icon = $("<img>")
          .addClass("card-icon")
          .attr("src", `http://openweathermap.org/img/wn/${iconCode}@2x.png`);

        let high = weatherObject.daily[increment].temp.max;
        let low = weatherObject.daily[increment].temp.min;
        let temp = $("<p>").addClass("card-temp").text(`L${low}/H${high}`);

        let wind = $("<p>")
          .addClass("card-wind")
          .text(`${weatherObject.daily[increment].wind_speed}mph`);

        let humidity = $("<p>")
          .addClass("card-humidity")
          .text(`${weatherObject.daily[increment].humidity}%`);

        $(this).html("");
        $(this).append(dateDisplay, icon, temp, wind, humidity);
      });
    }, 1490);
  }

  //If there is no fade status present, no animations have been run. No need for fade out
  if (!fadeStatus) {
    $(".five-day > div").each(function () {
      let increment = $(this).attr("id");

      let date = luxon.DateTime.now().plus({
        days: increment,
      });
      let dateDisplay = $("<p>")
        .addClass("card-date")
        .text(date.toLocaleString(luxon.DateTime.DATE_SHORT));

      let iconCode = weatherObject.daily[increment].weather[0].icon;
      let icon = $("<img>")
        .addClass("card-icon")
        .attr("src", `http://openweathermap.org/img/wn/${iconCode}@2x.png`);

      let high = weatherObject.daily[increment].temp.max;
      let low = weatherObject.daily[increment].temp.min;
      let temp = $("<p>").addClass("card-temp").text(`L ${low}/ H ${high}`);

      let wind = $("<p>")
        .addClass("card-wind")
        .text(`${weatherObject.daily[increment].wind_speed}mph`);

      let humidity = $("<p>")
        .addClass("card-humidity")
        .text(`${weatherObject.daily[increment].humidity}%`);
      $(this).html("");

      $(this).append(dateDisplay, icon, temp, wind, humidity);
    });
  }
}

//Fade in each 5day card and info panel
function inFade() {
  for (let i = 1; i < 6; i++) {
    $(".five-day > #" + i)
      .removeClass("fade-out-day")
      .addClass("fade-in-day");
  }
  $(".fade-panel").fadeIn(3000).attr("fade-status", "in");
}

//Fade out each 5day card and info panel
function outFade() {
  for (let i = 1; i < 6; i++) {
    $(".five-day > #" + i)
      .addClass("fade-out-day")
      .removeClass("fade-in-day");
  }
  $(".fade-panel").fadeOut(1000).attr("fade-status", "out");
}

//Check uvIndex, then store danger level, color of display span, and text color of display span. Colors are materialize classes.
function uvChecker(uvIndex) {
  if (uvIndex <= 2) {
    uvCat = "Low";
    uvColor = "green";
    uvText = "white-text";
  } else if (uvIndex >= 3 && uvIndex <= 5) {
    uvCat = "Moderate";
    uvColor = "yellow";
    uvText = "black-text";
  } else if (uvIndex >= 6 && uvIndex <= 7) {
    uvCat = "High";
    uvColor = "orange";
    uvText = "black-text";
  } else if (uvIndex >= 8 && uvIndex <= 10) {
    uvCat = "Very High";
    uvColor = "red";
    uvText = "white-text";
  } else if (uvIndex >= 11) {
    uvCat = "Extreme";
    uvColor = "black";
    uvText = "white";
  }
}

//On clicking or keypressing in the search area. Execute display weather with search text
$(".location-input").on("keyup click", function (e) {
  let box = $(e.target).attr("id");
  let searchText = $("#location").val();
  if (
    (box === "location" && e.which == 13) ||
    (box === "search-button" && e.type === "click")
  ) {
    $("#location").val("");
    displayWeather(searchText);
  }
});

//When a search history item is clicked, display weather for that location
$(".search-history").on("click", "li", function (event) {
  event.preventDefault();
  let itemText = $(event.target).text();
  displayWeather(itemText);
});

//When document is ready, load local storage items
$("document").ready(function () {
  retieveHistory();
});

//Change seach history class on small screen size
if (window.matchMedia("(max-width: 900px)").matches) {
  $(".search").removeClass("s3").addClass("s12");
  $(".weather").removeClass("s3").addClass("s12");
}
