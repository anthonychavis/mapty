'use strict';

// parent Class for Workout details
class Workout {
    // pulic fields
    date = new Date();
    id = (Date.now() + '').slice(-10); // used to identify/find from the array to be added to the Class App. Use a library to create unique id's

    constructor(coords, distance, duration) {
        this.coords = coords; // [lat, lng]
        this.distance = distance; // km
        this.duration = duration; // mins
    }

    // private method
    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(
            1
        )} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

// child Classes for Workout details
class Running extends Workout {
    // public field
    type = 'running';

    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;

        this.calcPace(); // ok to call any code in constructor
        this._setDescription(); // method defined in parent Class, but uses a property/field in child Class. So, called in child constructor
    }

    // Public interface - Public method
    calcPace() {
        // min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    // public field
    type = 'cycling';

    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;

        this.calcSpeed();
        this._setDescription(); // method defined in parent Class, but uses a property/field in child Class. So, called in child constructor
    }

    // Public interface - Public method
    calcSpeed() {
        // km/h
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

// check Classes work as expected
// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);

/////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
// these global vars could go into the Class App as fields

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
    #workouts = [];

    constructor() {
        this._getPosition();

        // (formerly top level handlers)
        // form event handler to submit form & render marker. (unrelated to geolocation. So, built outside the getCurrentPosition() method).
        form.addEventListener('submit', this._newWorkout.bind(this)); // bind method returns new fxn

        // when exercise type changed in form, swap input fields
        inputType.addEventListener('change', this._toggleElevationField); // 'change' event is on the 'select' html tag
    } // no params needed b/c nothing passed in; constructor executed as soon as Instance created

    // private methods
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

        // take coords from position object
        // const latitude = position.coords.latitude;
        const { latitude } = position.coords; // destructuring
        const { longitude } = position.coords; // destructuring

        // url from google maps
        // console.log(
        //     `https://www.google.com/maps/@${latitude},${longitude}`
        // );

        const coords = [latitude, longitude];

        // from Leaflet, then edited. gives user location
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

    _hideForm() {
        // clear input fields after submitting
        inputDistance.value =
            inputDuration.value =
            inputCadence.value =
            inputElevation.value =
                '';

        // hide form
        form.style.display = 'none'; // remove transition/animation ♦
        form.classList.add('hidden');
        setTimeout(() => (form.style.display = 'grid'), 1000); // return display value to origianal value ♦
    }

    _toggleElevationField() {
        inputElevation
            .closest('.form__row')
            .classList.toggle('form__row--hidden');
        inputCadence
            .closest('.form__row')
            .classList.toggle('form__row--hidden');
    }

    // create new workout
    _newWorkout(e) {
        e.preventDefault(); // avoid default form behavior
        // console.log(this); // shows the this keyword must be bound

        // helper fxns
        const validInputs = (...inputs) =>
            inputs.every(inp => Number.isFinite(inp));
        const allPositive = (...inputs) => inputs.every(inp => inp > 0);

        // Get data from form
        const { lat, lng } = this.#mapEvent.latlng;
        let workout;
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;

        // If workout running, create running object
        if (type === 'running') {
            const cadence = +inputCadence.value;

            // Check if data valid - guard clause
            if (
                !validInputs(distance, duration, cadence) ||
                !allPositive(distance, duration, cadence)
            )
                return alert('Input has to be positive numbers');

            workout = new Running([lat, lng], distance, duration, cadence);
        }

        // If workout cycling, create cycling object
        if (type === 'cycling') {
            const elevation = +inputElevation.value;

            // Check if data valid - guard clause
            if (
                !validInputs(distance, duration, elevation) ||
                !allPositive(distance, duration) // elevation could be neg
            )
                return alert('Input has to be positive numbers');

            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        // Add new object to workout array
        this.#workouts.push(workout);
        // console.log(workout); // check the objects created correctly

        // Render workout on map as marker
        this._rederWorkoutMarker(workout);

        // Render workout on the list
        this._renderWorkout(workout);

        // Hide form + clear input fields
        this._hideForm();
    }

    _rederWorkoutMarker(workout) {
        // marker + popup rendered on map - from Leaflet
        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`,
                })
            )
            .setPopupContent(
                `${workout.type === 'running' ? '🏃' : '🚴'} ${
                    workout.description
                }`
            ) // inherited method
            .openPopup(); // Read Leaflet documentation to remember how this chaining works
    }

    _renderWorkout(workout) {
        let html = `
            <li class="workout workout--${workout.type}" data-id="${
            workout.id
        }">
                <h2 class="workout__title">${workout.description}</h2>
                <div class="workout__details">
                    <span class="workout__icon">${
                        workout.type === 'running' ? '🏃' : '🚴'
                    }</span>
                    <span class="workout__value">${workout.duration}</span>
                    <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${workout.duration}</span>
                    <span class="workout__unit">min</span>
                </div>
            `; // data attribute used to build a bridge b/t the ui & data in the application

        if (workout.type === 'running')
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.pace.toFixed(
                        1
                    )}</span>
                    <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🦶🏼</span>
                    <span class="workout__value">${workout.cadence}</span>
                    <span class="workout__unit">spm</span>
                </div>
            </li>
            `;

        if (workout.type === 'cycling')
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.speed.toFixed(
                        1
                    )}</span>
                    <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⛰</span>
                    <span class="workout__value">${workout.elevationGain}</span>
                    <span class="workout__unit">m</span>
                </div>
            </li>
            `;

        form.insertAdjacentHTML('afterend', html);
    }
}

// create Instance
const app = new App(); // created on pg load b/c it's in the top level scope. Constructor executed on Instance creation.

// ♠ NOTE at the moment, if cycling is left as the inputType before pg refresh, the cadence/elevation input field is broken [will cause a problem when storing data] ♠
