import dotenv from 'dotenv'
dotenv.config()

export const invalidKey = (text) => ( `
    <head>
        <title>${text}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: Arial, Helvetica, sans-serif;
            }
            body{
                background-image: url(/SIT-1.webp);
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
                color: red;
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
                    <img alt="logo-sit" src="/Group-36.webp">
                </div>
                <div class="text">
                    <h1>Reservation</h1>
                    <div class="small-text">
                        <p>Invalid Reservation Key</p><br>
                        <p>${text}</p>
                    </div>
                </div>
                <div class="footer-box">
                    <a href=${process.env.website} target="_blank"><button>Go to website</button></a>
                </div>
            </div>
        </div>
    </body>
    </html>
      `)