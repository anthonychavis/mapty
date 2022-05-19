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
            var map = L.map('map').setView(coords, 13); // map string = id of element for rendering
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

            // handler on map var to use coords of click
            map.on('click', function (mapEvent) {
                // console.log(mapEvent); // check properties
                const { lat, lng } = mapEvent.latlng; // destructuring

                // from Leaflet, then edited
                L.marker([lat, lng])
                    .addTo(map)
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
        },
        function () {
            alert('Could not get your position');
        }
    );
// NOTICE 2 callback fxns for the getCurrentPosition() method; 1st nds param - success; 2nd - error
