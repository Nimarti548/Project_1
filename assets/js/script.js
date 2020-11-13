let searchLocation = "";
let capital = "";
let lat = 0;
let lng = 0;
let toggle = 0;

$("#main").toggle();

let toggleOnce = function () {
    if (toggle === 0) {
        $("#instructions").toggle();
        $("#main").toggle();
        toggle++;
    }
}
/**
 * FIX: This event listener is broken, be sure it has access to the correct data
 */
$("form").on("submit", function (e) {
    e.preventDefault();

    let input = $("#search-bar").val();
    searchLocation = input;
    toggleOnce();
    bannerFetch();

})

/**
 * Fetch and fill country card by Nimarti
 */
let bannerFetch = function () {
    let url = `https://restcountries.eu/rest/v2/name/${searchLocation}`
    fetch(url)
        .then(response => {
            if (response.status === 404) {
                let err404 = $("<h1>");
                let link = $("<a>");
                link.attr("href", "https://jtwob.github.io/Travel_Almanac/");
                link.text("Click here to go back");
                err404.text("404: Country not in database.");
                err404.attr("style", "color: white;");
                $("#main").empty();
                $("#main").append(err404);
                $("#main").append(link);

            }
            return response.json();
        })
        .then(data => {
            let timezonesStr = "Timezone(s): ";
            $("#country-name").empty();
            iconGen();
            $("#country-name").prepend(data[0].name);
            $("#capital").text("Capital: " + data[0].capital);
            $("#callCode").text("Calling Code: " + data[0].callingCodes[0]);
            $("#currency").text("Currency: " + data[0].currencies[0].name);
            $("#lang").text("Language: " + data[0].languages[0].name);
            $("#pop").text("Population: " + data[0].population);
            $("#nat-flag").attr("src", data[0].flag);
            $("#nat-flag").attr("style", "width: 300px;");
            $("#capital-city").text(data[0].capital);

            for (let i = 0; i < data[0].timezones.length; i++) {
                timezonesStr += data[0].timezones[i];
                if (i + 1 !== data[0].timezones.length) {
                    timezonesStr += ", ";
                }
            }

            lat = data[0].latlng[0];
            lng = data[0].latlng[1];

            $("#timeZone").text(timezonesStr);
            capital = data[0].capital.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            weatherFetch();
            $("#map").empty();
            mapGen();
        })
}

/**
 * Fetch weather data and return it
 */
let weatherFetch = function () {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${capital}&units=imperial&appid=b8cf73639b0d81c1905ba1ac1cb6f289`)
        .then(response => response.json())
        .then(data => {
            weatherCards(data);
        })
}

/**
 * Write a loop that fills appropriate number of cards with relevent weather data
 */
let weatherCards = function (weatherData) {
    $("#weather-cards").empty();
    for (let i = 0; i < weatherData.list.length; i += 8) {
        cardBuilder(weatherData.list[i]);
    }
}

let cardBuilder = function (data) {
    let cardCol = $("<div>");
    let card = $("<div>");
    let content = $("<div>");
    let cardTitle = $("<span>");
    let icon = $("<img>");
    let temp = $("<p>");
    let humidity = $("<p>");

    cardCol.attr("class", "col s3");
    cardCol.attr("style", "width: 12rem;")
    card.attr("class", "card blue-grey darken-1");
    content.attr("class", "card-content white-text");
    cardTitle.attr("class", "card-title");
    cardTitle.text(moment(data.dt_txt).format("L"));
    icon.attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
    temp.text("Temp: " + data.main.temp + " °F");
    humidity.text("Humidity: " + data.main.humidity + "%")

    content.append(cardTitle);
    content.append(icon);
    content.append(temp);
    content.append(humidity);
    card.append(content);
    cardCol.append(card);
    $("#weather-cards").append(cardCol);
}

let iconGen = function () {
    let icon = $("<i>");
    icon.attr("class", "material-icons right");
    icon.text("more_vert");
    $("#country-name").append(icon);
}

let mapGen = function () {
    var map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([lng, lat]),
            zoom: 4
        })
    });
}

