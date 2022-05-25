'use strict';

// parent Class for Workout details
class Workout {
    // pulic fields
    date = new Date();
    id = (Date.now() + '').slice(-10); // used to identify/find from the array to be added to the Class App. Use a library to create unique id's
    clicks = 0; // adding only as an example of using the pucblic interface outside of its Class

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

    // public method - public interface
    click() {
        this.clicks++;
    } // adding only as an example of using the pucblic interface outside of its Class
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
    #mapZoomLevel = 13;
    #workouts = [];

    constructor() {
        // Get user's position
        this._getPosition();

        // Get data from local storage
        this._getLocalStorage();

        // Attach event handlers
        form.addEventListener('submit', this._newWorkout.bind(this)); // bind method returns new fxn

        // when exercise type changed in form, swap input fields
        inputType.addEventListener('change', this._toggleElevationField); // 'change' event is on the 'select' html tag

        // event delegation for an element that doesn't yet exist
        containerWorkouts.addEventListener(
            'click',
            this._moveToPopup.bind(this)
        );

        // reset form on page reload - personally added
        this._setFormSelect();
    } // no params needed b/c nothing passed in; constructor executed as soon as Instance created

    // private methods
    _setFormSelect() {
        inputType.value = 'running';
    } // personally added

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

        // from Leaflet, then edited. gives user location & sets zoom
        this.#map = L.map('map').setView(coords, this.#mapZoomLevel); // map string = id of element for rendering
        // L = Leaflet namespace (like Intl) & global variable ♦
        // 13 = zoom value
        // console.log(map); checking for methods

        // from Leaflet, then edited (tile src changed)
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map); // openstreetmap is an open source map; could use other maps

        // manage clicks on rendered map - reveal form
        this.#map.on('click', this._showForm.bind(this));

        // render markers of locally stored workouts when map is rendered
        this.#workouts.forEach(work => {
            this._renderWorkoutMarker(work);
        });
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

        // Add new object/instance to workout array
        this.#workouts.push(workout);
        // console.log(workout); // check the objects created correctly

        // Render workout on map as marker
        this._renderWorkoutMarker(workout);

        // Render workout on the list
        this._renderWorkout(workout);

        // Hide form + clear input fields
        this._hideForm();

        // Set local storage to all workouts
        this._setLocalStorage(); // called inside the _newWorkout() method b/c we want the Instances stored locally as soon as created
    }

    _renderWorkoutMarker(workout) {
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

    // workout to list
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

        // running
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

        // cycling
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

    _moveToPopup(e) {
        // event (e) used to match the element
        const workoutEl = e.target.closest('.workout');
        // console.log(workoutEl); // this is where the data attribute comes in handy

        // guard clause
        if (!workoutEl) return;
        const workout = this.#workouts.find(
            work => work.id === workoutEl.dataset.id
        );
        console.log(workout); // take coords from the element & move map to it's position [see method from Leaflet below]

        // from Leaflet
        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: { duration: 1 },
        });

        // using the public interface
        // workout.click(); // adding only as an example of using the pucblic interface outside of its Class; clicks property on each workout iinstance via inheritance. Disabled b/c Instances stored locally no longer have the prototype chain/inheritance when they're pulled from storage - [can be done by recreating the instances using the stored data]
    }

    _setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    } // 1st argument = key (any name) as a string. 2nd argument = value as a string that we want to store & associate w/ the key. JSON.stringify() converts an object to a string. localStorage = "blocking" API; only use w/ small amts of data to avoid slowing the app

    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('workouts')); // return stringified object to an object w/ JSON.parse().
        // console.log(data); // NOTICE prototypal inheritance broken

        // guard clause
        if (!data) return;
        this.#workouts = data;
        this.#workouts.forEach(work => {
            this._renderWorkout(work);
        }); // this fxn doesn't have to wait on the map rendering. So, it can be called w/ page load (creation of new App Instance)
    }

    // Public Interface - public method
    // empty local storage
    reset() {
        localStorage.removeItem('workouts'); // empty local storage
        location.reload(); // programmatically reload the pg. location = big object in the browsers
    } // can use this public method in the console
}

// create Instance
const app = new App(); // created on pg load b/c it's in the top level scope. Constructor executed on Instance creation.
