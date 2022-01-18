class WeatherApp {
    constructor(CelcOrFahrTemp = 'temp_c') {
        this.CelcOrFahrTemp = CelcOrFahrTemp;
    }

    async init() {
        await this.getUserLocation();
        await this.geolocationToCity();
        await this.timeDisplay();
        await this.startInterval()
        this.dateDisplay();
        await this.weatherInfoDisplay();
        await this.cityImgDisplay();
        this.getAllCitiesList();
        this.sunsetOrSunrise()
        this.loadingScreenEnd();
    }



    // DEFAULT COUNTRY = WARSAW
    async defaultCountry() {
        this.latitude = '52.237049';
        this.longitude = '21.017532';
        await this.geolocationToCity();
        await this.timeDisplay();
        await this.startInterval()
        this.dateDisplay();
        await this.weatherInfoDisplay();
        await this.cityImgDisplay();
        this.getAllCitiesList();
        this.sunsetOrSunrise()
        this.loadingScreenEnd();
    }

    apiKeys = {
        weatherApiKey: 'b272107a55d9dc4c8dadcb14ac36e8a4',
        cityBgClientId: 'gWcvKefEIJ-yKMQh9mWR2FNmSZ-4YWFqUu0QptdRRyg',
    }

    async getUserLocation() {
        return new Promise((resolve, reject) => {

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                        this.latitude = position.coords.latitude;
                        this.longitude = position.coords.longitude;
                        loadingContainer.style.display = 'flex';
                        resolve();
                    },
                    (error) => {
                        if (error.code == error.PERMISSION_DENIED) {
                            reject('cant get user location')
                            locationNotification.style.display = 'flex'
                        }
                    })
            }
        })
    }

    getAllCitiesList() {

        this.citiesList = [];
        fetch('https://pkgstore.datahub.io/core/world-cities/world-cities_json/data/5b3dd46ad10990bca47b04b4739a02ba/world-cities_json.json')
            .then(res => res.json())
            .then(data => {

                for (const datum in data) {
                    this.citiesList.push(data[datum]);
                }
            })
    }

    findSearchMatches(wordToMatch) {
        return this.citiesList.filter(place => {
            const regex = new RegExp(wordToMatch, 'gi')
            return place.name.match(regex) || place.country.match(regex);
        })
    }

    displaySearchMatches(e) {
        this.inputValue = e.path[0].value;
        const matchArray = this.findSearchMatches(this.inputValue)
        const html = matchArray.map((place, index = 0) => {
            const regex = new RegExp(this.inputValue, 'gi')

            const cityName =
                place.name.replace(regex, `<span class="hl">${this.inputValue.charAt(0).toUpperCase()+ e.path[0].value.slice(1)}</span>`);

            const countryName = place.country.replace(regex, `<span class="hl">${this.inputValue.charAt(0).toUpperCase()+ e.path[0].value.slice(1)}</span>`)
            if (index >= 6) return;

            index++
            return `
            <li class="citySuggestion">
            <span class="name">${cityName}, ${countryName}</span>
            </li>`
        }).join('')
        searchSuggestion.innerHTML = html;
    }

    async geolocationToCity() {
        return new Promise((resolve, reject) => {

            fetch('https://proxy.michalluzniak.ct8.pl/positionstack/v1/reverse?access_key=' + this.apiKeys.weatherApiKey + '&timezone_module=1&query=' + this.latitude + ',' + this.longitude)
                .then(res => res.json())
                .then(data => {
                    console.log(this)

                    this.cityName =
                        data['data']['0']['locality'];

                    city.innerText = this.cityName;

                    this.countryName = data['data']['0']['country'];

                    country.innerText = this.countryName;

                    this.timeZone =
                        data['data']['0']['timezone_module']['offset_string'];

                    citySearch.placeholder = `${this.cityName}, ${country.innerText.charAt(0).toUpperCase() + country.innerText.slice(1).toLowerCase()}`
                    resolve();
                })
                .catch(err => console.log(err));
        })
    }

    cityToGeolocation() {
        return new Promise((resolve, reject) => {

            fetch('https://proxy.michalluzniak.ct8.pl/positionstack/v1/forward?access_key=' + this.apiKeys.weatherApiKey + '&timezone_module=1&query=' + citySearch.value)
                .then(res => res.json())
                .then(data => {

                    this.timeZone =
                        data['data']['0']['timezone_module']['offset_string'];

                    this.latitude = data['data']['0']['latitude'];
                    this.longitude = data['data']['0']['longitude'];
                    // some spaghetti code resulting from free API
                    this.cityName =
                        data['data']['0']['locality'] == null ?
                        (data['data']['1'] == undefined ?
                            (data['data']['0']['name']) :
                            data['data']['1']['name']) :
                        data['data']['0']['locality'] == null ?
                        (data['data']['1']['locality'] == null ?
                            data['data']['2']['locality'] :
                            data['data']['1']['locality']) :
                        data['data']['0']['locality']

                    country.innerText = data['data']['0']['country'];
                    city.innerText = this.cityName;
                    citySearch.placeholder = `${this.cityName}, ${country.innerText.charAt(0).toUpperCase() + country.innerText.slice(1).toLowerCase()}`
                    resolve();
                })
                .catch(err => {
                    reject(err)
                    loadingScreenAnimation.style.display = 'none';
                    alert(`can't find city`)
                });

        })
    }

    isTouchDevice() {
        return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
    }

    celciusOrFahrenheitSwitch(e) {
        this.CelcOrFahrTemp = e.checked ?
            // Change Celcius to Fahrenheit and km/h to mph
            (this.temperatureParagraphArr.forEach((temp, idx) => {
                    if (temp.innerText === 'N/A') return;
                    temp.innerText = (parseFloat(temp.innerText) * 1.8 + 32).toFixed(2) + '°F'
                }),
                windSpeedValue.innerText = (parseFloat(windSpeedValue.innerText) / 1.609344).toFixed(1), windSpeedScale.innerText = windSpeedScale.innerText.replace('km/h', 'mph')) :

            // Change Fahrenheit to Celcius and mph to km/h
            this.temperatureParagraphArr[0].innerText.includes('°C') ?
            console.log('cc') :
            (this.temperatureParagraphArr.forEach((temp, idx) => {
                    if (temp.innerText === 'N/A') return;
                    temp.innerText = (parseFloat(temp.innerText.replace('°F', '') - 32) / 1.8).toFixed(1) + '°C'
                }),
                windSpeedValue.innerText = (parseFloat(windSpeedValue.innerText) * 1.609344).toFixed(1), windSpeedScale.innerText = windSpeedScale.innerText.replace('mph', 'km/h'))
    }


    async weatherInfoDisplay() {
        return new Promise((resolve, reject) => {
            this.weatherImgArr = [...weatherImg];
            this.temperatureParagraphArr = [...temperatureParagraph];
            this.weatherDescriptionArr = [...weatherDescription];


            let dayOrNight = 'day'

            fetch('https://proxy.michalluzniak.ct8.pl/weatherunlocked/api/forecast/' + this.latitude + ',' + this.longitude + '?app_id=216ef3c2&lang=en&app_key=4aea43f539be0106a49394913bd99caa')
                .then(res => res.json())
                .then(data => {
                    console.log(data)


                    if (this.isTouchDevice()) {
                        this.temperatureParagraphArr.splice(0, 1, (document.querySelector('.temperature__mobile')))
                        humidity = document.querySelector('.humidity__mobile');
                        windSpeedValue = document.querySelector('.windspeed__value__mobile');
                        windSpeedScale = document.querySelector('.windspeed__scale__mobile')
                        this.weatherImgArr.splice(0, 1, (document.querySelector('.weather__icon__mobile')))
                        // console.clear();
                        this.weatherDescriptionArr.splice(0, 1, (document.querySelector('.weather__description__mobile')))
                        console.log('touch device')
                        sliderDaysContainer.style.left = '0px';
                    }

                    let localTimeToString = this.localTimeCounters.replace(':', '')
                    let localDateToString = this.localCityDate.toLocaleDateString('en-GB');

                    let prevDayDate = this.localCityDate;
                    prevDayDate.setDate(prevDayDate.getDate() - 1)
                    console.log(localDateToString)
                    let prevDayDateString =
                        `${prevDayDate.getDate() < 10? '0' + prevDayDate.getDate(): prevDayDate.getDate()}/${(prevDayDate.getMonth() + 1) < 10 ? 
                            ("0" + (prevDayDate.getMonth()+ 1)) :
                             (prevDayDate.getMonth() + 1)}/${prevDayDate.getFullYear()}`

                    console.log(prevDayDateString, localDateToString)

                    if (localDateToString == data['Days'][0]['date']) {
                        //loop over api object for 7 days forecast
                        this.sunsetTime = data['Days'][0]['sunset_time'];
                        this.sunriseTime = data['Days'][0]['sunrise_time'];
                        this.nextDaySunrise = data['Days'][1]['sunrise_time'];

                        for (let i = 0; i < data['Days'].length - 1; i++) {
                            for (let j = 0; j <= data['Days'][i]['Timeframes'].length - 2; j++) {

                                let apiShortcuts = {
                                    firstDayRule: data['Days'][0]['Timeframes'][j],

                                    default: data['Days'][i]['Timeframes'][j],

                                    nextElement: data['Days'][i]['Timeframes'][j + 1],

                                    firstDayLoop: data['Days'][0]['Timeframes'][j],

                                    lastTimeframe: data['Days'][i]['Timeframes'][data['Days'][i]['Timeframes'].length - 1],

                                    firstDayLastTimeframe: data['Days'][0]['Timeframes'][data['Days'][0]['Timeframes'].length - 1],

                                    firstDayBeforeTimeframes: data['Days'][0]['Timeframes'][0],

                                    allDaysBeforeTimeframe: data['Days'][i]['Timeframes'][0],
                                }

                                if (localTimeToString >= apiShortcuts.default['time'] && localTimeToString < apiShortcuts.nextElement['time']) {

                                    // console.log('today normal')

                                    this.temperatureParagraphArr[i].innerHTML =
                                        apiShortcuts.default['temp_c'] + '°C'

                                    this.weatherDescriptionArr[i].innerHTML =
                                        apiShortcuts.default['wx_desc'];

                                    this.weatherImgArr[i].src = `/images/animated/${apiShortcuts.default['wx_desc']}.svg`

                                    if (i < 1) {

                                        humidity.innerHTML = `HUMIDITY: <br> ${apiShortcuts.firstDayLoop['humid_pct']}%`

                                        windSpeedValue.innerText = apiShortcuts.firstDayLoop['windspd_kmh']
                                    }

                                } else if (localTimeToString >= apiShortcuts.lastTimeframe['time']) {

                                    console.log('today after last timeframe')

                                    this.temperatureParagraphArr[i].innerHTML = apiShortcuts.lastTimeframe['temp_c'] + '°C'

                                    this.weatherDescriptionArr[i].innerHTML =
                                        apiShortcuts.lastTimeframe['wx_desc'];

                                    this.weatherImgArr[i].src = `/images/animated/${apiShortcuts.lastTimeframe['wx_desc']}.svg`

                                    humidity.innerHTML = `HUMIDITY: <br> ${apiShortcuts.firstDayLastTimeframe['humid_pct']}%`

                                    windSpeedValue.innerText = apiShortcuts.firstDayLastTimeframe['windspd_kmh']

                                } else if (localTimeToString <
                                    apiShortcuts.firstDayBeforeTimeframes['time']) {
                                    console.log('today before first timeframe')

                                    this.temperatureParagraphArr[i].innerHTML = apiShortcuts.allDaysBeforeTimeframe['temp_c'] + '°C'

                                    this.weatherDescriptionArr[i].innerHTML =
                                        apiShortcuts.allDaysBeforeTimeframe['wx_desc'];

                                    this.weatherImgArr[i].src = `/images/animated/${apiShortcuts.allDaysBeforeTimeframe['wx_desc']}.svg`

                                    humidity.innerHTML = `HUMIDITY: <br> ${apiShortcuts.firstDayBeforeTimeframes['humid_pct']}%`

                                    windSpeedValue.innerText = apiShortcuts.firstDayBeforeTimeframes['windspd_kmh']
                                }
                            }
                        }
                        //Last day
                        this.temperatureParagraphArr[6].innerHTML = data['Days'][6]['Timeframes'][0]['temp_c'] + '°C'
                        this.weatherImgArr[6].src = `/images/animated/${data['Days'][6]['Timeframes'][0]['wx_desc']}.svg`
                        weatherDescription[6].innerHTML =
                            data['Days'][6]['Timeframes'][0]['wx_desc'];

                    } else if (prevDayDateString == data['Days'][0]['date']) {
                        //loop over api object for 6 days forecast
                        this.sunsetTime = data['Days'][1]['sunset_time'];
                        this.sunriseTime = data['Days'][1]['sunrise_time'];
                        this.nextDaySunrise = data['Days'][2]['sunrise_time'];

                        for (let i = 1; i <= data['Days'].length - 1; i++) {

                            for (let j = 0; j <= data['Days'][i]['Timeframes'].length - 1; j++) {


                                let apiShortcuts = {
                                    default: data['Days'][i]['Timeframes'][j],

                                    secondDayDefault: data['Days'][1]['Timeframes'][j],

                                    nextElement: data['Days'][i]['Timeframes'][j + 1],

                                    secondDayBeforeTimeframes: data['Days'][i]['Timeframes'][0],

                                    secondDayBeforeOnly: data['Days'][1]['Timeframes'][0],
                                }

                                if (localTimeToString >= apiShortcuts.default['time'] && localTimeToString < apiShortcuts.nextElement['time']) {

                                    console.log('day before normal');

                                    this.temperatureParagraphArr[i - 1].innerHTML = apiShortcuts.default['temp_c'] + '°C'

                                    this.weatherDescriptionArr[i - 1].innerHTML = apiShortcuts.default['wx_desc'];

                                    this.weatherImgArr[i - 1].src = `/images/animated/${apiShortcuts.default['wx_desc']}.svg`
                                    if (i < 2) {

                                        humidity.innerHTML = `HUMIDITY: <br> ${apiShortcuts.secondDayDefault['humid_pct']}%`

                                        windSpeedValue.innerText = apiShortcuts.secondDayDefault['windspd_kmh']
                                    }

                                } else if (localTimeToString <
                                    apiShortcuts.secondDayBeforeTimeframes['time']) {

                                    console.log('day before smaller than first timeframe');

                                    this.temperatureParagraphArr[i - 1].innerHTML =
                                        apiShortcuts.secondDayBeforeTimeframes['temp_c'] +
                                        '°C'

                                    this.weatherDescriptionArr[i - 1].innerHTML =
                                        apiShortcuts.secondDayBeforeTimeframes['wx_desc'];

                                    this.weatherImgArr[i - 1].src = `/images/animated/${apiShortcuts.secondDayBeforeTimeframes['wx_desc']}.svg`

                                    humidity.innerHTML = `HUMIDITY: <br> ${
                                        apiShortcuts.secondDayBeforeOnly['humid_pct']}%`

                                    windSpeedValue.innerText =
                                        apiShortcuts.secondDayBeforeOnly['windspd_kmh']
                                }
                            }
                        }
                        //Last day N/A
                        console.log('prev')
                        this.temperatureParagraphArr[6].innerHTML = 'N/A'
                        this.weatherImgArr[6].src = `/images/animated/Not available.svg`
                        weatherDescription[6].innerHTML = ''
                    }

                    this.celciusOrFahrenheitSwitch(changeTempScale)
                    resolve();
                })
        })
    }

    sunsetOrSunrise() {
        let localTimeToNumber = this.localTimeCounters.replace(':', '') * 1;
        let sunsetTimeToNumber = this.sunsetTime.replace(':', '') * 1;
        let sunriseTimeToNumber = this.sunriseTime.replace(':', '') * 1;

        if (localTimeToNumber < sunsetTimeToNumber && localTimeToNumber > sunriseTimeToNumber) {
            sunsetParagraph.textContent = 'Sunset'
            sunsetParagraphTime.innerText = this.sunsetTime;
            sunriseSunsetImg.src = 'images/animated/sunset.svg'

        } else if (localTimeToNumber < sunriseTimeToNumber) {
            sunsetParagraph.textContent = 'Sunrise'
            sunsetParagraphTime.innerText = this.sunriseTime;
            sunriseSunsetImg.src = 'images/animated/sunrise.svg'

        } else if (localTimeToNumber > sunsetTimeToNumber) {
            sunsetParagraph.innerHTML = 'Next day <br> Sunrise'
            sunsetParagraphTime.innerText = this.nextDaySunrise;
            sunriseSunsetImg.src = 'images/animated/sunrise.svg'
        }
    }

    async timeDisplay() {
        return new Promise((resolve, reject) => {
            let time = new Date();
            let utc = time.getTime() + (time.getTimezoneOffset() * 60000)

            let offset = this.timeZone.replace(':', '.').slice(0, -2)
            let decimalOffset = this.timeZone.slice(4, this.timeZone.length - 1)
            decimalOffset = decimalOffset == 3 ? 5 : 0;
            let timezone = offset + decimalOffset;

            this.localTime = utc + (3600000 * timezone)

            this.localCityDate = new Date(this.localTime)

            this.hours = this.localCityDate.getHours();
            this.minutes = this.localCityDate.getMinutes();

            this.minutes = this.minutes < 10 ? '0' + this.minutes : this.minutes;
            const amOrPm = this.hours >= 12 ? 'PM' : 'AM';
            this.localTimeCounters = `${this.hours}:${this.minutes}`;
            this.hours = this.hours % 12;
            this.hours = this.hours ? this.hours : 12;
            ampm.innerHTML = amOrPm;

            const formatted =
                `${this.hours}:${this.minutes}<span class = "ampm"> ${ampm.innerText}</span>`
            fullHour.innerHTML = formatted;
            resolve();
        })
    }

    dateDisplay() {

        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];
        const days = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        ];

        const dayName = days[this.localCityDate.getDay()]
        const dayNr = this.localCityDate.getDate();
        // console.log(dayNr, 'day nr')
        const yearNr = this.localCityDate.getFullYear()
        const monthName = months[this.localCityDate.getMonth()]
        const formatted = `${dayName}, ${dayNr} ${monthName} ${yearNr}`
        this.numberDayFormatted =
            fullDate.innerText = formatted;
        let dayQ = days.findIndex(day => day === dayName);

        for (let i = 0; i < 6; i++) {
            nextDays[i].textContent = days[(i + dayQ + 1) % 7]
        }
        // alternative solution

        // let j = dayQ + 1;
        // let i = 0;
        // do {
        //     nextDays[i].textContent = days[j]
        //     i++
        //     j++
        //     if (j === 7) j = 0;
        // } while (dayQ != j)
    }

    async startInterval() {
        return new Promise(resolve => {
            setInterval(() => this.timeDisplay(), 1000);
            setInterval(() => this.dateDisplay(), 1000);
            resolve()
        })
    }

    async cityImgDisplay() {

        return new Promise((resolve, reject) => {

            fetch('https://api.unsplash.com/search/photos/?query=' + this.cityName + '&client_id=' + this.apiKeys.cityBgClientId)
                .then(res => res.json())
                .then(data => {
                    // console.log(data)
                    console.log('https://api.unsplash.com/search/photos/?query=' + this.cityName + this.countryName + '&client_id=' + this.apiKeys.cityBgClientId)
                    const img = new Image();
                    img.src = data['results'][1]['urls']['full'];
                    img.decode().then(() => {
                        bgPhoto.style.backgroundImage =
                            'url(' + img.src + ')';
                        resolve();
                    })
                })
                .catch(err => {

                    fetch('https://api.unsplash.com/search/photos/?query=lake&client_id=' + this.apiKeys.cityBgClientId)

                        .then(res => res.json()).then(data => {
                            bgPhoto.style.backgroundImage =
                                'url(' + data['results'][1]['urls']['full'] + ')';

                            resolve();
                        })
                });
        })
    }
    // End of weather script 
    mobileSliderLibrary = {
        pressed: false,
    }

    checkSliderBoundary() {

        this.outer = weatherInfoBar.getBoundingClientRect();
        this.inner = sliderDaysContainer.getBoundingClientRect();

        if (parseInt(sliderDaysContainer.style.left) > 0) {
            sliderDaysContainer.style.left = '0px';
            console.log('0')
            document.querySelector('.next__day:nth-of-type(3)').style.borderRight = '0px'

        } else if (this.inner.right < this.outer.right) {
            console.log('2')
            sliderDaysContainer.style.left = `-${this.inner.width - this.outer.width}px`
        } else if (parseInt(sliderDaysContainer.style.left) < 0) {
            console.log('1')
            document.querySelector('.next__day:nth-of-type(3)').style.borderRight = '1px solid #fff5';

        }
    }

    mobileDaysSlideStart(e) {
        this.mobileSliderLibrary.pressed = true;
        this.startPos = e.touches[0].clientX - sliderDaysContainer.offsetLeft
    }

    mobileDaysSlideEnd() {
        this.mobileSliderLibrary.pressed = false;
    }

    mobileTouchMove(e) {

        if (this.mobileSliderLibrary.pressed) {

            this.currentPos = e.touches[0].clientX;

            sliderDaysContainer.style.left =
                `${(this.currentPos - this.startPos)}px`

            this.checkSliderBoundary()
        }
    }

    loadingScreenEnd() {
        loadingScreenAnimation.style.display = 'none';

    }

    afterSearchAnimation() {
        loadingScreenAnimation.style.display = 'flex';
    }
}

