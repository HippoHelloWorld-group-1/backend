import dotenv from 'dotenv'
dotenv.config()

export const invalidKey = `
    <head>
        <title>Invalid or expired reservation key</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: Arial, Helvetica, sans-serif;
            }
            body{
                background-image: url(https://cdn.discordapp.com/attachments/1327890645922091059/1337424714213101598/SIT_1.webp?ex=67a76554&is=67a613d4&hm=823d275d5d40a81439766a983d9f1b18b85ecff14429a75be0cd170d4dfc6125&;);
                background-repeat: none;
                background-position: center;
                background-attachment: fixed;
                background-size: cover;
            }
            .cover{
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            .box {
                text-align: center;
                background-color: white;
                padding: 50px;
                border-radius: 20px;
            }
            .text {
                margin-top: 40px;
            }
            .text h1 {
                color: #1B2845;
            }
            .small-text{
                margin-top: 40px;
                color: #470000;
                font-weight: bold;
            }
            .footer-box{
                margin-top: 50px;
            }
            button{
                padding: 10px;
                border: 0;
                border-radius: 7px;
                background-color: #1B2845;
                color: white;
                width: 100%;
            } 
            button:hover{
                background-color: #b4bfd0;
          }
        </style>
    </head>
    <body>
        <div class="cover">
            <div class="box">
                <div class="top-box">
                    <img alt="logo-sit" src="https://cdn.discordapp.com/attachments/1327890645922091059/1337424714599108723/Group_36.webp?ex=67a76554&is=67a613d4&hm=61d40abca3722757f3c2c345e89bc2c8e0f917c7929fa672cd61d92c290a1633&">
                </div>
                <div class="text">
                    <h1>Reservation</h1>
                    <div class="small-text">
                        <p>Invalid Reservation Key</p><br>
                        <p>This reservation key is not valid or has already been confirmed.</p>
                    </div>
                </div>
                <div class="footer-box">
                    <a href=${process.env.website} target="_blank"><button>Go to website</button></a>
                </div>
            </div>
        </div>
    </body>
    </html>
      `