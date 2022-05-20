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

// let map, mapEvent;

// parent Class to organize data - each piece of fxnality separated
class App {
    // Private Fields - aka Private Instance Fields
    #map;
    #mapEvent;

    constructor() {
        this._getPosition();

        // top level handlers:
        // form event handler to submit form & render marker. (unrelated to geolocation. So, built outside the getCurrentPosition() method).
        form.addEventListener('submit', this._newWorkout.bind(this)); // bind method returns new fxn

        // when exercise type changed in form, swap input fields
        inputType.addEventListener('change', this._toggleElevationField); // 'change' event is on the 'select' html tag
    } // no params needed b/c nothing passed in; constructor executed as soon as Instance created

    _getPosition() {
        if (navigator.geolocation)
            // using the Geolocation API
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                function () {
                    alert('Could not get your position');
                }
            );
        // NOTICE 2 callback fxns for the getCurrentPosition() method; 1st nds param - success; 2nd - error
    }

    _loadMap(position) {
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
        this.#map = L.map('map').setView(coords, 13); // map string = id of element for rendering
        // L = Leaflet namespace (like Intl) & global variable ♦
        // 13 = zoom value
        // console.log(map); checking for methods

        // from Leaflet, then edited (tile src changed)
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map); // openstreetmap is an open source map; could use other maps

        // handler on map var to manage clicks on rendered map - reveal form
        this.#map.on('click', this._showForm.bind(this));
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;

        // form
        form.classList.remove('hidden');
        inputDistance.focus(); // add cursor
    }

    _toggleElevationField() {
        inputElevation
            .closest('.form__row')
            .classList.toggle('form__row--hidden');
        inputCadence
            .closest('.form__row')
            .classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        e.preventDefault(); // avoid default form behavior
        // console.log(this); // shows the this keyword must be bound

        // clear input fields after submitting
        inputDistance.value =
            inputDuration.value =
            inputCadence.value =
            inputElevation.value =
                '';

        // Display marker
        // console.log(mapEvent); // check properties
        const { lat, lng } = this.#mapEvent.latlng; // mapEvent var added to global scope b/c defined in a callback fxn of getCurrentPosition()

        // marker + popup rendered on map - from Leaflet, then edited
        L.marker([lat, lng])
            .addTo(this.#map) // map var added to global scope b/c it's defined in the getCurrentPosition() method
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
    }
}

// create Instance
const app = new App(); // created on pg load b/c it's in the top level scope. Constructor executed on Instance creation.

// ♠ NOTE at the moment, if cycling is left as the inputType before pg refresh, the cadence/elevation input field is broken [will cause a problem when storing data] ♠

// hide generic form after submitting
// save form data
// add submitted form/data to list
