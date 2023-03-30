// importing the data form the json file
fetch("http://localhost:3000/all-timezone-cities")
  .then((res) => res.text())
  .then((res) => res.replace(/�/g, "°"))
  .then((res) => JSON.parse(res))
  .then((res) => {
    let main = new Global_variable(res);
    main.on_load();
  });
/**
 *
 *@description this is the main class which contains all the function and the constructor
 * @class Global_variable
 */
class Global_variable {
  /**
   * Creates an instance of Global_variable.
   * @description constructor for the class global_variable
   * @param {Array} data all cities objects in an array
   * @memberof Global_variable
   */
  constructor(data) {
    this.data = data.sort((a, b) => {
      return a.cityName.localeCompare(b.cityName);
    });
    this.dateAndTime = [];
    this.city_names;
    this.data_city = this.data[0];
    this.current_city;
    this.card_count = 3;
    this.display_data_values = [];
    this.card_weather_image;
    this.cards_data_value = [];
    this.continent_arrow_rotate = false;
    this.temperature_arrow_rotate = false;
    this.five_hours_temperature = [];
  }

  /**
   * @description this is the function which will execute when the page is reloaded
   * @event this also has the eventlisners
   * @memberof Global_variable
   */
  on_load() {
    this.get_data();
    this.input_field_top_section();
    this.init();
    this.update_top_section();
    this.update_card("sunny");
    // event listener for updating the cards
    document.querySelector(".left_arrow").style.visibility = "hidden";
    document.querySelector(".right_arrow").style.visibility = "hidden";
    // on window load event lisntner
    this.sort_continents(
      this.continent_arrow_rotate,
      this.temperature_arrow_rotate
    );
  }

  /**
   * @description function stores all the citynames in (this.city_names) array as lowercase
   * @memberof Global_variable
   */
  get_data() {
    // city name array sorted
    this.city_names = this.data.map((a) => {
      return a.cityName.toLowerCase();
    });
  }

