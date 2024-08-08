
const otpGenerator = require('otp-generator');

require('dotenv').config();

const {TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,TWILIO_SERVICE_SID} = process.env

const clint = require('twilio')(TWILIO_ACCOUNT_SID , TWILIO_AUTH_TOKEN,{
    lazyLoading : true
})


const sendOtp = async (mobileNumber) => {
  try {
    
    await  clint.verify.v2.services(TWILIO_SERVICE_SID).verifications.create({
      to: `+91${mobileNumber}`,
      channel: 'sms', // You can use 'sms' or 'call' depending on how you want to send the verification code.
    });
  } catch (error) {
    console.log(error.message);
    throw new Error("Failed to send verification code");
  }
};

const verifyCode = async (mobileNumber, code) => {
  try {
    console.log(mobileNumber);
    const verification = await clint.verify.v2.services(TWILIO_SERVICE_SID).verificationChecks.create({
      to: `+91${mobileNumber}`,
      code: code,
    });

    if (verification.status === 'approved') {
      // The code is valid, proceed with the sign-up process
      console.log("Verification successful!");
      return true
      // You can implement your sign-up logic here.
    } else {
      return false
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Failed to verify code");
  }
};


// Assuming you've already set up your Twilio client as 'client'





module.exports = {sendOtp,verifyCode };
