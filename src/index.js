const express = require("express");
const app = express();
const port = 8000;
const { sendSms } = require("./util/email");
const bodyParser = require("body-parser");
const cors = require("cors");
const redis = require("redis");

const redis_port = 6379;

const redis_cache = redis.createClient(redis_port);
redis_cache.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.post("/api/email", (req, res, next) => {
  try {
    sendSms(req, res, next);

    if (sendSms) {
      return res.status(200).json("Success");
    } else {
      return res.status(400).json("Error");
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/auth", async (req, res, next) => {
  try {
    const redis_data = await redis_cache.get("email_" + req.body?.email);
    const data = JSON.parse(redis_data);

    if (req.body?.verifyCode == data?.verifyCode) {
      return res
        .status(200)
        .json({ message: "Welcome to Fergana, Uzbekistan" });
    } else {
      return res.status(400).json({ message: "Invalid verification code!" });
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => console.log(`server listening port on ${port}`));
