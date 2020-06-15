import * as functions from 'firebase-functions';

import { stripe } from './config';
import { assert, assertUID, catchErrors } from './helpers';
import { getDefaultPaymentMethod } from './paymentMethods';
import { getCustomerId } from './users';

/**
 * Creates a charge for a specific amount
 */
const createIntent = async (uid: string, amount: number, idempotency_key?: string) => {
  const customer = await getCustomerId(uid);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'MXN',
    payment_method_types: ['card'],
    setup_future_usage: 'off_session',
    metadata: { uid, customer },
  });

  return {
    id: paymentIntent.id,
    status: paymentIntent.status,
    next_action: paymentIntent.next_action,
    client_secret: paymentIntent.client_secret,
  };
};

/**
 * Setups an intent to be payed later
 */
const setupIntent = async (uid: string) => {
  const customer = await getCustomerId(uid);
  const setupInt = await stripe.setupIntents.create({
    customer: customer,
  });

  return {
    id: setupInt.id,
    status: setupInt.status,
    client_secret: setupInt.client_secret,
    next_action: setupInt.next_action,
  };
};

export const chargePayment = async (uid: string, amount: number, metadata?: any, idempotency_key?: string) => {
  const customer = await getCustomerId(uid);
  const paymentMethodId = await getDefaultPaymentMethod(uid);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'mxn',
      customer,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      metadata,
    } as any);

    return paymentIntent;
  } catch (err) {
    // Error code will be authentication_required if authentication is needed
    console.log('Error code is: ', err.code);
    throw err;
    // const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
    // console.log('PI retrieved: ', paymentIntentRetrieved.id);
  }
};

const cancelPayment = async (intentId: string) => {
  await stripe.paymentIntents.cancel(intentId);
  return 'Payment succesfully canceled';
};

export const refundPayment = async (intentId: string, amount: number) => {
  await stripe.refunds.create({
    amount,
    payment_intent: intentId,
  } as any);
  return 'Payment succesfully canceled';
};

export const stripeCreateIntent = functions.https.onCall(async (data, context) => {
  const uid = assertUID(context);
  const amount = assert(data, 'amount');

  // Optional
  const idempotency_key = data.idempotency_key;

  return catchErrors(createIntent(uid, amount, idempotency_key));
});

export const stripeSetupIntent = functions.https.onCall(async (data, context) => {
  const uid = assertUID(context);

  return catchErrors(setupIntent(uid));
});

export const stripeCancelIntent = functions.https.onCall(async (data, context) => {
  const intentId = assert(data, 'intentId');

  return catchErrors(cancelPayment(intentId));
});

export const stripeRefundIntent = functions.https.onCall(async (data, context) => {
  const intentId = assert(data, 'intentId');
  const amount = assert(data, 'amount');

  return catchErrors(refundPayment(intentId, amount));
});

export const stripeChargeUser = functions.https.onCall(async (data, context) => {
  assertUID(context);
  const uid = assert(data, 'uid');
  const amount = assert(data, 'amount');
  const metadata = assert(data, 'metadata');

  return catchErrors(chargePayment(uid, amount, metadata));
});
