

$(document).ready(function() {

  var url = 'http://a.tiles.mapbox.com/v3/albatrossdigital.map-e7gmjqf4.jsonp';
  var mm = com.modestmaps;
  var map;
  var markerClip;
  var map_center = { lat: 40.758, lon: -73.883 };
  var map_level = 12;
  var located_map_level = 14;
  var json_url = 'http://184.169.161.128/stopfrisk/stopfrisks_near_me.php?callback=?';


  // This fetches TileJSON from the URL in the `rel` attribute of the clicked link.
  wax.tilejson(url, function(tilejson) {
   
    map = new mm.Map('mymap',
      new wax.mm.connector(tilejson)
    );
    
    // Add zoom controls
    wax.mm.zoomer(map, tilejson).appendTo(map.parent);
    // Add interactivity (tooltips)
    var interaction = wax.mm.interaction().map(map).tilejson(tilejson)
      .on(wax.tooltip().parent(map.parent).events());
    // Add map attribution
    wax.mm.attribution(map, tilejson).appendTo(map.parent);
    // add legend
    wax.mm.legend(map, tilejson).appendTo(map.parent);
    
    //
    map.addCallback('drawn', function(m) {
      clear_radius();
    });
    
    map.setCenterZoom(map_center, map_level);  
    markerClip = new MarkerClip(map);
    
  });

  $('#sidebar-close').bind('click', function() {
	  $('#sidebar').animate({
      opacity: 0.5,
      height: 0,
      width: 0
      //left: '+=50',
    }, 500, function() {
      // Animation complete.
      $(this).hide();
    });
	});
	$('#sidebar-open').bind('click', function() {
	  $('#sidebar').css({
	    display: 'block'
	    
	  }).animate({
      opacity: 1,
      height: orig_height + 'px',
      width: '350px'
      //left: '+=50',
    }, 500, function() {
      // Animation complete.
    });
	});
	var orig_height = $('#sidebar').height() + 10;
	
  
  

	$('#select').geo_autocomplete(new google.maps.Geocoder, {
		selectFirst: false,
		minChars: 3,
		cacheLength: 50,
		width: 300,
		scroll: true,
		mapwidth: 50,
		mapheight: 50,
		geocoder_region: ' New York NY USA',
		scrollHeight: 330
	}).result(function(_event, _data) {
	  loading();
    got_location(_data.geometry.location.$a, _data.geometry.location.ab);
	});
	
	
	$('#geocode').bind('click', function() {
	  $('#within-radius').html('<div class="error" style="background-color:white">Please allow your browser to share your location.<div class="loading"></div></div>');
	  $('.ac_input').val('');
		$.geolocation.get({win: function(position) {
		  loading();
		  got_location(position.coords.latitude, position.coords.longitude);
		}, fail: function(error) {
		  alert("We had a problem finding your location. Please enter it below instead. \r\rError code: " + error.code);
		}});
	});
	 
	
	function got_location(lat, lon) {
	  clear_radius();
	  map.setCenterZoom({ lat: lat, lon: lon }, located_map_level);
	  
	  $.ajax({
	    url: json_url + '&lat=' + lat + '&lon=' + lon,
	    dataType: 'json',
      success: function(data) {
        
        if (data.error == true || (data.onemi == 0 && data.halfmi == 0)) {
          $('#within-radius').html('<div class="error">We could not find any Stop and Frisks near you.</div>');
        } else {
          add_radius(lat, lon, 'Current Location', 10, 1);
          add_radius(lat, lon, 'One Mile', 400, .3);
          add_radius(lat, lon, 'Half Mile', 200, .5);
          $('#within-radius').html(
            'In 2011, <span class="halfmile">there were <span class="number">' + data.halfmi + '</span> stops within 1/2 mile</span> of your location. ' + 
            '<span class="onemile">There were <span class="number">' + data.onemi + '</span> stops within 1 mile</span> of your location.'
          );
        }
        
      } // success
    });
	}
	
	function loading() {
	  $('#within-radius').html('<div class="loading"></div>');
	}
	
	function add_radius(lat, lon, title, width, opacity) {
	  var marker = markerClip.createDefaultMarker(title.toLowerCase().replace(' ', ''), width, opacity),
      lat = lat, 
      lon = lon,
      location = new MM.Location(lat, lon);
    marker.title = title;
    $(marker).bind('mouseover', function() {
      $('#within-radius .' + $(this).attr('id')).addClass('active');
    }).bind('mouseout', function() {
      $('#within-radius .' + $(this).attr('id')).removeClass('active');
    });
    markerClip.addMarker(marker, location);
	}
	
	function clear_radius() {
	  $('#onemile, #halfmile, #currentlocation').hide();
	}

});
