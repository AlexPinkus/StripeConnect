import * as functions from 'firebase-functions';

import { stripe } from './config';
import { assert, assertUID, catchErrors } from './helpers';
import { updateUser } from './users';

/**
 * Takes a Firebase user and creates a Stripe customer account
 */
const registerAccount = async (uid: string, code: string): Promise<any> => {
  const response = await stripe.oauth.token({
    grant_type: 'authorization_code',
    code,
  });
  const accountId = response.stripe_user_id;

  await updateUser(uid, { accountId });
  return response;
};

export const stripeRegisterAccount = functions.https.onCall(async (data, context) => {
  const uid = assertUID(context);
  const code = assert(data, 'code');

  return catchErrors(registerAccount(uid, code));
});