const searchSuggestion = document.querySelector('.suggestions')
const citySearch = document.querySelector('.city__search');
const searchBtn = document.querySelector('.search__icon');
let humidity = document.querySelector('.humidity');
let windSpeedValue = document.querySelector('.windspeed__value')
let windSpeedScale = document.querySelector('.windspeed__scale')
const temperatureParagraph = document.querySelectorAll('.temperature');
const weatherImg = document.querySelectorAll('.weather__icon');
const weatherDescription = document.querySelectorAll('.weather__description');
const weatherInfoBar = document.querySelector('.weather__info');
const bgPhoto = document.querySelector('.bg__photo');
const country = document.querySelector('.country h2')
const city = document.querySelector('.city h3');
const fullDate = document.querySelector('p.date');
const fullHour = document.querySelector('p.hour');
const ampm = document.querySelector('span.ampm');
const nextDays = document.querySelectorAll('.next__day h3');
const sliderDaysContainer = document.querySelector('.rest__of__days__container');
const citySuggestion = document.getElementsByClassName('citySuggestion')
let citySuggestionArr;
const sunriseSunsetImg = document.querySelector('.sunset__sunrise')
const sunsetParagraph = document.querySelector('.sunset__paragraph')
const sunsetParagraphTime = document.querySelector('.sunset__paragraph__time')
const changeTempScale = document.querySelector('.temp__scale')
const locationNotification = document.querySelector('.location__notification')
const defaultLoadBtn = document.querySelector('.location__notification button')
const loadingScreenAnimation = document.querySelector('.loading__screen');
const loadingContainer = document.querySelector('.loading__container')

