import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as Stripe from 'stripe';

// Initialize firebase admin
admin.initializeApp();

// Initialize Cloud Firestore Database
export const db = admin.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);

// ENV variables
export const stripeSecret = functions.config().stripe.secret;
export const webhookSecret = functions.config().stripe.webhook;

// Export stripe
export const stripe = new Stripe(stripeSecret);

// Collection Variables
export const usersCollection = 'users';
