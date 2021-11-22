class WeatherApp {
    constructor() {}

    async init() {
        await this.getUserLocation();
        await this.weatherDisplay();
        await this.geoToCity();
        await this.cityImgDisplay();

        // this.firstLoadingScreen()
        this.firstLoadingScreen();

        this.timeDisplay();
        this.dateDisplay();
        this.startInterval()
    }

    apiKeys = {
        weatherApiKey: 'b272107a55d9dc4c8dadcb14ac36e8a4',
        cityBgClientId: 'gWcvKefEIJ-yKMQh9mWR2FNmSZ-4YWFqUu0QptdRRyg'
    }

    async getUserLocation() {
        return new Promise((resolve, reject) => {

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    this.latitude = position.coords.latitude;
                    this.longitude = position.coords.longitude;
                    resolve();
                })
            } else {
                reject('can\'t get user location')
            }
        })
    }

    async geoToCity() {
        return new Promise((resolve, reject) => {


            fetch('http://api.positionstack.com/v1/reverse?access_key=' + this.apiKeys.weatherApiKey + '&timezone_module=1&query=' + this.latitude + ',' + this.longitude)
                .then(res => res.json())
                .then(data => {

                    this.cityName =
                        data['data']['0']['administrative_area'];
                    city.innerText = this.cityName;

                    country.innerText =
                        data['data']['0']['country'];

                    this.timeZone =
                        data['data']['0']['timezone_module']['offset_string'];


                    resolve();
                })
                .catch(err => reject('wrong geolocation!'));
        })
    }
    cityToGeo() {
        return new Promise((resolve, reject) => {
            console.log(this)

            fetch('http://api.positionstack.com/v1/forward?access_key=' + this.apiKeys.weatherApiKey + '&timezone_module=1&query=' + citySearch.value)
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    this.timeZone =
                        data['data']['0']['timezone_module']['offset_string'];
                    console.log(this.timeZone)
                    this.latitude = data['data']['0']['latitude'];
                    this.longitude = data['data']['0']['longitude'];
                    this.cityName = data['data']['1']['locality'];
                    console.log(this.cityName);
                    country.innerText = data['data']['0']['country'];
                    city.innerText = this.cityName;
                    resolve();
                })
                .catch(err => {
                    reject('wrong')
                    loadingScreenAnimation.style.display = 'none';
                    alert('cant find city')
                });

        })
    }
    async weatherDisplay() {

        return new Promise((resolve, reject) => {

            let tempArr = [];
            let weatherIconArr = [];

            fetch('http://api.weatherunlocked.com/api/forecast/' + this.latitude + ',' + this.longitude + '?app_id=216ef3c2&lang=en&app_key=4aea43f539be0106a49394913bd99caa')
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    for (let i = 0; i <= data['Days'].length - 1; i++) {

                        tempArr.push(data['Days'][i]['Timeframes'][0]['temp_c'])
                        weatherIconArr.push(data['Days'][i]['Timeframes'][0]['wx_desc'])
                    }

                    temperatureParagraph.forEach((p, i) => {
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
        this.localCityDate = new Date(this.localTime)

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
    }

    async cityImgDisplay() {

        return new Promise((resolve, reject) => {

            console.log(this.cityName + ' city')
            fetch('https://api.unsplash.com/search/photos/?query=' + this.cityName + ' city&client_id=' + this.apiKeys.cityBgClientId)
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    const img = new Image();
                    img.src = data['results'][0]['urls']['full'];
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

    firstLoadingScreen() {
        loadingScreenAnimation.style.display = 'none';
    }

    afterSearchLoading() {
        loadingScreenAnimation.style.display = 'flex';
    }
}

let citySearch = document.querySelector('.city__search');
const searchBtn = document.querySelector('.search__icon');
const temperature = document.querySelector('.temperature');
const humidity = document.querySelector('.humidity');
const temperatureParagraph = document.querySelectorAll('.temperature');
const weatherImg = document.querySelectorAll('.weather__icon');
const weatherDescription = document.querySelectorAll('.weather__description');
const bgPhoto = document.querySelector('.bg__photo');
const country = document.querySelector('.country h2')
const city = document.querySelector('.city h3')
const fullDate = document.querySelector('p.date');
const fullHour = document.querySelector('p.hour');
const ampm = document.querySelector('span.ampm');
const loadingScreenAnimation = document.querySelector('.loading__screen');


const app = new WeatherApp();
app.init();

searchBtn.addEventListener('click', async () => {
    app.afterSearchLoading();
    await app.cityToGeo();
    await app.weatherDisplay();
    await app.cityImgDisplay();
    app.timeDisplay()
    app.dateDisplay();
    app.firstLoadingScreen()
})



window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        app.cityToGeo();
        app.weatherDisplay();
        app.cityImgDisplay();

    }
})