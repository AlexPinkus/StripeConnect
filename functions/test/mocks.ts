import { stripe } from '../src/config';
import { updateUser } from '../src/users';

export const getMockSource = async () => {
    const token = await stripe.tokens.create({
        card: {
            object: 'card',
            number: '4242424242424242',
            exp_month: 12,
            exp_year: 2026,
            cvc: '123',
        }
    });

    return stripe.sources.create({
        type: 'card',
        token: token.id,
    })
};

export const mockUser = async ( ) => {
    const user = {
        uid: Date.now().toString(),
        email: 'stripejesttest@example.com',
    };
    await updateUser(user.uid, user);
    return user;
};