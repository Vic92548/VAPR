import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

const client = new MongoClient(databaseUrl);
await client.connect();
console.log("Connected");
const db = client.db("vapr");

const postsCollection = db.collection("posts");
const usersCollection = db.collection("users");
const viewsCollection = db.collection("views");
const likesCollection = db.collection("likes");
const videosCollection = db.collection("videos");
const dislikesCollection = db.collection("dislikes");
const skipsCollection = db.collection("skips");
const followsCollection = db.collection("follows");
const reactionsCollection = db.collection("reactions");
const linkClicksCollection = db.collection("linkClicks");
const registrationReferralsCollection = db.collection("registrationReferrals");
const xpLogCollection = db.collection("xpLog");
const secretKeysCollection = db.collection("secretKeys");

export {
    postsCollection,
    usersCollection,
    viewsCollection,
    likesCollection,
    dislikesCollection,
    followsCollection,
    reactionsCollection,
    registrationReferralsCollection,
    linkClicksCollection,
    skipsCollection,
    videosCollection,
    xpLogCollection,
    secretKeysCollection
};