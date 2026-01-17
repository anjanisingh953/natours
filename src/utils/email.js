const nodemailer =  require('nodemailer');

//nodemailer configuration
const sendEmail =   async options=>{
    //create transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'anjanisingh0019@gmail.com',
            pass: 'djkmvnfwchmkaqzn'
        }
        });
        
        //Activate in gmail "less secure app" options

    //Define the email options    
        let mailOptions = {
            from: '"Tour_App" <<anjanisingh0019@gmail.com>>',
            to: 'anjanisingh953@gmail.com',
            subject: options.subject || 'subjet test',
            text: options.message  || 'subject message'
        };
        
    //Actually send the email  
        try{
            const result =  await transporter.sendMail(mailOptions);
            // console.log("email result",result)
        }catch(err){
            // console.log("email err ?>>>>",err)
        }

            
        //     , function(error, info){
        //     if(error){
        //         //******// console.log(error);
        //         res.status(500).json({status_code:'500',msg:'Failed to send email'});
        //     }else{
        //         //******// console.log('Email sent: ' + info.response);
        //         res.status(200).json({status_code:'200',data:'Email has been sent successfully'});   
        //     }
        // }); 
}

module.exports = sendEmail;     