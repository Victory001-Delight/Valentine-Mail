require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const cron = require('node-cron');
const fs = require('fs');

const Subscriber = require('./models/Subscriber');

const app = express();
const port = 3500;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "abbasdelightofficial@gmail.com",
        pass: process.env.GOOGLE_APP_PASSWORD,
    },
});

const messages = [
    "You are seen, you are valued, and your presence in this world makes it brighter. Keep shining! 💖",
    "On this Valentine’s Day, remember you are loved, appreciated, and your existence matters deeply.",
    "You may not realize it, but you inspire people around you every single day. Keep being you! 🌟",
    "Your heart is a beautiful place, full of kindness and love — never forget how much you matter.",
    "This Valentine’s Day, take a moment to celebrate yourself, your journey, and the love you spread around.",
    "You have the power to make a difference simply by being present and true to yourself.",
    "Even on challenging days, remember you are stronger than you know and deeply loved. 💌",
    "You are a light in this world. Keep shining, keep loving, keep believing in yourself.",
    "Your dreams, your passion, and your kindness have the power to change the world, one step at a time.",
    "Take a deep breath and remember: you are enough, just as you are. ❤️",
    "Your smile, your words, your actions — they ripple through the lives of people around you.",
    "Valentine’s Day is a reminder that love comes in many forms, and your heart radiates it naturally.",
    "You are worthy of all the love, joy, and happiness the universe has to offer.",
    "The world is better because you are in it. Never underestimate the beauty you bring.",
    "Even small acts of kindness you do create big waves of love and hope around you.",
    "Your courage, your resilience, and your love inspire more than you realize.",
    "You are allowed to take up space, to dream big, and to love fiercely — never apologize for it.",
    "Your journey is unique, and your presence in this world is irreplaceable.",
    "Every challenge you face is shaping you into an even stronger, more incredible version of yourself.",
    "Your heart holds so much love, hope, and compassion — share it freely, it matters.",
    "Remember: your value is not defined by what others think. You are inherently worthy.",
    "You are a source of hope and joy for someone even if you don’t know it.",
    "This Valentine’s Day, celebrate your own heart, your own journey, and the love you carry.",
    "Your kindness is powerful, your empathy is inspiring, and your love is contagious.",
    "You bring something special into every life you touch — never forget it.",
    "Even when life feels heavy, your presence brings light and comfort to those around you.",
    "Your heart has endless capacity to love and inspire — embrace it fully.",
    "You are braver than you believe, stronger than you know, and more loved than you realize.",
    "Every step you take, no matter how small, is a victory. Celebrate yourself today.",
    "You are a masterpiece, a story still being written, and your chapter is beautiful.",
    "Your words, your smile, your care — they all matter deeply to someone out there.",
    "The love you give, even quietly, has ripple effects that reach farther than you imagine.",
    "Believe in yourself as much as you believe in the good of others — you deserve it too.",
    "Your journey, your growth, and your heart are all worthy of celebration today and always.",
    "You make the world a better place just by showing up as yourself.",
    "Even in moments of doubt, your heart carries the power to bring love and light.",
    "You are precious, valued, and capable of incredible things — never forget it.",
    "Your laughter, your words, and your heart bring joy to people in ways you may not see.",
    "Take a moment today to recognize your own worth and the love you are capable of sharing.",
    "Your presence is a gift, and the world is brighter because of you.",
    "Even small gestures of love and care from you leave a lasting impact on others.",
    "You are unique, your story is important, and your heart is full of beautiful things.",
    "The love you carry within you has the power to heal, inspire, and uplift.",
    "Your spirit, your kindness, and your strength are admired more than you know.",
    "You are not alone; love surrounds you and your heart touches others in return.",
    "Celebrate yourself today — your growth, your heart, and your ability to love and inspire.",
    "The world is a better place with your energy, your care, and your compassion in it.",
    "Your journey matters, your heart matters, and your love matters more than words can say.",
    "You have endless potential, limitless love to give, and a beautiful path ahead.",
    "Your heart is a treasure, and every act of love you share is meaningful.",
    "Today and always, remember you are valued, appreciated, and deeply loved."
];

app.post("/valentine", async (req, res) => {
    const { email, name } = req.body;

    if (!email) return res.status(400).send("Email is required 💌");

    try {
        const existing = await Subscriber.findOne({ email });
        if (existing) return res.send("You’ve already submitted your email! 💌");
        const newSubscriber = new Subscriber({ email, name });
        await newSubscriber.save();
        await transporter.sendMail({
            to: "abbasdelightofficial@gmail.com",
            subject: "New Valentine Signup 💌",
            text: `New signup: ${name || "Friend"} - ${email}`,
        });

        console.log(`✅ Notification sent for ${email}`);
        res.send("Your email has been saved 💌. You’ll get your Valentine message on Feb 14!");
    } catch (err) {
        console.error("❌ Error saving email:", err);
        res.status(500).send("Oops! Something went wrong. Try again 💌");
    }
});

cron.schedule("0 0 14 2 *", async () => {
    console.log("🎉 Sending Valentine emails...");

    try {
        const subscribers = await Subscriber.find();

        if (subscribers.length === 0) {
            console.log("No subscribers found 💌");
            return;
        }

        const logFile = `emails_sent_log_${Date.now()}.txt`;
        let logData = "";

        for (const user of subscribers) {
            const randomMsg = messages[Math.floor(Math.random() * messages.length)];

            try {
                await transporter.sendMail({
                    to: user.email,
                    subject: "Your Special Valentine Note 💌",
                    html: `
                        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                            <h2 style="color: #ff4d6d;">Hello ${user.name || "there"} 💖</h2>
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
                    `,
                });

                console.log(`✅ Sent to: ${user.email}`);
                logData += `✅ Sent to: ${user.email} - ${new Date().toISOString()}\n`;
            } catch (err) {
                console.error("❌ Error sending to", user.email, err);
                logData += `❌ Failed: ${user.email} - ${new Date().toISOString()} - ${err.message}\n`;
            }
        }

        fs.writeFileSync(logFile, logData, "utf-8");
        console.log(`🎉 Sending completed! Log saved in ${logFile}`);
    } catch (err) {
        console.error("❌ Error fetching subscribers:", err);
    }
});


app.get("/emails", async (req, res) => {
    try {
        const emails = await Subscriber.find().sort({ date: -1 });
        res.json(emails);
    } catch (err) {
        console.error(err);
        res.status(500).send("Cannot fetch emails 💌");
    }
});

app.listen(port, () => {
    console.log(`server is running on ${port}`);

})