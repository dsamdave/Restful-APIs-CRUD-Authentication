const nodemailer = require("nodemailer")


const sendMail = async (email, message, res) =>{

    let mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: `${process.env.MY_EMAIL}`,
            pass: `${process.env.MY_PASSWORD}`
        } 
          
    });
     
    let mailDetails = {
        from: `${process.env.MY_EMAIL}`,
        to: email,
        subject: `MAIL FROM SMARTHUB UNIPORT`,
        html: `
            <div>
               <h3>Thank you for choosing Smarthub</h3>

               <p>${message}</p>

            </div>
        `,
    };
     
    await mailTransporter.sendMail(mailDetails, async (error, data) => {
        if(error) {
            return res.status(400).json({msg: error.message})
            // console.log(error.message);
        } else {

            return await res.status(200).json({msg: "Check your email inbox & spam for details"})
        }
    });
}


module.exports = sendMail