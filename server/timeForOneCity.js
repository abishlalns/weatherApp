const {timeForOneCity } = require("./timeZone.js");


process.on("message", (current_city) => {
    process.send(timeForOneCity(current_city));
  });

  
