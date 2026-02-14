require('dotenv').config();

// Core dependencies
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const fs = require('fs');
const cors = require('cors'); // Only if you need cross-origin requests
const Subscriber = require('./models/Subscriber'); // your Mongoose model


const app = express();
const port = process.env.PORT || 3500;

// Middleware
app.use(cors()); // Only needed if frontend is on a different domain
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

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected ✅");

        // Start server **after MongoDB is connected**
        app.listen(port, () => {
            console.log(`Server running on ${port}`);
        });
    })
    .catch(err => console.error("❌ MongoDB connection error:", err));

// Optional: reconnect handling
mongoose.connection.on("disconnected", () => {
    console.log("⚠️ MongoDB disconnected, retrying...");
});
mongoose.connection.on("error", err => {
    console.error("❌ MongoDB connection error:", err);
});

// POST /valentine - Save subscriber and send notification email
app.post("/valentine", async (req, res) => {
    try {
        const { name, email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required! 💌"
            });
        }

        // Check if subscriber already exists
        let subscriber = await Subscriber.findOne({ email });

        if (subscriber) {
            // If already sent, inform them
            if (subscriber.messageSent) {
                return res.json({
                    success: true,
                    message: "You've already received your Valentine message! 💖 Check your inbox! 💌"
                });
            } else {
                // Subscriber exists but message not sent yet, send now
                const randomMsg = messages[Math.floor(Math.random() * messages.length)];

                try {
                    await transporter.sendMail({
                        from: `"Abba's Delight 💙" <abbasdelightofficial@gmail.com>`,
                        to: email,
                        subject: "Your Special Valentine Note 💌",
                        html: `<h2>Hello ${subscriber.name} 💖</h2><p>${randomMsg}</p><br><p>Thank you for being part of HeartNest!</p>`
                    });

                    // Mark as sent
                    subscriber.messageSent = true;
                    subscriber.sentAt = new Date();
                    await subscriber.save();

                    console.log(`✅ Valentine email sent to existing subscriber ${email}`);

                    return res.json({
                        success: true,
                        message: "Success! 💌 Your Valentine message has been sent! Check your inbox! ❤️"
                    });

                } catch (emailErr) {
                    console.error(`❌ Failed to send email to ${email}:`, emailErr.message);
                    return res.json({
                        success: true,
                        message: "You're on our list! 💖 We'll send your message soon! 💌"
                    });
                }
            }
        }

        // Create new subscriber
        subscriber = new Subscriber({
            email,
            name: name || "Friend",
            messageSent: false,
        });

        await subscriber.save();

        // Send a notification/welcome email immediately
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];

        try {
            await transporter.sendMail({
                from: `"Abba's Delight 💙" <abbasdelightofficial@gmail.com>`,
                to: email,
                subject: "Your Special Valentine Note 💌",
                html: `<h2>Hello ${name || "there"} 💖</h2><p>${randomMsg}</p><br><p>Thank you for joining HeartNest!</p>`
            });

            // Mark as sent
            subscriber.messageSent = true;
            subscriber.sentAt = new Date();
            await subscriber.save();

            console.log(`✅ Welcome email sent to ${email}`);

            return res.json({
                success: true,
                message: "Success! 💌 Your Valentine message has been sent! Check your inbox! ❤️"
            });

        } catch (emailErr) {
            console.error(`❌ Failed to send email to ${email}:`, emailErr.message);

            // Still return success since subscriber was saved
            return res.json({
                success: true,
                message: "You're subscribed! 💖 We'll send your message soon! 💌"
            });
        }

    } catch (err) {
        console.error("❌ Error in /valentine:", err);
        return res.status(500).json({
            success: false,
            message: "Oops! Something went wrong. Try again 💌"
        });
    }
});

app.get("/send", async (req, res) => {
    try {
        // Get all subscribers from MongoDB who haven't received messages yet
        const unsentSubscribers = await Subscriber.find({ messageSent: false });

        if (unsentSubscribers.length === 0) {
            return res.json({
                success: true,
                message: "No new subscribers to send messages to! 💌"
            });
        }

        let success = 0, failed = 0;
        const failedFile = 'emails_failed_log.json';
        let failedEmails = fs.existsSync(failedFile) ? JSON.parse(fs.readFileSync(failedFile, 'utf-8')) : [];

        for (const subscriber of unsentSubscribers) {
            const randomMsg = messages[Math.floor(Math.random() * messages.length)];

            try {
                await transporter.sendMail({
                    from: `"Abba's Delight 💙" <abbasdelightofficial@gmail.com>`,
                    to: user.email,
                    replyTo: "abbasdelightofficial@gmail.com",
                    subject: "Your Special Valentine Note 💌",
                    html: `<h2>Hello ${user.name || "there"} 💖</h2><p>${randomMsg}</p>`
                });


                // Mark as sent in database
                subscriber.messageSent = true;
                subscriber.sentAt = new Date();
                await subscriber.save();

                console.log(`✅ Sent to ${subscriber.email}`);
                success++;

                // Optional: tiny delay to avoid Gmail throttling
                await new Promise(resolve => setTimeout(resolve, 5000));

            } catch (err) {
                console.error(`❌ Failed to send to ${subscriber.email}`);
                failedEmails.push({ email: subscriber.email, error: err.message, time: new Date().toISOString() });
                failed++;
            }
        }

        // Save failed log
        fs.writeFileSync(failedFile, JSON.stringify(failedEmails, null, 2), 'utf-8');

        res.json({ success: true, message: `Done 💌 Sent: ${success}, Failed: ${failed}, Total new: ${unsentSubscribers.length}` });

    } catch (err) {
        console.error("❌ Error in /send:", err);
        return res.status(500).json({
            success: false,
            message: "Oops! Something went wrong. Try again 💌"
        });
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
