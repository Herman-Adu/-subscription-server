import express from "express";
import User from "../models/user";
import Article from "../models/article";
import { checkAuth } from "../middleware/checkAuth";
import { stripe } from "../utils/stripe";

const router = express.Router();

// get a particular customer
router.get("/", checkAuth, async (req, res) => {

    // get the user
    const user = await User.findOne({ email: req.user });
    console.log(user?.stripeCustomerId);

    // get a list of all the subscriptions for the user with the correct customerId
    const subscriptions = await stripe.subscriptions.list(
        {
            customer: user?.stripeCustomerId,
            status: "all",
            expand: ["data.default_payment_method"],
        },
        {
            apiKey: process.env.STRIPE_SECRET_KEY,
        }
    );
    // chck subscriptions data
    // res.json(subscriptions)

    // check if we got any data back, if not return an empty array
    if (!subscriptions.data.length) return res.json([]);

    // get the name of the plan

    //@ts-ignore
    const plan = subscriptions.data[0].plan.nickname;

    // check return plans data
    //res.json(plan)

    if (plan === "Basic") {
        // get articles associated with the basic plan
        const articles = await Article.find({ access: "Basic" });

        // return basic plan articles
        return res.json(articles);
    } else if (plan === "Standard") {
         // get articles associated with the basic and standard plan
        const articles = await Article.find({access: { $in: ["Basic", "Standard"] },
        });

        // return basic and standard plan articles
        return res.json(articles);
    } else {
        // get all thearticles for premium plan
        const articles = await Article.find({});
        return res.json(articles);
    }
})

export default router;