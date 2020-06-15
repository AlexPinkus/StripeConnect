import { stripe } from './config';
import { getUser, updateUser } from './users';

import Stripe = require('stripe');

/**
 * Takes a Firebase user and creates a Stripe customer account
 */
export const createCustomer = async (uid: string, email?: string): Promise<Stripe.customers.ICustomer> => {
  const customer = await stripe.customers.create({
    email,
    metadata: {
      firebaseUID: uid,
    },
  });
  await updateUser(uid, { stripeCustomerId: customer.id, trial: true });
  return customer;
};

/**
 * Takes a Firebase user and deletes the respective Stripe customer account
 */
export const deleteCustomer = async (uid: string): Promise<boolean> => {
  const user = await getUser(uid);
  const customerId = user && user.stripeCustomerId;
  if (!customerId) {
    return true;
  }
  await stripe.customers.del(customerId);
  return false;
};

/**
 * Read the stripe customer ID from firestore, or create a new one if missing
 */
export const getOrCreateCustomer = async (uid: string): Promise<Stripe.customers.ICustomer> => {
  const user = await getUser(uid);
  const customerId = user && user.stripeCustomerId;
  if (!customerId) {
    return createCustomer(uid, user.email);
  }
  return stripe.customers.retrieve(customerId);
};
