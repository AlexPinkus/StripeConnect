import * as functions from 'firebase-functions';

import { stripe, webhookSecret } from './config';

import Stripe = require('stripe');

export const webhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
  } catch (err) {
    res.status(400).send({ error: err });
    return;
  }

  // Handle Type of webhook
  const intent = event.data.object as Stripe.paymentIntents.IPaymentIntent;

  switch (event.type) {
    case 'payment_intent.succeeded':
      res.status(200).send({ 'Succeeded:': intent.id });
      break;

    case 'payment_intent.payment_failed':
      const message = intent.last_payment_error && intent.last_payment_error.message;
      console.log('Failed:', intent.id, message);
      res.status(200).send({ 'Failed:': intent.id, message });
      break;
  }
});
