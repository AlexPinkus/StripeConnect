import * as functions from 'firebase-functions';

import { createCustomer, deleteCustomer } from './customers';
import { deleteUser } from './users';

// When a user is created, register them with Stripe
export const stripeCreateCustomer = functions.auth.user().onCreate(async (user) => {
    const customer = createCustomer(user.uid, user.email);
    return customer;
});

// When a user deletes their account, clean up after them
export const cleanupUser = functions.auth.user().onDelete(async (user) => {
    await deleteCustomer(user.uid);
    return deleteUser(user.uid);
});