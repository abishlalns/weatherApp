const { nextNhoursWeather, allTimeZones } = require("./timeZone.js");

process.on("message", (nextFiveHours) => {
  process.send(
    nextNhoursWeather(
      nextFiveHours.city_Date_Time_Name,
      nextFiveHours.hours,
      allTimeZones()
    )
  );
});
