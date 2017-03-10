"use strict"
import _ from 'lodash';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import 'bootstrap/dist/css/bootstrap.css';
import css from './css/main.css'

var GoogleMapsLoader = require('google-maps'); 


GoogleMapsLoader.KEY ='AIzaSyDm9nLO6iek_naPFgnyMz1JsJV-TEhLU5k';

GoogleMapsLoader.load(function(google) {
    new google.maps.Map(document.getElementById('map'), {
          center: {lat: 40.7413549, lng: -73.9980244},
          zoom: 13
        });
});
