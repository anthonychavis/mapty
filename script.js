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
            console.log(
                `https://www.google.com/maps/@${latitude},${longitude}`
            );
        },
        function () {
            alert('Could not get your position');
        }
    );
// NOTICE 2 callback fxns; 1st nds param - success; 2nd - error
