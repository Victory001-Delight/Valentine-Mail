const nodemailer = require('nodemailer');
require('dotenv').config();

// Setup transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "abbasdelightofficial@gmail.com",
        pass: process.env.GOOGLE_APP_PASSWORD,
    },
});

// Your messages array
const messages = [
    "You are seen, you are valued, and your presence in this world makes it brighter. Keep shining! 💖",
    "On this Valentine’s Day, remember you are loved, appreciated, and your existence matters deeply.",
    "Your heart is a beautiful place, full of kindness and love — never forget how much you matter.",
    "This Valentine’s Day, take a moment to celebrate yourself, your journey, and the love you spread around.",
    "You have the power to make a difference simply by being present and true to yourself."
];

// List of emails to test
const testEmails = [
    { name: "Victory", email: "victoryajayi90@gmail.com" },
    { name: "Sunshine", email: "ajayivictory001@gmail.com" }
];

// Function to send a random message to one user
async function sendValentine(user) {
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    try {
        const info = await transporter.sendMail({
            to: user.email,
            subject: "Your Special Valentine Note 💌",
            html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h2 style="color: #ff4d6d;">Hello ${user.name} 💖</h2>
                <p style="color: #555; font-size: 16px;">
                    ${randomMsg}
                </p>
                <p style="margin-top: 30px; color: #ff4d6d;">
                    — Abba's Delight 💙
                </p>
                <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #999;">
                    HeartNest Valentine 💌
                </p>
            </div>
            `
        });

        console.log(`✅ Sent to: ${user.email} | Message ID: ${info.messageId}`);
    } catch (err) {
        console.error("❌ Error sending to", user.email, err);
    }
}

// Send to all test emails sequentially
async function runTest() {
    for (const user of testEmails) {
        await sendValentine(user);
    }
    console.log("🎉 Test completed! Check your inbox (and spam folder).");
}

runTest();
