const otpEmailTemplate = (otp: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .logo {
            max-height: 60px;
        }
        .content {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 5px;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            text-align: center;
            margin: 30px 0;
            color: #2c3e50;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #888888;
            margin-top: 30px;
        }
        .button {
            display: inline-block;
            background-color: #3498db;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 4px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://example.com/logo.png" alt="Company Logo" class="logo">
        </div>
        
        <div class="content">
            <h2>Verification Code</h2>
            <p>Hello,</p>
            <p>Your one-time password (OTP) for verification is:</p>
            
            <div class="otp-code">${otp}</div>
            
            <p>This code will expire in 2 minutes. Please do not share this code with anyone.</p>
            
            <p>If you didn't request this code, please ignore this email or contact our support team if you have any concerns.</p>
            
            <p>Thank you,<br>The Security Team</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; 2025 Your Company. All rights reserved.</p>
            <p>123 Business Street, City, Country</p>
        </div>
    </div>
</body>
</html>`

export default otpEmailTemplate;