const app = new WeatherApp();



app.init();


changeTempScale.addEventListener('click', function (e) {

    app.celciusOrFahrenheitSwitch(e.path[0]);
})


defaultLoadBtn.addEventListener('click', () => {
    app.defaultCountry()
    locationNotification.style.display = 'none';
    loadingContainer.style.display = 'flex'
})

const searchForCityBtn = async () => {
    app.afterSearchAnimation();
    await app.cityToGeolocation();
    await app.timeDisplay()
    await app.weatherInfoDisplay();
    await app.cityImgDisplay();
    app.sunsetOrSunrise();
    app.dateDisplay();
    app.loadingScreenEnd()
}

searchBtn.addEventListener('click', searchForCityBtn);

citySearch.addEventListener('keyup', (e) => {
    console.log(e.path[0].value)
    if (window.innerWidth < 1280) return;
    if (e.path[0].value === "") {
        let searchRet = searchSuggestion.innerHTML = "";
        let bgRet = searchSuggestion.style.backgroundColor = "";
        return [searchRet, bgRet];
    } else if (e.path[0].value.length < 3) return;
    app.displaySearchMatches(e);
    citySuggestionArr = [...citySuggestion];
    chooseCitySuggestion();
});

const chooseCitySuggestion = function () {
    citySuggestionArr.forEach(suggestion => {

        suggestion.addEventListener('click', function () {
            citySearch.value = this.innerText
            searchForCityBtn();
            citySearch.value = "";
            searchSuggestion.innerHTML = "";
        })
    })
}

window.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        app.afterSearchAnimation();
        await app.cityToGeolocation();
        await app.timeDisplay()
        await app.weatherInfoDisplay();
        await app.cityImgDisplay();
        app.sunsetOrSunrise();
        app.dateDisplay();
        app.loadingScreenEnd()
    }
})

sliderDaysContainer.addEventListener('touchstart', (e) => {
    app.mobileDaysSlideStart(e)
});
sliderDaysContainer.addEventListener('touchend', (e) => {
    app.mobileDaysSlideEnd(e)
});
sliderDaysContainer.addEventListener('touchmove', (e) => {
    app.mobileTouchMove(e)
});