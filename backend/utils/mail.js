const nodemailer = require("nodemailer");

exports.generateOTP = () => {
  let otp = "";
  for (let i = 0; i <= 3; i++) {
    const randVal = Math.round(Math.random() * 9);
    otp = otp + randVal;
  }
  return otp;
};

exports.mailTransport = () =>
  nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

exports.generateEmailTemplate = (otp) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body>
      <div
        style="
          font-family: Helvetica, Arial, sans-serif;
          min-width: 1000px;
          overflow: auto;
          line-height: 2;
        "
      >
        <div style="margin: 50px auto; width: 70%; padding: 20px 0">
          <div style="border-bottom: 1px solid #eee">
            <a
              href=""
              style="
                font-size: 1.4em;
                color: #00466a;
                text-decoration: none;
                font-weight: 600;
              "
              >TitforTat</a
            >
          </div>
          <p style="font-size: 1.1em">Hi,</p>
          <p>
            Thank you for Signing Up for TitfirTat. Use the following OTP to
            verify yourself. OTP is valid for 5 minutes
          </p>
          <h2
            style="
              background: #00466a;
              margin: 0 auto;
              width: max-content;
              padding: 0 10px;
              color: #fff;
              border-radius: 4px;
            "
          >
            ${otp}
          </h2>
          <p style="font-size: 0.9em">Regards,<br />TitForTat</p>
          <hr style="border: none; border-top: 1px solid #eee" />
          <div
            style="
              float: right;
              padding: 8px 0;
              color: #aaa;
              font-size: 0.8em;
              line-height: 1;
              font-weight: 300;
            "
          >
            <p>TitforTat</p>
            <p>218 E1 Johar Town Lahore</p>
            <p>Pakistan</p>
          </div>
        </div>
      </div>
    </body>
  </html>
  
`;
};

exports.generateverifySucceesfullyTemplate = (text) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body>
      <div
        style="
          font-family: Helvetica, Arial, sans-serif;
          min-width: 1000px;
          overflow: auto;
          line-height: 2;
        "
      >
        <div style="margin: 50px auto; width: 70%; padding: 20px 0">
          <div style="border-bottom: 1px solid #eee">
            <a
              href=""
              style="
                font-size: 1.4em;
                color: #00466a;
                text-decoration: none;
                font-weight: 600;
              "
              >TitforTat</a
            >
          </div>
          <p style="font-size: 1.1em">Hi,</p>
          <p>
            Thank you for Verifying for TitfirTat.
          </p>
          <h2
            style="
              background: #00466a;
              margin: 0 auto;
              width: max-content;
              padding: 0 10px;
              color: #fff;
              border-radius: 4px;
            "
          >
            ${text}
          </h2>
          <p style="font-size: 0.9em">Regards,<br />TitForTat</p>
          <hr style="border: none; border-top: 1px solid #eee" />
          <div
            style="
              float: right;
              padding: 8px 0;
              color: #aaa;
              font-size: 0.8em;
              line-height: 1;
              font-weight: 300;
            "
          >
            <p>TitforTat</p>
            <p>218 E1 Johar Town Lahore</p>
            <p>Pakistan</p>
          </div>
        </div>
      </div>
    </body>
  </html>
  
`;
};

exports.generateForgotPasswordTemplate = (link) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body>
      <div
        style="
          font-family: Helvetica, Arial, sans-serif;
          min-width: 1000px;
          overflow: auto;
          line-height: 2;
        "
      >
        <div style="margin: 50px auto; width: 70%; padding: 20px 0">
          <div style="border-bottom: 1px solid #eee">
            <a
              href=""
              style="
                font-size: 1.4em;
                color: #00466a;
                text-decoration: none;
                font-weight: 600;
              "
              >TitforTat</a
            >
          </div>
          <p style="font-size: 1.1em">Hi,</p>
          <p>
            As you have requested for change in your password Click on the below
            link to reset your password:
          </p>
          <h2
            style="
              margin: 0 auto;
              width: max-content;
              padding: 0 10px;
              color: #fff;
              border-radius: 4px;
            "
          >
            ${link}
          </h2>
          <p style="font-size: 0.9em">Regards,<br />TitForTat</p>
          <hr style="border: none; border-top: 1px solid #eee" />
          <div
            style="
              float: right;
              padding: 8px 0;
              color: #aaa;
              font-size: 0.8em;
              line-height: 1;
              font-weight: 300;
            "
          >
            <p>TitforTat</p>
            <p>218 E1 Johar Town Lahore</p>
            <p>Pakistan</p>
          </div>
        </div>
      </div>
    </body>
  </html>  
`;
};

exports.generateResetPasswordComplete = (text) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body>
      <div
        style="
          font-family: Helvetica, Arial, sans-serif;
          min-width: 1000px;
          overflow: auto;
          line-height: 2;
        "
      >
        <div style="margin: 50px auto; width: 70%; padding: 20px 0">
          <div style="border-bottom: 1px solid #eee">
            <a
              href=""
              style="
                font-size: 1.4em;
                color: #00466a;
                text-decoration: none;
                font-weight: 600;
              "
              >TitforTat</a
            >
          </div>
          <p style="font-size: 1.1em">Hi,</p>
          <p>
            As you have requested for change in your password Click on the below
            link to reset your password:
          </p>
          <h2
          <h2
          style="
            background: #00466a;
            margin: 0 auto;
            width: max-content;
            padding: 0 10px;
            color: #fff;
            border-radius: 4px;
            "
          >
            ${text}
          </h2>
          <p style="font-size: 0.9em">Regards,<br />TitForTat</p>
          <hr style="border: none; border-top: 1px solid #eee" />
          <div
            style="
              float: right;
              padding: 8px 0;
              color: #aaa;
              font-size: 0.8em;
              line-height: 1;
              font-weight: 300;
            "
          >
            <p>TitforTat</p>
            <p>218 E1 Johar Town Lahore</p>
            <p>Pakistan</p>
          </div>
        </div>
      </div>
    </body>
  </html>  
`;
};
