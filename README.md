# Nepho Weather Dashboard

## Intention

My intention with this challenge was to create a weather dashboard that would take any location as an input. It would then display the current weather infomation for the location as well as a 5-day forcast.

## Challenges

I had a lot of points in the creation of this page that I was really stuck on. The first was using asynchronous functions. My difficulty with async functions came in two parts; understanding how to work around await and then, as well as getting data out of an async function. My second big challenge was the creation of the fade out animation. The fade in animation was pretty simple, but getting the timing right so that the user would never see the displayed information change was a struggle.

## Externals Used

Jquery - Used for almost entire document; element   creation and deletion, iteration over elements.

Materialize - CSS Framework, used mainly for history list grid layout, coloring, text coloring, and some component creation

Luxon - Time manipulation library, used to create a workable time object to display various time formats

Google Fonts - Header and body fonts

Google Geocode API - Used for location object creation from user input, which in turn was used for display text, coordinates, and storage keys

Open Weather One Call API - Used for weather object creation based on coordinates. Object was used for all weather data in document

## Future Improvements

- Fix randomness of history item display
- Fix history item display time lag (both issues are fetch retrieval async issues)

## Function Structure

- retrieveHistory() 
    - convert()
        - fetch(Geocode API)
    - createHistoryItem() 
        - storeHistoryItem()
- submit click or enter press
    - displayWeather()
        - convert()
            - fetch(Geocode API)
        - createHistoryItem()
        - getWeatherInfo() 
            - fetch(Open Weather API)
        - createInfoPage()
            - outFade()
            - inFade()
        - create5Day()
            - outFade()
            - inFade()

## Page Images

![Main Page](./assets/images/Image1.png)

Deployed at

https://atticus-robinson.github.io/Nepho-Weather/