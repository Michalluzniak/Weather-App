class WeatherApp {
    constructor() {}

    async init() {
        await this.getUserLocation();
        await this.geoToCity();
        await this.timeDisplay();
        await this.weatherDisplay();
        await this.cityImgDisplay();
        this.getAllCities();

        this.dateDisplay();
        this.sunsetSunrise()
        this.startInterval()
        // this.firstLoadingScreen()
        this.firstLoadingScreen();

    }

    async defaultCountry() {
        this.latitude = '35.652832';
        this.longitude = '139.839478';
        await this.geoToCity();
        await this.weatherDisplay();
        await this.cityImgDisplay();
        this.firstLoadingScreen();
        this.getAllCities();
        this.timeDisplay();
        this.dateDisplay();
        this.startInterval()
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
                        resolve();
                    },
                    (error) => {
                        if (error.code == error.PERMISSION_DENIED) {
                            reject('cant get user location')
                            this.defaultCountry()
                        }
                    })
            }
        })
    }

    getAllCities() {

        this.citiesList = [];
        fetch('https://pkgstore.datahub.io/core/world-cities/world-cities_json/data/5b3dd46ad10990bca47b04b4739a02ba/world-cities_json.json')
            .then(res => res.json())
            .then(data => {
                // if (!data) return;
                for (const datum in data) {
                    this.citiesList.push(data[datum]);
                }
                // console.log(this.citiesList)
                // return this.citiesList;
            })
    }

    findMatches(wordToMatch) {
        return this.citiesList.filter(place => {

            wordToMatch.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            const regex = new RegExp(wordToMatch, 'gi')
            return place.name.match(regex) || place.country.match(regex);

        })
    }

    displayMatches(e) {
        this.inputValue = e.path[0].value;
        const matchArray = this.findMatches(this.inputValue)

        const html = matchArray.map((place, index = 0) => {
            const regex = new RegExp(this.inputValue, 'gi')

            const cityName =
                place.name.replace(regex, `<span class="hl">${this.inputValue.charAt(0).toUpperCase()+ e.path[0].value.slice(1)}</span>`);

            const country = place.country.replace(regex, `<span class="hl">${this.inputValue.charAt(0).toUpperCase()+ e.path[0].value.slice(1)}</span>`)
            if (index >= 6) return;

            index++
            return `
 <li class="citySuggestion">
 <span class="name">${cityName}, ${country}</span>
 </li>     
            `
        }).join('')

        searchSuggestion.innerHTML = html;
    }

    async geoToCity() {
        return new Promise((resolve, reject) => {


            fetch('https://proxy.michalluzniak.ct8.pl/positionstack/v1/reverse?access_key=' + this.apiKeys.weatherApiKey + '&timezone_module=1&query=' + this.latitude + ',' + this.longitude)
                .then(res => res.json())
                .then(data => {
                    // console.log(data)
                    this.cityName =
                        data['data']['0']['locality'];

                    city.innerText = this.cityName;

                    country.innerText =
                        data['data']['0']['country'];

                    this.timeZone =
                        data['data']['0']['timezone_module']['offset_string'];

                    citySearch.placeholder = `${this.cityName}, ${country.innerText.charAt(0).toUpperCase() + country.innerText.slice(1).toLowerCase()}`

                    resolve();
                })
                .catch(err => reject('wrong geolocation!'));
        })
    }

    cityToGeo() {
        return new Promise((resolve, reject) => {
            // console.log(this)

            fetch('https://proxy.michalluzniak.ct8.pl/positionstack/v1/forward?access_key=' + this.apiKeys.weatherApiKey + '&timezone_module=1&query=' + citySearch.value)
                .then(res => res.json())
                .then(data => {
                    // console.log(data)
                    // console.log(data['data'][`${1?1:0}`]['locality'])
                    this.timeZone =
                        data['data']['0']['timezone_module']['offset_string'];

                    this.latitude = data['data']['0']['latitude'];
                    this.longitude = data['data']['0']['longitude'];
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



                    // console.log(this.cityName);
                    country.innerText = data['data']['0']['country'];
                    city.innerText = this.cityName;
                    citySearch.placeholder = `${this.cityName}, ${country.innerText.charAt(0).toUpperCase() + country.innerText.slice(1).toLowerCase()}`
                    resolve();
                })
                .catch(err => {
                    reject(err)
                    loadingScreenAnimation.style.display = 'none';
                    ``
                    alert('cantll find city')
                });

        })
    }

    isTouchDevice() {
        return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
    }


    async weatherDisplay() {

        return new Promise((resolve, reject) => {
            let weatherIconArr = [];
            let temperatureParagraphArr = [...temperatureParagraph]

            fetch('https://proxy.michalluzniak.ct8.pl/weatherunlocked/api/forecast/' + this.latitude + ',' + this.longitude + '?app_id=216ef3c2&lang=en&app_key=4aea43f539be0106a49394913bd99caa')
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    this.sunsetTime = data['Days'][0]['sunset_time'];
                    this.sunriseTime = data['Days'][0]['sunrise_time'];
                    let localTimeString = this.localTimeCounters.replace(':', '')
                    let localDateString = this.localCityDate.toLocaleDateString('en-GB');

                    let nextSplitted = localDateString.split('/');
                    let prevSplitted = localDateString.split('/');

                    let nextDayNumber = ('0' + (nextSplitted[0] * 1 + 1))
                    let prevDayNumber = ('0' + (prevSplitted[0] * 1 - 1))

                    nextSplitted[0] = nextDayNumber;
                    prevSplitted[0] = prevDayNumber;
                    let nextDay = nextSplitted.join('/');
                    let prevDay = prevSplitted.join('/')
                    // console.log(prevDay)
                    // console.log(localDateString)

                    //loop over api object for 6 days forecast

                    if (localDateString == data['Days'][0]['date']) {

                        for (let i = 0; i < data['Days'].length - 1; i++) {

                            for (let j = 0; j <= data['Days'][i]['Timeframes'].length - 2; j++) {
                                // console.log('today')
                                // console.log(data['Days'][i]['Timeframes'][data['Days'][i]['Timeframes'].length - 1])

                                if (localTimeString >= data['Days'][i]['Timeframes'][j]['time'] && localTimeString < data['Days'][i]['Timeframes'][j + 1]['time']) {

                                    temperatureParagraphArr[i].innerHTML = data['Days'][i]['Timeframes'][j]['temp_c'] + '°'
                                    // console.log(temperatureParagraphArr)
                                    weatherDescription[i].innerHTML =
                                        data['Days'][i]['Timeframes'][j]['wx_desc'];

                                    weatherImg[i].src = `/images/animated/${data['Days'][i]['Timeframes'][j]['wx_desc']}.svg`

                                } else if (localTimeString >= data['Days'][i]['Timeframes'][data['Days'][i]['Timeframes'].length - 1]['time']) {

                                    temperatureParagraphArr[i].innerHTML = data['Days'][i]['Timeframes'][data['Days'][i]['Timeframes'].length - 1]['temp_c'] + '°'
                                    // console.log(temperatureParagraphArr)
                                    weatherDescription[i].innerHTML =
                                        data['Days'][i]['Timeframes'][data['Days'][i]['Timeframes'].length - 1]['wx_desc'];

                                    weatherImg[i].src = `/images/animated/${data['Days'][i]['Timeframes'][data['Days'][i]['Timeframes'].length - 1]['wx_desc']}.svg`

                                }
                            }
                        }
                        //Last day
                        temperatureParagraphArr[6].innerHTML = data['Days'][6]['Timeframes'][0]['temp_c'] + '°'
                        weatherImg[6].src = `/images/animated/${data['Days'][6]['Timeframes'][0]['wx_desc']}.svg`
                        weatherDescription[6].innerHTML =
                            data['Days'][6]['Timeframes'][0]['wx_desc'];

                    } else if (prevDay == data['Days'][0]['date']) {
                        console.log('yesterday')
                        // console.log(prevDay)
                        for (let i = 1; i <= data['Days'].length - 1; i++) {

                            for (let j = 0; j <= data['Days'][i]['Timeframes'].length - 1; j++) {


                                if (localTimeString >= data['Days'][i]['Timeframes'][j]['time'] && localTimeString < data['Days'][i]['Timeframes'][j + 1]['time']) {
                                    // console.log(i)

                                    temperatureParagraphArr[i - 1].innerHTML = data['Days'][i]['Timeframes'][j]['temp_c'] + '°';

                                    // console.log(temperatureParagraphArr)
                                    weatherDescription[i].innerHTML = data['Days'][i]['Timeframes'][j]['wx_desc'];

                                    weatherImg[i].src = `/images/animated/${data['Days'][i]['Timeframes'][j]['wx_desc']}.svg`
                                }
                            }
                        }
                        temperatureParagraphArr[6].innerHTML = 'N/A'
                        weatherImg[6].src = `/images/animated/Not available.svg`
                        weatherDescription[6].innerHTML = ''

                    }


                    if (this.isTouchDevice()) {
                        temperatureParagraphArr.splice(0, 1, (document.querySelector('.temperature__mobile')))

                        sliderDaysContainer.style.left = '0px';
                    }

                    resolve();
                })
        })
    }


    async timeDisplay() {
        return new Promise((resolve, reject) => {
            let time = new Date();
            let utc = time.getTime() + (time.getTimezoneOffset() * 60000)

            let offset = this.timeZone.replace(':', '.').slice(0, -2)
            let decimalOffset = this.timeZone.slice(4, this.timeZone.length - 1)
            decimalOffset = decimalOffset == 3 ? 5 : 0;
            let timezone = offset + decimalOffset;

            // console.log(this)
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


    startInterval() {
        setInterval(() => this.timeDisplay(), 1000);
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
        const yearNr = this.localCityDate.getFullYear()
        const monthName = months[this.localCityDate.getMonth()]
        const formatted = `${dayName}, ${dayNr} ${monthName} ${yearNr}`
        this.numberDayFormatted =
            fullDate.innerText = formatted;
        let dayQ = days.findIndex(day => day === dayName);

        for (let i = 0; i < 6; i++) {
            nextDays[i].textContent = days[(i + dayQ + 1) % 7]
        }
        // let j = dayQ + 1;
        // let i = 0;
        // do {
        //     nextDays[i].textContent = days[j]
        //     i++
        //     j++
        //     if (j === 7) j = 0;
        // } while (dayQ != j)
    }

    sunsetSunrise() {
        // this.localTime > this.sunsetTime ? sunriseSunsetTime.src = 'images/animated/sunset.svg' : sunriseSunsetTime.src = 'images/animated/sunrise.svg'
        let a = this.localTimeCounters.split(':')
        let b = this.sunsetTime.split(':')
        let c = this.sunriseTime.split(':')
        let localTimeA = (a[0]) * 3600 + (a[1]) * 60
        let sunsetTimeB = (b[0]) * 3600 + (b[1]) * 60
        let sunriseTimeC = (c[0]) * 3600 + (c[1]) * 60
        // console.log(localTimeA, sunsetTimeB, sunriseTimeC)

        if (localTimeA < sunriseTimeC) {
            sunriseSunsetTime.src = 'images/animated/sunrise.svg';
            sunsetParagraph.innerText = `Sunrise at`;
            sunsetParagraphTime.innerText = this.sunriseTime;
        } else if (localTimeA < sunsetTimeB) {
            sunriseSunsetTime.src = 'images/animated/sunset.svg';
            sunsetParagraph.innerText = `Sunset at`;
            sunsetParagraphTime.innerText = this.sunsetTime;

            // console.log(this.localTimeCounters, this.sunsetTime, this.sunriseTime)
        }


    }

    async cityImgDisplay() {

        return new Promise((resolve, reject) => {

            fetch('https://api.unsplash.com/search/photos/?query=' + this.cityName + '&client_id=' + this.apiKeys.cityBgClientId)
                .then(res => res.json())
                .then(data => {
                    // console.log(data)
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

    checkBoundary() {

        this.outer = weatherInfoBar.getBoundingClientRect();
        this.inner = sliderDaysContainer.getBoundingClientRect();
        // console.log(this.inner.right)

        if (parseInt(sliderDaysContainer.style.left) > 0) {
            sliderDaysContainer.style.left = '0px';
        } else if (this.inner.right < this.outer.right) {

            sliderDaysContainer.style.left = `-${this.inner.width - this.outer.width}px`
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

            this.checkBoundary()
        }
    }





    firstLoadingScreen() {
        loadingScreenAnimation.style.display = 'none';
    }

    afterSearchLoading() {
        loadingScreenAnimation.style.display = 'flex';
    }
}
let searchSuggestion = document.querySelector('.suggestions')
let citySearch = document.querySelector('.city__search');
const searchBtn = document.querySelector('.search__icon');
const humidity = document.querySelector('.humidity');
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
const loadingScreenAnimation = document.querySelector('.loading__screen');
const nextDays = document.querySelectorAll('.next__day h3');
const sliderDaysContainer = document.querySelector('.rest__of__days__container');
let citySuggestion = document.getElementsByClassName('citySuggestion')
let citySuggestionArr;
let sunriseSunsetTime = document.querySelector('.sunset__sunrise')
let sunsetParagraph = document.querySelector('.sunset__paragraph')
let sunsetParagraphTime = document.querySelector('.sunset__paragraph__time')


const app = new WeatherApp();
app.init();
// app.checkBoundary();

const searchForCityBtn = async () => {
    app.afterSearchLoading();
    await app.cityToGeo();
    await app.timeDisplay()
    await app.weatherDisplay();
    await app.cityImgDisplay();

    app.dateDisplay();
    app.firstLoadingScreen()
}

searchBtn.addEventListener('click', searchForCityBtn);

citySearch.addEventListener('keyup', (e) => {
    if (window.innerWidth < 1280) return;
    if (e.path[0].value === "") {
        let searchRet = searchSuggestion.innerHTML = "";
        let bgRet = searchSuggestion.style.backgroundColor = "";
        return [searchRet, bgRet];
    } else if (e.path[0].value.length < 3) return;
    app.displayMatches(e);
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
        app.afterSearchLoading();
        await app.cityToGeo();
        await app.timeDisplay()
        await app.weatherDisplay();
        await app.cityImgDisplay();

        app.dateDisplay();
        app.firstLoadingScreen()
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