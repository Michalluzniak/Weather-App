class WeatherApp {
    constructor() {}

    async init() {
        await this.getUserLocation();
        await this.geoToCity();
        await this.weatherDisplay();
        await this.cityImgDisplay();

        // this.firstLoadingScreen()
        this.firstLoadingScreen();

        this.timeDisplay();
        this.dateDisplay();
        this.startInterval()
    }

    async defaultCountry() {
        this.latitude = '35.652832';
        this.longitude = '139.839478';
        await this.geoToCity();
        await this.weatherDisplay();
        await this.cityImgDisplay();
        this.firstLoadingScreen();
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



    citiesSearchDisplay() {

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
                    console.log(data)
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

            let tempArr = [];
            let weatherIconArr = [];

            fetch('https://proxy.michalluzniak.ct8.pl/weatherunlocked/api/forecast/' + this.latitude + ',' + this.longitude + '?app_id=216ef3c2&lang=en&app_key=4aea43f539be0106a49394913bd99caa')
                .then(res => res.json())
                .then(data => {
                    // console.log(data)
                    for (let i = 0; i <= data['Days'].length - 1; i++) {

                        tempArr.push(data['Days'][i]['Timeframes'][0]['temp_c'])
                        weatherIconArr.push(data['Days'][i]['Timeframes'][0]['wx_desc'])
                    }

                    let temperatureParagraphArr = [...temperatureParagraph]
                    if (this.isTouchDevice()) {
                        temperatureParagraphArr.splice(0, 1, (document.querySelector('.temperature__mobile')))

                        sliderDaysContainer.style.left = '0px';
                    }

                    temperatureParagraphArr.forEach((p, i) => {
                        p.innerHTML = tempArr[i] + '°'
                    })
                    weatherImg.forEach((icon, index) => {
                        icon.src = `/images/animated/${weatherIconArr[index]}.svg`

                    })
                    weatherDescription.forEach((description, i) => {
                        description.innerHTML =
                            data['Days'][i]['Timeframes'][0]['wx_desc'];
                    })
                    resolve();
                })
        })
    }

    timeDisplay() {
        let time = new Date();

        let utc = time.getTime() + (time.getTimezoneOffset() * 60000)

        let offset = this.timeZone.replace(':', '.').slice(0, -2)
        let decimalOffset = this.timeZone.slice(4, this.timeZone.length - 1)
        decimalOffset = decimalOffset == 3 ? 5 : 0;
        let timezone = offset + decimalOffset;

        // console.log(timezone)
        this.localTime = utc + (3600000 * timezone)

        this.localCityDate = new Date(this.localTime)

        let hours = this.localCityDate.getHours();
        let minutes = this.localCityDate.getMinutes();

        minutes = minutes < 10 ? '0' + minutes : minutes;
        const amOrPm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        ampm.innerHTML = amOrPm;
        const formatted =
            `${hours}:${minutes}<span class = "ampm"> ${ampm.innerText}</span>`
        fullHour.innerHTML = formatted;

        // console.log(testHours)
    }

    startInterval() {
        setInterval(() => this.timeDisplay(), 1000);
    }

    dateDisplay() {
        // this.localCityDate = new Date(this.localTime)

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


const app = new WeatherApp();
app.init();
// app.checkBoundary();

searchBtn.addEventListener('click', async () => {
    app.afterSearchLoading();
    await app.cityToGeo();
    await app.weatherDisplay();
    await app.cityImgDisplay();
    app.timeDisplay()
    app.dateDisplay();
    app.firstLoadingScreen()
})



window.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        app.afterSearchLoading();
        await app.cityToGeo();
        await app.weatherDisplay();
        await app.cityImgDisplay();
        app.timeDisplay()
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