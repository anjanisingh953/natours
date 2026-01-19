const nodemailer =  require('nodemailer');
const pug = require('pug')
const htmlToText = require('html-to-text');

module.exports = class Email{
    constructor(user,url){
        this.to = user.email;
        this.firstName = user.name.split( )[0];
        this.url = user.url;
        this.from = `Anjani Singh <anjanisingh0019@gmail.com>`
    }
    //create transport
    ourTransport(){
        if(process.env.NODE_ENV == 'production'){
            //sendgrid
            return 1;
        }
       //Activate in gmail "less secure app" options
         return nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'anjanisingh0019@gmail.com',
                        pass: 'djkmvnfwchmkaqzn'
                    }
                });
    }

   async send(template, subject){    
      //1. Render HTML based on a pug template
        const html  = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
            firstName: this.firstName,
            url: this.url,
            subject
        })


      //2.Define Email options
       let mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };

        //3. create transport  and send email
        this.ourTransport().sendMail(mailOptions)
    }

    async sendWelcome(){
      await this.send('template_name','welcome to natours')
    }

}

