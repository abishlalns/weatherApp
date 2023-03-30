const express = require("express");
const { fork } = require("child_process");
const app = express();
const cityName = require("./routes/cityName")

app.use(express.static("public"));
app.use(express.json());

app.get("/all-timezone-cities", (req, res) => {
  const child = fork("./server/allTimeZones");
  child.on("message", (messge) => {
    res.send(messge);
  });
});

app.use("/cityname/", cityName);

app.post("/hourly-forecast", (req, res) => {
  let nextFiveHours = req.body;
  const child = fork("./server/nextNhouresWeather");
  child.send(nextFiveHours);
  child.on("message", (data) => {
    res.send(data);
  });
});

app.listen(3000);
