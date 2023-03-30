const express = require("express");
const router = express.Router();
const {fork} = require("child_process")

router.get("/:city", (req, res) => {
  let current_city = req.params.city;
  const child = fork("./server/timeForOneCity.js");
  child.send(current_city);
  child.on("message", (data) => {
    res.send(data);
  });
});

module.exports = router;
