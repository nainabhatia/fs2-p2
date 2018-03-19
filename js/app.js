
//initial locations
var locations = [
	{
		name:'Lajpat Nagar',
		location:{lat: 28.5677, lng: 77.2433}
	},
	{
		name:'Greater Kailash',
		location:{lat: 28.5428, lng:77.2395 }
	},
	{
		name:'Rajouri Garden',
		location:{lat: 28.6415, lng: 77.1209 }
	},
	{
		name:'Kamla Nagar',
		location:{lat:28.6809 , lng:77.2046 }
	},
	{
		name:'Hauz Khas',
		location:{lat:28.5494 , lng: 77.2001}
	},
	{
		name:'Chandni Chowk',
		location:{lat:28.6506 , lng: 77.2303}
	},
	{
		name:'Sarojini Nagar',
		location:{lat:28.5757 , lng: 77.1990}
	},

];
//locations to push to array
var addLocation = function(data){
	this.name = data.name;
	this.location = data.location;
};
//viewmodel for knockout js
var ViewModel = function(){
	var self = this;
	this.filter_text = ko.observable('');
	this.show_list = function(){
		$('.left_div').toggle();
	};
	this.locationList = ko.observableArray([]);
	locations.forEach(function(place){
		self.locationList.push(new addLocation(place));
	});
	 this.filterMarkers = function(){
	 	var filter_field = self.filter_text().toLowerCase();
	 	self.markers.forEach(function(marker){
	 		var marker_name = marker.title.toLowerCase();
	 		if(marker_name.search(filter_field)!== -1){
	 			marker.setMap(map);
	 		}
	 		else
	 		{
	 			marker.setMap(null);
	 		}
	 	});
	 	self.locationList([]);
	 	locations.forEach(function(place){
	 		var location_name = place.name.toLowerCase();
	 		if(location_name.search(filter_field)!== -1){
	 			self.locationList.push(new addLocation(place));
	 		}
	 	});
	 };
	 this.showAll = function(){
	 	self.markers.forEach(function(marker){
	 		marker.setMap(map);
	 		self.locationList([]);
	 		self.filter_text('');
	 		locations.forEach(function(place){
	 			self.locationList.push(new addLocation(place));
	 		});
	 	});
	 };
	 this.setLocation = function(){
	 	var that= this;
	 	//locations not filtered on the list so that they can still be shown in the side menu
	 	//if needed following code would be run

	 	// self.locationList([]);
	 	// locations.forEach(function(place){
	 	// 	if(that.name === place.name){
	 	// 		self.locationList.push(place)
	 	// 	}
	 	// })
	 	//markers set to null if not matched with location selection
	 	self.markers.forEach(function(marker){
	 		if(marker.title === that.name){
	 			marker.setMap(map);
	 			populateInfoWindow(marker,largeInfowindow);
	 		}
	 		else{
	 			marker.setMap(null);
	 		}
	 	});
	 };

	self.markers = [];
	self.locationList().forEach(function(marker){
		var marker_location = marker.location;
		var marker_name = marker.name;
		var makeMarkerIcon = function(icon_name){
			var marker_image = new google.maps.MarkerImage(
				// 'http://chart.googleapis.com/chart?chst=d_map_spin&child=1.15|0|' + m_color +
				// '|40|_|%E2%80%A2',
				icon_name,
				new google.maps.Size(25,27),
				new google.maps.Point(0,0),
				new google.maps.Point(10,34),
				new google.maps.Size(25,27));
			return marker_image;
		};
		//default and highligted icon for markers
		var default_icon = makeMarkerIcon('green_icon.png');
		var hover_icon = makeMarkerIcon('pink_icon.png');
		//ceate marker
		var new_marker = new google.maps.Marker({
			map:map,
			icon:default_icon,
			position:marker_location,
			title:marker_name,
			animation:google.maps.Animation.DROP,
		});
		self.markers.push(new_marker);
		//event listeners on markers
		new_marker.addListener('click',function(){
			populateInfoWindow(this,largeInfowindow);
		});
		new_marker.addListener('mouseover',function(){
			this.setIcon(hover_icon);
		});
		new_marker.addListener('mouseout',function(){
			this.setIcon(default_icon);
		});
	});
	
	//content to be shown in info window
	var populateInfoWindow = function(marker,infowindow){
		// Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          // Clear the infowindow content to give the streetview time to load.
          infowindow.setContent('');
          infowindow.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          var getStreetView_wikilinks = function(data, status) {
            infowindow.setContent('<div class="info_content"><div class="marker_title">' + marker.title + '</div><div><div class="wiki_header">Wikipedia Links</div><div id="wiki_links"></div></div><div id="pano"></div></div>');
          	var wiki_url = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='+ marker.title + '&format=json&callback=wikiCallback';
	    	var $wikiElem = $('#wiki_links');
	    	var $pano = $('#pano');
		    var wiki_request_timeout = setTimeout(function(){
		        //infowindow.setContent('<div><div class="wiki_header">Wikipedia Links</div><div id="wiki_links">Failed to load wikipedialinks</div></div>')
		        $wikiElem.append('Failed to load wikipedia links');
		    },8000);
		    //ajax call for wikipedia links (non google third party api)
		    $.ajax({
		        url:wiki_url,
		        dataType:'jsonp',
		        success: function(response){
		        	//infowindow.setContent('<div><div class="wiki_header">Wikipedia Links</div><div id="wiki_links"></div></div>')
		            var articleList = response[1];
		            for(var i = 0 ; i <articleList.length; i++){
		                article_str = articleList[i];
		                var url = 'http://en.wikipedia.org/wiki/' + article_str;
		                $wikiElem.append('<li><a href="' + url + '">' + article_str + '</a></li>');
		            }
		            clearTimeout(wiki_request_timeout);
		        }
		    });
		    //street view api response for google
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
               // infowindow.setContent('<div class="marker_title">' + marker.title + '</div><div><div class="wiki_header">Wikipedia Links</div><div id="wiki_links"></div></div><div id="pano"></div>');
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
              //infowindow.setContent('<div class="marker_title">' + marker.title + '</div>' +
               // '<div><div class="wiki_header">Wikipedia Links</div><div id="wiki_links"></div><div>No Street View Found</div>');
               $pano.append('<div>No street view found</div>');
            }
          };
          // Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
          	streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView_wikilinks);
          	// Open the infowindow on the correct marker.
	          infowindow.open(map, marker);
	        }	
	};
};

//ko.applyBindings(new ViewModel());