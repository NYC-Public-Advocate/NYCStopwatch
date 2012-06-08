$(function() {

	var m,
		interaction,
		mm = com.modestmaps,
		layer = 'mapbox.tornadoes-2010',
		urlBase = 'http://api.tiles.mapbox.com/v3/mapbox.mapbox-streets,',
		url = urlBase + layer + '.jsonp';
		
	// Build map
	wax.tilejson(url, function(tilejson) {
		
		tilejson.minzoom = 4;
		tilejson.maxzoom = 8;
		
		m = new mm.Map('mymap',
		new wax.mm.connector(tilejson));
		
		interaction = wax.mm.interaction()
		  .map(m)
		  .tilejson(tilejson)
		  .on({
		    on: function(o) {
		      $('#mymap').css('cursor','pointer');
		      buildStats(o.data);
		    },
		    off: function() {
		      $('#mymap').css('cursor','default');
		      resetStats();
		    }
		  });
		  
		wax.mm.zoomer(m, tilejson).appendTo(m.parent);
		wax.mm.attribution(m, tilejson).appendTo(m.parent);
		m.setCenterZoom(new mm.Location(39, -98), 5);
	});
	
	// Refresh map
	function refreshMap() {
		url = urlBase + layer + '.jsonp';
		wax.tilejson(url, function(newTileJson) {
			newTileJson.minzoom = 4;
			newTileJson.maxzoom = 8;
			m.setLayerAt(0, new wax.mm.connector(newTileJson));
			interaction.tilejson(newTileJson);
		});
	}
	
	// Layer switcher
	$('#sidebar ul.layerswitch a').click(function (e) {
		e.preventDefault();
		layer = this.id;
		$('#sidebar ul.layerswitch a').removeClass('active');
		$(this).addClass('active');
		refreshMap();
	});
	
	// Function gets called on data hover
	// Places and uses data from tilejson
	function buildStats(obj) {
	  
		var maxFscale = 5,
			maxInjuries = 350,
			maxDeaths = 25;
		
		// Place values in div
		$('#stats .data-row.date .data-value').text(obj.date);
		$('#stats .data-row.time .data-value').text(obj.time);
		$('#stats .bar-row.f-scale .bar-value').text(obj.fscale);
		$('#stats .bar-row.injuries .bar-value').text(obj.injuries);
		$('#stats .bar-row.deaths .bar-value').text(obj.fatalities);
		
		// Use values to style div
		$('#stats .bar-row.f-scale .bar-value').css('width', (obj.fscale/maxFscale)*80 + '%');
		$('#stats .bar-row.injuries .bar-value').css('width', (obj.injuries/maxInjuries)*80 + '%');
		$('#stats .bar-row.deaths .bar-value').css('width', (obj.fatalities/maxDeaths)*80 + '%');
	}
	
	// Function gets called on data hover-off
	// Resets stats to blank values
	function resetStats() {
		$('#stats .data-row.date .data-value').text('--/--/--');
		$('#stats .data-row.time .data-value').text('--:--:--');
		$('#stats .bar-row .bar-value').text('');
		$('#stats .bar-row .bar-value').css('width','0');
	}
});