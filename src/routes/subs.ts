import express from "express";
import User from "../models/user";
import Article from "../models/article";
import { checkAuth } from "../middleware/checkAuth";
import { stripe } from "../utils/stripe";

const router = express.Router();

router.get("/prices", checkAuth, async (req, res) => {
    const prices = await stripe.prices.list({
        apiKey: process.env.STRIPE_SECRET_KEY,
    });

    return res.json(prices);
})

router.post("/session", checkAuth, async (req, res) => {

    // get the user
    const user = await User.findOne({ email: req.user });

    // create some articles
       Article.create({
        title: "Respect Womens Rights Or Expect Our Resistance",
        imageUrl: "https://images.unsplash.com/photo-1656478524750-f2eea914868e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxNDJ8fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
        content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
        access: "Premium"
    })



    // create the session
    const session = await stripe.checkout.sessions.create(
        {
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
            {
            price: req.body.priceId,
            quantity: 1,
            },
        ],
        success_url: "http://localhost:3000/articles",
        cancel_url: "http://localhost:3000/article-plans",
        customer: user?.stripeCustomerId
        },
        {
        apiKey: process.env.STRIPE_SECRET_KEY,
        }
    );

    return res.json(session);
});

export default router;