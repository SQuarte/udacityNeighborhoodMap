"use strict"
import _ from 'lodash';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import 'bootstrap/dist/css/bootstrap.css';
import css from '../css/main.css';
var ko = require("knockout");
import {concerts} from './model.js';


console.log("AAAA");
console.log(require('knockout'));


var panelToggler = {}


var ViewModel = function() {
	var self = this;
	self.isPanelOpen = ko.observable(true);
	self.concerts = ko.observableArray(concerts);
	self.togglePanel = function() {
		self.isPanelOpen(!self.isPanelOpen());
	};
}
ko.applyBindings(new ViewModel());



var GoogleMapsLoader = require('google-maps'); 


GoogleMapsLoader.KEY ='AIzaSyDm9nLO6iek_naPFgnyMz1JsJV-TEhLU5k';

GoogleMapsLoader.load(function(google) {
	var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 59.921985, lng: 30.307700},
          zoom: 13
    });

    concerts.forEach(function(place) {
    	new google.maps.Marker({
    		position: {lat: place.lat, lng: place.lng},
    		map: map,
    		title: place.band + '/' + place.date
    	})
    })


});
