'use strict';

var BaseView = require('../base-view');
var btVenmo = require('braintree-web/venmo');
var classlist = require('../../lib/classlist');
var DropinError = require('../../lib/dropin-error');
var paymentOptionIDs = require('../../constants').paymentOptionIDs;

function VenmoView() {
  BaseView.apply(this, arguments);
}

VenmoView.prototype = Object.create(BaseView.prototype);
VenmoView.prototype.constructor = VenmoView;
VenmoView.ID = VenmoView.prototype.ID = paymentOptionIDs.venmo;

VenmoView.prototype.initialize = function () {
  var self = this;

  self.model.asyncDependencyStarting();

  return btVenmo.create({
    client: this.client
  }).then(function (venmoInstance) {
    var button = self.getElementById('venmo-button');

    button.addEventListener('click', function (event) {
      event.preventDefault();

      classlist.add(self.element, 'braintree-sheet--loading');
      venmoInstance.tokenize().then(function (payload) {
        self.model.addPaymentMethod(payload);
      }).catch(function (tokenizeErr) {
        self.model.reportError(tokenizeErr);
      }).then(function () {
        classlist.remove(self.element, 'braintree-sheet--loading');
      });
    });

    self.model.asyncDependencyReady();
  }).catch(function (err) {
    self.model.asyncDependencyFailed({
      view: self.ID,
      error: new DropinError(err)
    });
  });
};

module.exports = VenmoView;
