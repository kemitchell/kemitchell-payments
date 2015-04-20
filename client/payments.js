/* jshint browser:true */
/* global Stripe: false */
(function() {
  Stripe.setPublishableKey('STRIPE_PUBLISHABLE_KEY');

  var showErrorMessage = function(message) {
    var form = document.getElementById('payment-form');
    var errors = form.getElementsByClassName('payment-errors')[0];
    var text = document.createTextNode(message);
    while (errors.firstChild) {
      errors.removeChild(errors.firstChild);
    }
    errors.appendChild(text);
    errors.className = errors.className.replace(' hidden', '');
  };

  var showSuccess = function() {
    var creditCard = document.getElementById('creditCard');
    creditCard.className = creditCard.className + ' hidden';
    var thankYou = document.getElementById('thankYou');
    thankYou.className = thankYou.className.replace(' hidden', '');
  };

  var onCreateToken = function(status, response) {
    var form = document.getElementById('payment-form');
    if (response.error) {
      showErrorMessage(response.error.message);
      var button = form.getElementsByTagName('button')[0];
      button.attributes.disabled = false;
    } else {
      var errors = form.getElementsByClassName('payment-errors')[0];
      if (errors.className.indexOf('hidden') < 0) {
        errors.className = errors.className + ' hidden';
      }
      var token = response.id;
      var request = new XMLHttpRequest();
      request.open('POST', '/payment', true);
      request.onload = function() {
        console.log(request);
        if (request.status === 201) {
          showSuccess();
        } else {
          showErrorMessage(request.response);
        }
      };
      var amountInput = document.getElementsByName('amount')[0];
      var cents = parseInt(amountInput.value) * 100;
      request.send(JSON.stringify({
        amount: cents,
        stripeToken: token
      }));
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
