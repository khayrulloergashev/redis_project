const password = "dxxacxqebzeceten";
const companyName = "Redis project";
const nodemailer = require("nodemailer");
const redis = require("redis");
const redis_port = 6379;

const redis_cache = redis.createClient(redis_port);
redis_cache.connect();

module.exports = {
  sendSms: async function (req, res, next) {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        service: "gmail",
        secure: true,
        port: 465,
        auth: {
          user: "test00010880@gmail.com",
          pass: password,
        },
      });

      const passwordForEmail = Math.floor(100000 + Math.random() * 900000);

      const redis_data = await redis_cache.get("email_" + req.body?.email);

      if (redis_data) {
        await redis_cache.del("email_" + req.body?.email.toString());
      }

      req.body.verifyCode = passwordForEmail;

      redis_cache.set(
        "email_" + req.body.email.toString(),
        JSON.stringify(req.body),
        {
          EX: 3600,
          NX: true,
        }
      );

      const mailDetails = {
        from: "test00010880@gmail.com",
        to: req.body?.email,
        subject: `${companyName}`,
        html: `<img style="width:250px;" src="cid:unique@nodemailer.com" /><h1>Assalomu aleykum ${req.body?.email}</h1><h3>${companyName}</h3> <h1>Sizning tastiqlash kodingiz : ${passwordForEmail}</h1> `,
        attachments: [
          {
            filename: "CodemyLogo.png",
            path: "./src/images/CodemyLogo.png",
            cid: "unique@nodemailer.com",
          },
        ],
      };

      transporter.sendMail(mailDetails, function (err) {
        if (err) {
          console.log(err);
        }
        return true;
      });
    } catch (error) {
      return next(new Error(error));
    }
  },
};
