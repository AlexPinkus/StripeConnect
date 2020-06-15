document.addEventListener('DOMContentLoaded', function () {
  // Initialize
  let app = firebase.app();
  let features = ['auth', 'functions'].filter(
      feature => typeof app[feature] === 'function'
  );
  console.log(`Firebase SDK loaded with ${features.join(', ')}`);

  // Firebase Services 
  const fun = firebase.functions();
  const auth = firebase.auth();

  // DOM Elements
  const loginBtn = document.getElementById('login');
  const logoutBtn = document.getElementById('logout');
  const profile = document.getElementById('profile');
  auth.onAuthStateChanged(user => {
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
  
  // const testFun = fun.httpsCallable('testFunction');
  const testFun = fun.httpsCallable('stripeGetSources');

  const testFunBtn = document.getElementById('testFunButton');

  testFunBtn.onclick = async () => {
      const response = await testFun({message: 'Hello World!'});
  };

  var stripe = Stripe('pk_test_rQsbw7aGroBaBv4pTaDcuYgc005omAc5Ag');
  var elements = stripe.elements();

  const style = {
    base: {
      // Add your base input styles here. For example:
      fontSize: '16px',
      color: "#32325d",
    },
  };
    
  // Create an instance of the card Element.
  const card = elements.create('card', {style});

  // Add an instance of the card Element into the `card-element` <div>.
  card.mount('#card-element');

  card.addEventListener('change', function(event) {
    var displayError = document.getElementById('card-errors');
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
    }
  });
  
  
  const form = document.getElementById('payment-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const {source, error} = await stripe.createSource(card); // Changed fron Token to Source
      console.log(source)
    if (error) {
      // Inform the customer that there was an error.
      const errorElement = document.getElementById('card-errors');
      errorElement.textContent = error.message;
    } else {
      // Send the token to your server.

      // sourceHandler(source);
      // chargeHandler(source);
      subscriptionHandler(source);
    }
  });
  
  // Attach a Payment Source
  const attachFun = fun.httpsCallable('stripeAttachSource');
  const sourceHandler = async(source) => {
    console.log(source.id)
    const res = await attachFun({ source: source.id });
    console.log(res);
    alert('Success! source attached to customer');
  }

  // Create Charge for Specfic Amount
  const chargeFun = fun.httpsCallable('stripeCreateCharge');
  const chargeHandler = async(source) => {
    const res = await chargeFun({ source: source.id, amount: 3000 });
    console.log(res);
    alert('Success, charged customer $30.00');
  }


  // Get Charges
  const chargesBtn = document.getElementById('charges');
  const getChargesFun = fun.httpsCallable('stripeGetCharges');
  
  // chargesBtn.onclick = async(source) => {
  //   const res = await getChargesFun();
  //   console.log(res)
  //   const node = document.createElement('pre')
  //   node.innerText = JSON.stringify(res);
  //   chargesBtn.replaceWith(node)
  // }

    /// Subscriptions

  // Create Charge for Specfic Amount
  const subscriptionFun = fun.httpsCallable('stripeCreateSubscription');
  const subscriptionHandler = async(source) => {
    console.log(source.id);
    const res = await subscriptionFun({ plan: 'plan_FmpGElUUFBzVry', source: source.id });
    console.log(res);
    alert('Success, subscribed to plan');
  }


})