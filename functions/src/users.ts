import { db, usersCollection } from './config';
import { assert } from './helpers';

/**
 * Read the user document from Firestore
 */
export const getUser = async (uid: string): Promise<any> => {
  return await db
    .collection(usersCollection)
    .doc(uid)
    .get()
    .then((doc) => doc.data());
};

/**
 * Gets a customer from Stripe
 */
export const getCustomerId = async (uid: string): Promise<string> => {
  const user = await getUser(uid);
  return assert(user, 'stripeCustomerId');
};

/**
 * Updates the user document non-destructively
 */
export const updateUser = async (uid: string, data: Object): Promise<any> => {
  const user = await db.collection(usersCollection).doc(uid).set(data, { merge: true });
  return user;
};

/**
 * Deletes user and all associated data
 */
export const deleteUser = async (uid: string): Promise<any> => {
  await db.collection('users').doc(uid).delete();
};
