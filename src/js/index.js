"use strict";
import _ from 'lodash';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import css from '../css/main.css';
import mobilecss from '../css/mobile.css';
import { concerts } from './model.js';

var ko = require("knockout");
const SAVE_SEARCH_STR = 'SAVE_SEARCH_STR';
var lastFmApiKey = '9ff1cbd1b11a8d927f184d1ff1fe2c36';
var lastFmApiPath = 'http://ws.audioscrobbler.com/2.0/';
var panelToggler = {};
var GoogleMapsLoader = require('google-maps');
GoogleMapsLoader.KEY = 'AIzaSyDm9nLO6iek_naPFgnyMz1JsJV-TEhLU5k';
var map;
var markers = [];
var largeInfoWindow;
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
        closeInfoWindow(largeInfoWindow);
        saveSearchStr(self.searchStr());
    }

    self.centerToConcert = function(concert) {
        centerToMarker(concert);
        getBandInfo(concert);
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





GoogleMapsLoader.load(function(google) {
    var marker;
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 59.921985, lng: 30.307700 },
        zoom: 13
    });

    currentConcerts.forEach(function(concert) {
        markers.push(createMarker(concert));
    });
    largeInfoWindow = new google.maps.InfoWindow();
});


function createMarker(concert) {
    var marker = new google.maps.Marker({
        position: { lat: concert.lat, lng: concert.lng },
        map: map,
        title: concert.band + '/' + concert.date,
        icon: getMarkerIcon(concert.date),
        animation: google.maps.Animation.DROP
    });
    marker.concertId = concert.id;
    marker.addListener('click', function() {
        getBandInfo(concert);
    });

    return marker;
}


function getMarkerIcon(concertDate) {
    var currentDate = +new Date();
    concertDate = convertDateToTimestamp(concertDate);
    var timeToConcert = concertDate - currentDate;
    if (timeToConcert < 1000 * 60 * 60 * 24 * 7) {
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    } else if (timeToConcert < 1000 * 60 * 60 * 24 * 30) {
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    } else {
        return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    }
}

function convertDateToTimestamp(concertDate) {
    return new Date(concertDate.split('.').reverse().join('-')).getTime();
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
            marker.setMap(map);
            concertsMap.delete(marker.concertId);
        }
    });
    concertsMap.forEach(function(concert) {
        markers.push(createMarker(concert));
    });
}


function populateInfoWindow(concert, infoWindow) {
    var marker = markers.find(function(marker) {
        return marker.concertId === concert.id;
    });
    if (infoWindow.marker != marker) {
        if (infoWindow.marker) {
            infoWindow.marker.setAnimation(null);
        }
        infoWindow.marker = marker;
        infoWindow.setContent(createInfoWindowContent(concert));
        infoWindow.open(map, marker);
        infoWindow.addListener('closeclick', function() {
            infoWindow.marker.setAnimation(null);
            infoWindow.marker = null;
        });
        marker.setAnimation(google.maps.Animation.BOUNCE);
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                document.getElementById('pano').innerHTML = "No Street View Found";
            }
        }
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    } else {
        closeInfoWindow(infoWindow);
    }
}






function closeInfoWindow(infoWindow) {
    infoWindow.marker.setAnimation(null);
    infoWindow.marker = null;
    infoWindow.close();
}


function createInfoWindowContent(concert) {
    var template = `<div id="infoWindow"><h4>Band: %bandName%</h4>
					<div>%img%</div>
					<h4 id="placeInfoHeader">Place: %place% / Date: %date%</h4>
					<div id="pano"></div>
					</div>`;
    var imgTemplate = '<img src=%bandImg%></img>';


    var res = template.replace('%bandName%', concert.band)
        .replace('%place%', concert.place)
        .replace('%date%', concert.date);
    if (concert.bandInfo && concert.bandInfo.image[2]['#text']) {
        res = res.replace('%img%', imgTemplate.replace('%bandImg%', concert.bandInfo.image[2]['#text']));
    } else {
        res = res.replace('%img%', "Can't get image of band");
    }

    return res;
}


function getBandInfo(concert) {
    if (!concert.bandInfo) {
        $.ajax({
            url: lastFmApiPath,
            data: {
                'api_key': lastFmApiKey,
                'method': 'artist.search',
                'artist': concert.band,
                'format': 'json'
            },
            success: function(data) {
                if (+data.results['opensearch:totalResults'] > 0) {
                    concert.bandInfo = data.results.artistmatches.artist[0];
                }
                populateInfoWindow(concert, largeInfoWindow);
            },
            error: function() {
                console.error("Can't get info about band");
                populateInfoWindow(concert, largeInfoWindow);
            }
        });
    } else {
        populateInfoWindow(concert, largeInfoWindow);
    }
}

function centerToMarker(concert) {
    var marker = markers.find(function(marker) {
        return marker.concertId === concert.id;
    });
    if (marker !== undefined) {
        map.panTo({ lat: marker.getPosition().lat(), lng: marker.getPosition().lng() });
    }
}
