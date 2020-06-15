import { getOrCreateCustomer } from '../src/customers';
import { getUser, updateUser } from '../src/users';
import { fun } from './test-config';

fun.cleanup;

let user: any;

beforeAll(async () => {
    user = {
        uid: Date.now().toString(),
        email: 'stripejesttest@example.com',
    };
    await updateUser(user.uid, user);
});

test.skip('getOrCreateCustomer creates/retrieves a Stripe Customer', async () => {
    const customer = await getOrCreateCustomer(user.uid);
    expect(customer.id).toContain('cus_');
    expect(customer.metadata.firebaseUID).toEqual(user.uid);

    const userDoc = await getUser(user.uid);
    expect(userDoc.stripeCustomerId).toContain('cus_');
})