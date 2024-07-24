/** @format */

const createHttpError = require("http-errors");
const nodemailer = require("nodemailer");
const PDFDocument = require('pdfkit');
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "michele.stracke53@ethereal.email",
    pass: "Y6sRPM67VeqETGN184",
  },
});

class EmailService {
  constructor() {}

  async sendEmailOtp(email, generateOTP) {
    try {
      const info = await transporter.sendMail({
        from: "marjorie.bogan28@ethereal.email", // sender address
        to: email, // list of receivers
        subject: "Email verification", // Subject line
        text: "", // plain text body
        html: `<p>Your email verification OTP is ${generateOTP}</p>`, // html body
      });
      console.log(info.messageId);
      return info;
    } catch (error) {
      throw createHttpError.BadRequest({ message: error.message });
    }
  }

  async sendVerificationEmail(email, key) {
    try {
      const info = await transporter.sendMail({
        from: "marjorie.bogan28@ethereal.email", // sender address
        to: email, // list of receivers
        subject: "Email verification", // Subject line
        text: "", // plain text body
        html: `<p>Your email verification Key is ${key}</p>`, // html body
      });
      console.log(info.messageId);
      return info;
    } catch (error) {
      throw createHttpError.BadRequest({ message: error.message });
    }
  }

  async confirmationMail(data) {
    try {
      console.log("In email service ################################", data);
      // GENERATE PDF FILE
      const doc = new PDFDocument();
      let pdfBuffer = [];

      doc.on('data', chunk => pdfBuffer.push(chunk));
      doc.on('end', () => {
        pdfBuffer = Buffer.concat(pdfBuffer);
      });

      doc.fontSize(20).text(`Booking Details`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Your travel date: ${data.travelDate}`);
      doc.text(`Your pickup location: ${data.pickupLocation}`);
      doc.text(`Your drop location: ${data.dropLocation}`);
      doc.text(`Total distance: ${data.distance}`);
      doc.text(`Your pickup time: ${data.pickupTime}`);
      doc.text(`Extra passenger: ${data.extraPassengers}`);
      doc.text(`Extra passenger price: ${data.extraPassengerFare}`);
      doc.text(`Total price: ${data.fare}`);
      doc.text(`Payment status: ${data.paymentStatus}`);
      doc.moveDown();
      doc.fontSize(14).text(`Car details:`);
      doc.text(`Car name: ${data.car.name}`);
      doc.text(`Car description: ${data.car.description}`);
      doc.text(`Car price: ${data.car.price}`);
      doc.text(`Car type: ${data.car.type}`);
      //doc.image(data.car.image, { fit: [100, 60] });
      doc.moveDown();
      doc.fontSize(14).text(`Driver details:`);
      doc.text(`Driver name: ${data.driver.name}`);
      doc.text(`Driver phone: ${data.driver.phone}`);
      doc.text(`Driver email: ${data.driver.email}`);
      //doc.image(data.driver.profile_image, { fit: [70, 70], align: 'center', valign: 'center' });
      doc.end();

      // Wait for the PDF to be created
      await new Promise(resolve => doc.on('end', resolve));

      const info = await transporter.sendMail({
        from: "michele.stracke53@ethereal.email", // sender address
        to: data.user.email, // list of receivers
        subject: "Successfully booking", // Subject line
        text: "", // plain text body
        html: `<div>
          <h2>You successfully booked you cab</2>
          <p style="font-size:14px">Your travel date: ${data.travelDate}</p>
          <p style="font-size:14px">Your pickup location: ${data.pickupLocation}</p>
          <p style="font-size:14px">Your drop location: ${data.dropLocation}</p>
          <p style="font-size:14px">Total distance: ${data.distance}</p>
          <p style="font-size:14px">Your pickup time: ${data.pickupTime}</p>
          <p style="font-size:14px">Extra passenger: ${data.extraPassengers}</p>
          <p style="font-size:14px">Extra passenger price: ${data.extraPassengerFare}</p>
          <p style="font-size:14px">Total price price: ${data.fare}</p>
          <p style="font-size:14px">Payment status: ${data.paymentStatus}</p>
          <ul>
          <p>Car details:</p>
            <lI style="font-size:14px">Car name: ${data.car.name}</li>
            <lI style="font-size:14px">Car description: ${data.car.description}</li>
            <li style="font-size:14px">Car price: ${data.car.price}</li>
            <li style="font-size:14px">Car type: ${data.car.type}</li>
            <img src=${data.car.image}  style="width:100px; height: 60px" />
          </ul>
          <ul>
          <p>Driver details:</p>
            <lI style="font-size:14px">Driver name: ${data.driver.name}</li>
            <lI style="font-size:14px">Driver phone: ${data.driver.phone}</li>
            <li style="font-size:14px">Driver email: ${data.driver.email}</li>
            <img src=${data.driver.profile_image}  style="width:70px; height: 70px; border-radious: 50px;" />
          </ul>
        </div>`, // html body
        attachments: [{
          filename: 'booking_details.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }]
      });
      return info;
    } catch (error) {
      throw createHttpError.BadRequest({ message: error.message });
    }
  }

  async sendCancelationMail(id, email) {
    try {
      console.log("came in email #################################", id, email)
      const info = await transporter.sendMail({
        from: "marjorie.bogan28@ethereal.email", // sender address
        to: email, // list of receivers
        subject: "Booking cancel", // Subject line
        text: "", // plain text body
        html: `<p>Your booking with id ${id} has been canceled.</p>`, // html body
      });
      console.log(info.messageId);
      return info;
    } catch (error) {
      throw createHttpError.BadRequest({ message: error.message });
    }
  }
}
module.exports = new EmailService();
