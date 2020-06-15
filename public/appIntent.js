document.addEventListener('DOMContentLoaded', async function () {
  // Initialize
  let app = firebase.app();
  let features = ['auth', 'functions'].filter((feature) => typeof app[feature] === 'function');

  // Firebase Services
  const fun = firebase.functions();
  const auth = firebase.auth();

  // DOM Elements
  const loginBtn = document.getElementById('login');
  const logoutBtn = document.getElementById('logout');
  const profile = document.getElementById('profile');
  const subscribeBtn = document.getElementById('subscribe');
  const cancelSubscriptionBtn = document.getElementById('cancelSubscription');

  auth.onAuthStateChanged((user) => {
    if (user) {
      profile.innerHTML = user.uid;
      loginBtn.style.visibility = 'hidden';
      logoutBtn.style.visibility = 'visible';
    } else {
      profile.innerHTML = 'not logged in';
      loginBtn.style.visibility = 'visible';
      logoutBtn.style.visibility = 'hidden';
    }
  });
  // Event Handlers
  loginBtn.onclick = () => auth.signInAnonymously();
  logoutBtn.onclick = () => auth.signOut();

  // Callable Functions

  const createIntent = fun.httpsCallable('stripeCreateIntent');
  const setupIntent = fun.httpsCallable('stripeSetupIntent');
  const subscriptionFun = fun.httpsCallable('stripeCreateSubscription');
  const cancelSubscriptionFun = fun.httpsCallable('stripeCancelSubscription');

  subscribeBtn.onclick = async () => {
    const res = await subscriptionFun({ plan: 'price_HK2rfqgaRnMQJP' });
    console.log(res);
    alert('Success, subscribed to plan');
  };
  cancelSubscriptionBtn.onclick = () => cancelSubscriptionFun({ plan: 'sub_HMdFFmIGKHIHG8' });

  var stripe = Stripe('pk_test_CnLknpzdwEGPduW78wNxc4Ds00rh0ecntq');
  var elements = stripe.elements();
  let complete = false;
  let amount = 3000;

  let card;
  let paymentIntent;
  let clientSecret;

  // paymentIntent = await createIntent({ amount });
  paymentIntent = await setupIntent();

  console.log('paymentIntent :', paymentIntent);
  clientSecret = paymentIntent.data.client_secret;
  console.log('clientSecret :', clientSecret);
  createCardForm();

  // Create an instance of the card Element.
  function createCardForm() {
    const style = {
      base: {
        // Add your base input styles here. For example:
        fontSize: '16px',
        color: '#32325d',
      },
    };
    card = elements.create('card', { style });

    // Add an instance of the card Element into the `card-element` <div>.
    card.mount('#card-element');

    card.addEventListener('change', function (event) {
      complete = event.complete;
      var displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });
  }

  const form = document.getElementById('payment-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitCardInfo();
  });

  // Step 3
  async function submitPayment() {
    const result = await stripe.handleCardPayment(clientSecret, card, {
      payment_method_data: {},
    });

    paymentIntent = result.paymentIntent;

    console.log(paymentIntent);

    if (result.error) {
      console.error(error);
      alert('fudge!');
    }
  }

  // Set up to be payed later
  async function submitCardInfo() {
    const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, { payment_method: { card } });

    console.log(setupIntent);

    if (error) {
      console.error(error);
      alert('fudge!');
    }
  }
});
