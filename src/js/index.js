"use strict";
import _ from 'lodash';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import css from '../css/main.css';
var ko = require("knockout");
import { concerts } from './model.js';

const SAVE_SEARCH_STR = 'SAVE_SEARCH_STR';
var panelToggler = {};
var currentConcerts;
var searchStr = getSearchStr();
if (searchStr) {
    currentConcerts = concerts.filter(function(concert) {
        return concert.band.includes(searchStr) || concert.place.includes(searchStr);
    });
} else {
    currentConcerts = concerts;
}




var ViewModel = function() {
    var self = this;
    var debounceSearch = _.debounce(filterConcerts, 300, false);


    self.isPanelOpen = ko.observable(true);
    self.searchStr = ko.observable(searchStr);
    self.concerts = ko.observableArray(currentConcerts);

    self.togglePanel = function() {
        self.isPanelOpen(!self.isPanelOpen());
    };


    self.search = function() {
        debounceSearch();
    };

    function filterConcerts() {
        self.concerts(concerts.filter(function(concert) {
            return concert.band.includes(self.searchStr()) || concert.place.includes(self.searchStr());
        }));
        replaceMarkers(self.concerts());
        saveSearchStr(self.searchStr());
    }

    self.centerToConcert = function(concert) {
        centerToMarker(concert);
    };
};
ko.applyBindings(new ViewModel());

function saveSearchStr(searchStr) {
    localStorage.setItem(SAVE_SEARCH_STR, searchStr);
}

function getSearchStr() {
    var searchStr = localStorage.getItem(SAVE_SEARCH_STR);
    if (searchStr === null) {
        searchStr = '';
    }
    return searchStr;
}


var GoogleMapsLoader = require('google-maps');
var map;
var markers = [];

GoogleMapsLoader.KEY = 'AIzaSyDm9nLO6iek_naPFgnyMz1JsJV-TEhLU5k';

GoogleMapsLoader.load(function(google) {
    var marker;
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 59.921985, lng: 30.307700 },
        zoom: 13
    });

    currentConcerts.forEach(function(concert) {
        markers.push(createMarker(concert));
    });
});


function createMarker(concert) {
    var marker = new google.maps.Marker({
        position: { lat: concert.lat, lng: concert.lng },
        map: map,
        title: concert.band + '/' + concert.date
    });
    marker.concertId = concert.id;
    return marker;
}


function replaceMarkers(concerts) {
    var concertsMap = new Map();

    concerts.forEach(function(concert) {
        concertsMap.set(concert.id, concert);
    });

    markers.forEach(function(marker) {
        if (!concertsMap.has(marker.concertId)) {
            marker.setMap(null);
        } else {
            concertsMap.delete(marker.concertId);
        }
    });

    concertsMap.forEach(function(concert) {
        markers.push(createMarker(concert));
    });


}

function centerToMarker(concert) {
    var marker = markers.find(function(marker) {
        return marker.concertId === concert.id;
    });
    if (marker !== undefined) {
        map.panTo({ lat: marker.getPosition().lat(), lng: marker.getPosition().lng() });
    }
}