  /**
   * @description function will get data for next five hours temperature in an array and calls update_top_section funcation which will update the top section
   * @memberof Global_variable
   */
  async get_next_five_hours(exactCurrentCity) {
    let url_json = await fetch(
      `http://localhost:3000/cityname/${exactCurrentCity}`
    );
    let val = await url_json.json();
    val.hours = 6;
    let post_url = await fetch("http://localhost:3000/hourly-forecast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(val),
    });
    let temp_arr = await post_url.json();
    this.five_hours_temperature = await temp_arr.temperature;
    this.five_hours_temperature = this.five_hours_temperature.map((value) => {
      return value.replace("�", "°");
    });
  }

  /**
   * @description function will update the top input field datalist
   *
   * @memberof Global_variable
   */
  input_field_top_section() {
    // data list for the input field
    let city_class = document.querySelector("#citi_names");

    let city_class_html = `<datalist id="citi_names">`;
    for (let index = 0; index < this.city_names.length; index++) {
      city_class_html += `<option value="${this.data[index].cityName}">${this.data[index].cityName}</option>`;
    }

    city_class_html += `<datalist>`;
    city_class.innerHTML = city_class_html;
    // end here
    // variables default declaration
    this.current_city = document
      .querySelector(".input_cities")
      .value.toLowerCase();
  }

  /**
   * @description initial function which has all the event listners and the setinterval function
   *
   * @memberof Global_variable
   */
  init() {
    // event listeners - for loading the window and for changing the input field
    document
      .querySelector(".input_cities")
      .addEventListener("input", this.update_top_section.bind(this));

    // section 2 getting the count of display cards
    document.querySelector("#count").addEventListener("change", () => {
      this.card_count = document.querySelector("#count").value;
      this.display_fun(this.card_count);
    });
    document
      .querySelector("#sunny")
      .addEventListener("click", this.update_card.bind(this, "sunny"));
    document
      .querySelector("#cold")
      .addEventListener("click", this.update_card.bind(this, "cold"));
    document
      .querySelector("#rainy")
      .addEventListener("click", this.update_card.bind(this, "rainy"));

    // section 2 scrolling buttons
    document
      .querySelector(".left_arrow")
      .addEventListener("click", function () {
        document.querySelector(".citi_cards").scrollLeft -= 310;
      });
    document
      .querySelector(".right_arrow")
      .addEventListener("click", function () {
        document.querySelector(".citi_cards").scrollLeft += 310;
      });

    //section 3 event listner
    document.querySelector(".arrow_down").addEventListener("click", () => {
      this.continent_arrow_rotate = !this.continent_arrow_rotate;
      if (this.continent_arrow_rotate) {
        document.querySelector(".arrow_down_img").style.transform =
          "rotate(180deg)";
        this.sort_continents.call(
          this,
          this.continent_arrow_rotate,
          this.temperature_arrow_rotate
        );
      } else {
        document.querySelector(".arrow_down_img").style.transform =
          "rotate(0deg)";
        this.sort_continents.call(
          this,
          this.continent_arrow_rotate,
          this.temperature_arrow_rotate
        );
      }
    });
    document.querySelector(".arrow_up").addEventListener("click", () => {
      this.temperature_arrow_rotate = !this.temperature_arrow_rotate;
      if (this.temperature_arrow_rotate) {
        document.querySelector(".arrow_up_img").style.transform =
          "rotate(180deg)";
        this.sort_continents.call(
          this,
          this.continent_arrow_rotate,
          this.temperature_arrow_rotate
        );
      } else {
        document.querySelector(".arrow_up_img").style.transform =
          "rotate(0deg)";
        this.sort_continents.call(
          this,
          this.continent_arrow_rotate,
          this.temperature_arrow_rotate
        );
      }
    });

    // set interval to update time for the top section
    window.setInterval(() => {
      this.changeDateTime();
    }, 1000);
    // set interval to update time for the middle and bottom sections
    window.setInterval(() => {
      this.update_card_time();
      this.update_box_time();
    }, 60000);
  }

  /**
   *@description update function, this function updates the temperature, precipitation, humidity when the function is called.
   * This will be called when the input field gets change
   * @memberof Global_variable
   */
  async update_top_section() {
    this.current_city = document
      .querySelector(".input_cities")
      .value.toLowerCase();

    if (this.city_names.includes(this.current_city)) {
      // remove warning at the starting
      this.data_city = this.data[this.current_city];
      this.data.map((val) => {
        if (val.cityName.toLowerCase() == this.current_city) {
          this.data_city = val;
        }
      });

      let exactCurrentCity;
      for (const value of this.data) {
        if (this.current_city == value.cityName.toLowerCase()) {
          exactCurrentCity = value.cityName;
        }
      }
      await this.get_next_five_hours(exactCurrentCity);
      document.querySelector("#input_cities").classList.remove("warning");
      document.querySelector(
        "#city_img"
      ).src = `./assets/Icons_for_cities/${this.current_city}.svg`;

      //changing temperature - celsius
      document.querySelector(".value_celsius").innerText =
        this.data_city.temperature;
      document.querySelector(".value_fahrenheit").innerHTML =
        parseFloat(parseInt(this.data_city.temperature) * 1.8).toFixed(1) +
        32 +
        `&#8457`;

      //changing humidity
      document.querySelector(".value_humidity").innerText =
        this.data_city.humidity;
      //changing precipitation
      document.querySelector(".value_precipitation").innerText =
        this.data_city.precipitation;

      let nextFiveHrs = [];
      nextFiveHrs.push(this.data_city.temperature);
      nextFiveHrs = nextFiveHrs.concat(this.data_city.nextFiveHrs);
      let temp_html = "";
      let img_html = "";

      //changing the icons at timeline
      for (const temp of this.five_hours_temperature) {
        if (parseInt(temp) >= 23 && parseInt(temp) < 29) {
          img_html += `<img src="./assets/Weather_Icons/cloudyIcon.svg">`;
        } else if (parseInt(temp) > 18 && parseInt(temp) < 23) {
          img_html += `<img src="./assets/Weather_Icons/windyIcon.svg">`;
        } else if (parseInt(temp) <= 18) {
          img_html += `<img src="./assets/Weather_Icons/rainyIcon.svg">`;
        } else if (parseInt(temp) >= 29) {
          img_html += `<img src="./assets/Weather_Icons/sunnyIcon.svg">`;
        }
        temp_html += `<span>${temp}</span>`;
      }
      document.querySelector(".temp").innerHTML = temp_html;
      document.querySelector(".clouds").innerHTML = img_html;
    }

    // else part
    else {
      document.querySelector("#input_cities").classList.add("warning");
      document.querySelector("#city_img").src =
        "./assets/General_Images_&_Icons/warning.svg";
      document.querySelector(".value_celsius").innerText = "NIL";
      document.querySelector(".value_fahrenheit").innerHTML = "NIL";
      document.querySelector(".value_humidity").innerText = "NIL";
      document.querySelector(".value_precipitation").innerText = "NIL";
      let temp_html = "";
      let img_html = "";
      for (let index = 0; index < 5; index++) {
        temp_html += `<span>NIL</span>`;
        img_html += `<img src="./assets/General_Images_&_Icons/warning.svg">`;
      }
      document.querySelector(".temp").innerHTML = temp_html;
      document.querySelector(".clouds").innerHTML = img_html;
    }
  }

  /**
   *@description get the date and time of the reqested timezone, changes the format and returns it as an array
   *
   * @param {string} timeZone is a string which contatins the timezone of the requested city
   * @return { Array}  returns the data and time as an array in the format of ['data', 'H', 'M', 'S', 'AM/PM']
   * @memberof Global_variable
   */
  change_date_time_format(timeZone) {
    let dateAndTime_arr = [];
    var arr = new Date()
      .toLocaleString("en-US", { timeZone: timeZone })
      .split(" ");
    var date = arr[0].split("/");
    let month = [
      "Jan",
      "Feb",
      "Mar",
      "April",
      "May",
      "June",
      "July",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];
    dateAndTime_arr.push(
      date[0] + "-" + month[date[0] - 1] + "-" + parseInt(date[2])
    );

    dateAndTime_arr = dateAndTime_arr.concat(arr[1].split(":"));
    dateAndTime_arr.push(arr[2]);
    return dateAndTime_arr;
  }

  /**
   * @description changing time function, this function will change the time and the date of the top section based on the user input field value
   * it changes time, date, am/pm state
   * @memberof Global_variable
   */
  changeDateTime() {
    if (this.city_names.includes(this.current_city.toLowerCase())) {
      document.querySelector("#state").style.visibility = "visible";

      let timeZone = this.data_city.timeZone;
      this.dateAndTime = this.change_date_time_format(timeZone);

      //   change date and time in html
      document.querySelector("#date").innerText = this.dateAndTime[0];
      document.querySelector(
        "#time"
      ).innerHTML = `<h1 id="time">${this.dateAndTime[1]}:${this.dateAndTime[2]}<span>:${this.dateAndTime[3]}</span></h1>`;
      this.hours_timeline(this.dateAndTime[1], this.dateAndTime[4]);
      if (this.dateAndTime[4] == "AM") {
        document.querySelector(
          "#state"
        ).src = `./assets/General_Images_&_Icons/amState.svg`;
      } else {
        document.querySelector(
          "#state"
        ).src = `./assets/General_Images_&_Icons/pmState.svg`;
      }
    } else {
      document.querySelector("#date").innerText = "NIL";
      document.querySelector("#time").innerHTML = "NIL";
      this.hours_timeline();
      document.querySelector("#state").style.visibility = "hidden";
    }
  }

  /**
   * @description function will update the hours timeline in the top section, --only update the hours data
   *
   * @param {number} hours current time data fo the selected city --only hour
   * @param {string} time AM/PM of the current city selected
   * @memberof Global_variable
   */
  hours_timeline(hours, time) {
    if (this.city_names.includes(this.current_city.toLowerCase())) {
      let hour = parseInt(hours);
      let time_html = `<span>NOW</span>`;
      for (let index = 0; index < 4; index++) {
        hour += 1;
        if (hour > 12) {
          hour = hour - 12;
          time = "PM";
        }
        time_html += `<span>${hour} ${time}</span>`;
      }

      document.querySelector(".hours").innerHTML = time_html;
    } else {
      let time_html = ``;
      for (let index = 0; index < 5; index++) {
        time_html += `<span>NIL</span>`;
      }
      document.querySelector(".hours").innerHTML = time_html;
    }
  }

  /**
   * section 2
   * @description function will get the user input string and collects all the data,
   *  filter the city based on the user input and stores it as an array. it calls the display function to display the cards
   *
   * @param {string} card_value sunny/rainy/cold - based on the user input in the section 2
   * @memberof Global_variable
   */
  update_card(card_value) {
    let sunny = document.querySelector("#sunny").classList;
    let rainy = document.querySelector("#rainy").classList;
    let cold = document.querySelector("#cold").classList;

    if (card_value == "sunny") {
      this.card_weather_image = `./assets/Weather_Icons/sunnyIcon.svg`;
      sunny.add("active");
      rainy.remove("active");
      cold.remove("active");
      let key_value = "temperature";
      this.display_data_values = this.sort_int(key_value).filter((value) => {
        return (
          parseInt(value.temperature) > 29 &&
          parseInt(value.humidity) < 50 &&
          parseInt(value.precipitation) >= 50
        );
      });
    } else if (card_value == "cold") {
      this.card_weather_image = `./assets/Weather_Icons/snowflakeIcon.svg`;
      sunny.remove("active");
      rainy.remove("active");
      cold.add("active");
      let key_value = "precipitation";
      this.display_data_values = this.sort_int(key_value).filter((value) => {
        return (
          parseInt(value.temperature) > 20 &&
          parseInt(value.temperature) < 29 &&
          parseInt(value.humidity) > 50 &&
          parseInt(value.precipitation) < 50
        );
      });
    } else {
      this.card_weather_image = `./assets/Weather_Icons/rainyIcon.svg`;
      sunny.remove("active");
      rainy.add("active");
      cold.remove("active");
      let key_value = "humidity";
      this.display_data_values = this.sort_int(key_value).filter((value) => {
        return (
          parseInt(value.temperature) <= 20 && parseInt(value.humidity) >= 50
        );
      });
    }
    this.display_fun(this.card_count);
  }

  /**
   * @description display the card in the section 2
   *
   * @param {number} count number cards count to be displayed in the section 2
   * @memberof Global_variable
   */
  display_fun(count) {
    let card_html = ``;
    if (Math.min(count, this.display_data_values.length) > 4) {
      document.querySelector(".left_arrow").style.visibility = "visible";
      document.querySelector(".right_arrow").style.visibility = "visible";
    } else {
      document.querySelector(".left_arrow").style.visibility = "hidden";
      document.querySelector(".right_arrow").style.visibility = "hidden";
    }
    for (
      let index = 0;
      index < Math.min(count, this.display_data_values.length);
      index++
    ) {
      let timeZone = this.display_data_values[index].timeZone;
      let time_arr = this.change_date_time_format(timeZone);
      card_html += `<div class="single_card">
      <div class="left_col">
          <h1>${this.display_data_values[index].cityName}</h1>
          <h3 class="card_time">${
            time_arr[1] + ":" + time_arr[2] + " " + time_arr[4]
          }</h3>
          <h3>${time_arr[0]}</h3>
          <span>
              <img src="./assets/Weather_Icons/humidityIcon.svg" alt="sunnyIcon">
              ${this.display_data_values[index].humidity}
          </span>
          <span>
              <img src="./assets/Weather_Icons/precipitationIcon.svg" alt="sunnyIcon">
              ${this.display_data_values[index].precipitation}
          </span>
      </div>
      <div class="right_col">
          <span>
              <img src="${this.card_weather_image}" alt="sunnyIcon">
              ${this.display_data_values[index].temperature}
          </span>
          <img class="card_citi_image" src="./assets/Icons_for_cities/${this.display_data_values[
            index
          ].cityName.toLowerCase()}.svg">
      </div>

    </div> `;
    }
    document.querySelector(".citi_cards").innerHTML = card_html;
  }

  /**
   * @description it updates the card time for every second
   * this function is being called by setinterval function in the init function
   * @memberof Global_variable
   */
  update_card_time() {
    let time = document.querySelectorAll(".card_time");
    for (const [iterator, value] of time.entries()) {
      let timeZone = this.display_data_values[iterator].timeZone;
      let time_arr = this.change_date_time_format(timeZone);
      value.innerText = time_arr[1] + ":" + time_arr[2] + " " + time_arr[4];
    }
  }

  /**
   * @description sort the card values in the section as per the user input - sunny, rainny, cold
   * @param {string} key_value to sort the particular data as per the key_value from the calling function
   * @return {Array} the array of sorted data of all the cities( array of sorted cities object)
   * @memberof Global_variable
   */
  sort_int(key_value) {
    this.data.sort(function (a, b) {
      return parseInt(b[key_value]) - parseInt(a[key_value]);
    });
    return this.data;
  }

  /**
   * @description sort the continets and the temperature based on the user preference of the bottom sort section
   * calls the display box function to display the bottom box
   * @param {boolean} continent_arrow_rotate true or false based on the user toggle selection of sorting
   * @param {boolean} temperature_arrow_rotate true or false based on the user toggle selection of sorting
   * @memberof Global_variable
   */
  sort_continents(continent_arrow_rotate, temperature_arrow_rotate) {
    let contDir = continent_arrow_rotate ? -1 : 1;
    let tempDir = temperature_arrow_rotate ? 1 : -1;
    let arr_data = [];
    for (const iterator of Object.entries(this.data)) {
      arr_data.push(iterator[1]);
    }
    arr_data.sort((a, b) => {
      return (
        contDir *
          a.timeZone
            .slice(0, a.timeZone.indexOf("/"))
            .localeCompare(b.timeZone.slice(0, b.timeZone.indexOf("/"))) ||
        tempDir * parseInt(a.temperature) - parseInt(b.temperature)
      );
    });
    this.cards_data_value = arr_data;
    this.display_box();
  }

  /**
   * @description display the bottom box of the cities selected
   *
   * @memberof Global_variable
   */
  display_box() {
    let box_html = ``;
    for (let index = 0; index < 12; index++) {
      let time_arr = this.change_date_time_format(
        this.cards_data_value[index].timeZone
      );
      box_html += `<div class="box">
      <div class="row1">
          <h1>${this.cards_data_value[index].timeZone.slice(
            0,
            this.cards_data_value[index].timeZone.indexOf("/")
          )}</h1>
          <h2>${this.cards_data_value[index].temperature}</h2>
      </div>
      <div class="row2">
          <h1>${
            this.cards_data_value[index].cityName
          },&nbsp;<span class='box_time'>
          ${time_arr[1] + ":" + time_arr[2] + " " + time_arr[4]}</span> </h1>
          <span>
              <img src="./assets/Weather_Icons/humidityIcon.svg" alt="">
              ${this.cards_data_value[index].precipitation}
          </span>
      </div>

  </div>`;
    }
    document.querySelector(".continent_boxes").innerHTML = box_html;
  }

  /**
   * @description it updates the bottom section box time for every second
   * this function is being called by setinterval function in the init function
   * @memberof Global_variable
   */
  update_box_time() {
    let time = document.querySelectorAll(".box_time");
    for (const [iterator, value] of time.entries()) {
      let time_arr = this.change_date_time_format(
        this.cards_data_value[iterator].timeZone
      );
      value.innerText = time_arr[1] + ":" + time_arr[2] + " " + time_arr[4];
    }
  }
};
