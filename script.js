'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map, mapEvent;

if (navigator.geolocation)
    // using the Geolocation API
    navigator.geolocation.getCurrentPosition(
        function (position) {
            // console.log(position); // check object

            // take position out
            // const latitude = position.coords.latitude;
            const { latitude } = position.coords; // destructuring
            const { longitude } = position.coords; // destructuring

            // url from google maps
            // console.log(
            //     `https://www.google.com/maps/@${latitude},${longitude}`
            // );

            const coords = [latitude, longitude];

            // from Leaflet, then edited. gives location
            map = L.map('map').setView(coords, 13); // map string = id of element for rendering
            // L = Leaflet namespace (like Intl) & global variable ♦
            // 13 = zoom value
            // console.log(map); checking for methods

            // from Leaflet, then edited (tile src changed)
            L.tileLayer(
                'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                {
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }
            ).addTo(map); // openstreetmap is an open source map; could use other maps

            // handler on map var to manage clicks on rendered map - reveal form
            map.on('click', function (mapE) {
                mapEvent = mapE;

                // form
                form.classList.remove('hidden');
                inputDistance.focus(); // add cursor
            });
        },
        function () {
            alert('Could not get your position');
        }
    );
// NOTICE 2 callback fxns for the getCurrentPosition() method; 1st nds param - success; 2nd - error

// form event handler to submit form & render marker. (unrelated to geolocation. So, built outside the getCurrentPosition() method).
form.addEventListener('submit', function (e) {
    e.preventDefault(); // avoid default form behavior

    // clear input fields after submitting
    inputDistance.value =
        inputDuration.value =
        inputCadence.value =
        inputElevation.value =
            '';

    // Display marker
    // console.log(mapEvent); // check properties
    const { lat, lng } = mapEvent.latlng; // mapEvent var added to global scope b/c defined in a callback fxn of getCurrentPosition()

    // marker + popup rendered on map - from Leaflet, then edited
    L.marker([lat, lng])
        .addTo(map) // map var added to global scope b/c it's defined in the getCurrentPosition() method
        .bindPopup(
            L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: 'running-popup', // will be dynamic
            })
        )
        .setPopupContent('Workout') // inherited method
        .openPopup(); // Read Leaflet documentation to remember how this chaining works
});

// when exercise type changed in form, swap input fields
inputType.addEventListener('change', function () {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
}); // 'change' event is on the 'select' html tag

// hide generic form after submitting
// save form data
// add submitted form/data to list
