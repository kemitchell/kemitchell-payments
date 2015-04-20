/* jshint browser:true */
/* global Stripe: false */
(function() {
  Stripe.setPublishableKey('STRIPE_PUBLISHABLE_KEY');

  var onCreateToken = function(status, response) {
    var form = document.getElementById('payment-form');
    var errors = form.getElementsByClassName('payment-errors')[0];
    if (response.error) {
      var text = document.createTextNode(response.error.message);
      while (errors.firstChild) {
        errors.removeChild(errors.firstChild);
      }
      errors.appendChild(text);
      errors.className = errors.className.replace(' hidden', '');
      var button = form.getElementsByTagName('button')[0];
      button.attributes.disabled = false;
    } else {
      if (errors.className.indexOf('hidden') < 0) {
        errors.className = errors.className + ' hidden';
      }
      var token = response.id;
      // form.submit();
      var request = new XMLHttpRequest();
      request.open('POST', '/payment', true);
      request.onload = function() {
        if (request.status === 200) {
          console.log(200);
        } else {
          console.log('else');
        }
      };
      request.send(JSON.stringify({
        amount: document.getElementsByName('amount')[0].value,
        stripeToken: token
      }));
      event.preventDefault();
    }
  };

  window.addEventListener('load', function() {
    var form = document.getElementById('payment-form');
    form.addEventListener('submit', function(event) {
      var submitButton = form.getElementsByTagName('button')[0];
      submitButton.attributes.disabled = true;
      Stripe.card.createToken(form, onCreateToken);
      event.preventDefault();
    });
  });
})(Stripe);
