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


//viewmodel for knockout js
var ViewModel = function(){
	var self = this;
	self.filter_text = ko.observable('');
	//self.location_selected = ko.observable('')
	self.wiki_links = ko.observableArray([]);
	self.wiki_message = ko.observable('');
	self.marker_name = ko.observable('');
	self.show_list = function(){
		$('.left_div').toggle();
	};
	self.locationList = ko.observableArray([]);
	// add locations to locationlist array
	locations.forEach(function(place){
		self.locationList.push(place);
	});
	console.log("location list",self.locationList());
	//markers array initialized
	self.markers = ko.observableArray([]);
	self.filtered_location_list = ko.observableArray([]);
	self.filtered_location_list(self.locationList());
	var makeMarkerIcon = function(icon_name){
			var marker_image = new google.maps.MarkerImage(
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
	//create markers for each location in location list
	self.filtered_location_list().forEach(function(marker){
		var marker_location = marker.location;
		var marker_name = marker.name;
		
		//ceate marker
		var new_marker = new google.maps.Marker({
			map:map,
			icon:default_icon,
			//content:marker_content(marker),
			position:marker.location,
			title:marker.name,
			animation:google.maps.Animation.DROP,
		});
		self.markers.push(new_marker);
		//event listeners on markers
		new_marker.addListener('click',function(){
			var that = this;
			marker_content(marker);
			console.log(self.wiki_links());
			//populateInfoWindow(this,largeInfowindow);
			that.setAnimation(google.maps.Animation.BOUNCE);
      		setTimeout(function() {
      		that.setAnimation(null);
     		}, 2100);
		});

		//});
		new_marker.addListener('mouseover',function(){
			this.setIcon(hover_icon);
		});
		new_marker.addListener('mouseout',function(){
			this.setIcon(default_icon);
		});
	});
// 	var populateInfoWindow = function(marker,infowindow){
// 		console.log(marker,infowindow)
// };
	var marker_content = function(marker){
	console.log("marker_content",marker);
	self.wiki_links([]);
	self.wiki_message('');
	self.marker_name(marker.name);
	
          	var wiki_url = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='+ marker.name + '&format=json&callback=wikiCallback';
	    	
		    
		    //ajax call for wikipedia links (non google third party api)
		    $.ajax({
		        url:wiki_url,
		        dataType:'jsonp',
		        success: function(response){
		        	//infowindow.setContent('<div><div class="wiki_header">Wikipedia Links</div><div id="wiki_links"></div></div>')
		            var articleList = response[1];
		            if(articleList.length === 0){
		            	self.wiki_message('no wikipedia links found for this location');
		            }
		            for(var i = 0 ; i <articleList.length; i++){
		                article_str = articleList[i];
		                var url = 'http://en.wikipedia.org/wiki/' + article_str;
		           		self.wiki_links.push('<li><a href="' + url + '">' + article_str + '</a></li>');
		            }
		            //clearTimeout(wiki_request_timeout);
		        },
		        error:function(){
		        	self.wiki_message('Failed to load wikipedia links');
		        }
		    });
//};
	
};
	
	self.filterMarkers = function(){
		var that = this;
		var filter_field = self.filter_text().toLowerCase();
		if(this.name){
			var set_location_name = this.name.toLowerCase();
		}
		//filter locations
	 	self.filtered_location_list([]);
	 	self.locationList().forEach(function(location){
	 		//var location_name = place.name.toLowerCase();
	 		if(location.name.toLowerCase().search(filter_field)!== -1){
	 			self.filtered_location_list.push(location);
	 		}
	 	});
	
	 	self.markers().forEach(function(marker){
	 		//var marker_name = marker.title.toLowerCase();
	 		marker.setVisible(false);
	 		if(!set_location_name && marker.title.toLowerCase().search(filter_field)!== -1){
	 			//marker.setMap(map);
	 			//console.log("1")
	 			marker.setVisible(true);
	 		}
	 		else if(set_location_name){
	 			
	 			//console.log("2")
	 			marker.setVisible(true);
	 			if(marker.title.toLowerCase().search(set_location_name.toLowerCase())!== -1){
		 			marker.setIcon(hover_icon);
		 			marker.setAnimation(google.maps.Animation.BOUNCE);
	      			setTimeout(function() {
	      			marker.setAnimation(null);
	      			marker.setIcon(default_icon);
	     			}, 2100);
	     			marker_content(that);
					console.log(self.wiki_links());
					//populateInfoWindow(marker,largeInfowindow);
      		}
	 		}
	 		
	 	});
	 };
	 //clear filter text and show all places
	 self.showAll = function(){
	 	self.filter_text('');
	 	self.filterMarkers();
	 };
	 //clear info content
	 self.clearValues = function(){
	 	console.log("click");
	 	self.wiki_links([]);
	 	self.wiki_message('');
	 };
	 

};