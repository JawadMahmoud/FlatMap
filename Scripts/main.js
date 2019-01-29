

// File import variables
var url;
var gpx;
var file_name_ext, uploaded_file;

// Coordinates and each type of data parsed from the GPX xml file
var plotcords;var elecords;var hrcords;var tempcords;var cadcords;var timecords;

// Processed data of each type
var hrdata;var eledata;var tempdata;var caddata;

// average data calculated
var ele_min;var ele_max;
var avgtemp, avgcad;

// Markers for each data type
var marker_list;var markers_layer;var markersLayerG;var invis_marker_iter, marker_iter;

// Variables for storing and using Hotline Layer plugin properly
var eleHotlineLayer, hrHotlineLayer, cadHotlineLayer, tempHotlineLayer;
var eleHotlineLayerG, hrHotlineLayerG, cadHotlineLayerG, tempHotlineLayerG;
var eleHotlineMarkers, hrHotlineMarkers, cadHotlineMarkers, tempHotlineMarkers;

// Icons to be imported
var eleicon, hricon, cadicon, tempicon;

// Charts on either side of the page
var chart_left, chart_right;

// Initialise the Leaflet Map
var mymap = L.map('mapid').setView([51.505, -0.09], 13);
L.tileLayer(
	'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamF3YWRzaGFoaWQiLCJhIjoiY2puZzQ0eno3MDRjbDNrcWlsZjZxNTcxaSJ9.mavbvckNOMnntmxWcKboyQ', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox.outdoors'
	}).addTo(mymap);
var control = L.control.layers(null, null).addTo(mymap);

// Functions for showing/hiding Tooltips and initialising the web page ->>>>>

$(document).ready(function() {
	$('#right_column').hide();
	$('#left_column').hide();
	$('#middle_column').hide();
	$('#get_file').tooltip('show');
});

$('#get_file').click(function() {
	$('#get_file').tooltip('hide');
});

$('#hr_layer_button').click(function() {
	$('#hr_layer_button').tooltip('hide');
});
$('#ele_layer_button').click(function() {
	$('#ele_layer_button').tooltip('hide');
});
$('#temp_layer_button').click(function() {
	$('#temp_layer_button').tooltip('hide');
});
$('#cad_layer_button').click(function() {
	$('#cad_layer_button').tooltip('hide');
});

$('#hr_layer_button').hover(function() {
	$('#hr_layer_button').tooltip('show');
});
$('#ele_layer_button').hover(function() {
	$('#ele_layer_button').tooltip('show');
});
$('#temp_layer_button').hover(function() {
	$('#temp_layer_button').tooltip('show');
});
$('#cad_layer_button').hover(function() {
	$('#cad_layer_button').tooltip('show');
});

$('.leaflet-control-layers-toggle').hover(function() {
	$('.leaflet-control-layers-toggle').tooltip('hide');
});
$('.leaflet-control-layers-toggle').hide();

// <<<<<-

document.getElementById('get_file').onclick = function() {
	document.getElementById('gpx_file').click();
};

document.getElementById('chart_file').onclick = function() {
	display_chart(timecords, eledata, 'Elevation', 'myChart1',
		'teal');
	display_chart(timecords, hrdata, 'Heart Rate', 'myChart2',
		'red');
};

// When a file is loaded into the, run all functions to show all page elements and parse the xml ->>>>> 

$(document).ready(function() {
	$("#gpx_file").on('change', function() {
		$('#right_column').show();
		$('#left_column').show();
		$('#middle_column').show();
		uploaded_file = document.getElementById(
			'gpx_file').value;
		file_name_ext = uploaded_file.split('.').pop()
			.toLowerCase();
		if ('gpx' !== file_name_ext) {
			alert(
				"Incorrect file type, please upload a .gpx file");
			return;
		}
		console.log(file_name_ext);

		remove_layer(gpx);
		remove_layer(markersLayerG);
		remove_layer(hrHotlineLayerG);
		remove_layer(eleHotlineLayerG);
		remove_layer(tempHotlineLayerG);
		remove_layer(cadHotlineLayerG);
		display_gpx(document.getElementById('demo'));
		$("#hr_layer_button").attr('class',
			'btn btn-outline-danger');
		$("#ele_layer_button").attr('class',
			'btn btn-outline-warning');
		$("#temp_layer_button").attr('class',
			'btn btn-outline-info');
		$("#cad_layer_button").attr('class',
			'btn btn-outline-success');
	});
});

// <<<<<-


// Function for initializing the Leaflet GPX plugin, parses all data and displays charts ->>>>>
function display_gpx(elt) {

	if (!elt) return;

	url = "GPXFiles/" + document.getElementById('gpx_file').files[0]
		.name;

	function _t(t) {
		return elt.getElementsByTagName(t)[0];
	}

	function _c(c) {
		return elt.getElementsByClassName(c)[0];
	}

	function _i(i) {
		return elt.getElementById(i);
	}

	var new_gpx = new L.GPX(url, {
		async: true,
		polyline_options: {
			color: 'MidnightBlue',
		},
		marker_options: {
			startIconUrl: 'http://github.com/mpetazzoni/leaflet-gpx/raw/master/pin-icon-start.png',
			endIconUrl: 'http://github.com/mpetazzoni/leaflet-gpx/raw/master/pin-icon-end.png',
			//shadowUrl:    'http://github.com/mpetazzoni/leaflet-gpx/raw/master/pin-shadow.png',
		},
	}).on('loaded', function(e) {
		gpx = e.target;
		mymap.fitBounds(gpx.getBounds());
		control.addBaseLayer(gpx, 'Simple line');
		/*
		 * Note: the code below relies on the fact that the demo GPX file is
		 * an actual GPS track with timing and heartrate information.
		 */
		//_c('title').textContent = gpx.get_name();
		//_c('start').textContent = gpx.get_start_time().toDateString() + ', ' + gpx.get_start_time().toLocaleTimeString();
		_c('distance').textContent = (gpx.get_distance() /
			1000).toFixed(2);
		_c('duration').textContent = gpx.get_duration_string(
			gpx.get_moving_time());
		//_c('pace').textContent     = gpx.get_duration_string(gpx.get_moving_pace(), true);
		_c('speed').textContent = gpx.get_moving_speed()
			.toFixed(2);
		_c('avghr').textContent = gpx.get_average_hr();
		_c('avgcad').textContent = gpx.get_average_cadence();
		avgtemp = gpx.get_average_temp();
		//_c('avgtemp').textContent  = gpx.get_average_temp();
		//_c('elevation-gain').textContent = gpx.get_elevation_gain().toFixed(0);
		//_c('elevation-loss').textContent = gpx.get_elevation_loss().toFixed(0);
		_c('elevation-net').textContent = (gpx
			.get_elevation_gain() - gpx
			.get_elevation_loss().toFixed(0)).toFixed(2);

		hrdata = getCol(gpx.get_heartrate_data(), 1);
		eledata = getCol(gpx.get_elevation_data(), 1);
		tempdata = getCol(gpx.get_temp_data(), 1);
		caddata = getCol(gpx.get_cadence_data(), 1);
		ele_min = gpx.get_elevation_min();
		ele_max = gpx.get_elevation_max();

		loadXMLDoc();

		window.setTimeout(function() {
			draw_hotline_all();
			if (chart_left) {
				chart_left.destroy();
			}
			if (chart_right) {
				chart_right.destroy();
			}
			chart_left = display_chart(timecords,
				eledata, 'Elevation', 'myChart1',
				'teal', "card-to-left");
			chart_right = display_chart(timecords,
				hrdata, 'Heart Rate', 'myChart2',
				'purple', "card-to-right");
		}, 300);

	}).addTo(mymap);

	$('#file_success_alert').show();
	document.getElementById("myChart1").style.display = "none";
	document.getElementById("myChart2").style.display = "none";

}

// <<<<<-

// Initialise all the Leaflet Hotline functions defined below, for generating the gradient lines for each data type ->>>>>

function draw_hotline_all() {
	all_marker_groups();
	remove_layer(hrHotlineLayer);
	remove_layer(eleHotlineLayer);
	remove_layer(tempHotlineLayer);
	remove_layer(cadHotlineLayer);
	if (hrcords.length != 0) {
		draw_hotline_hr();
		$('#hr_layer_button').show();
	} else {
		$('#hr_layer_button').hide();
	}
	if (elecords.length != 0) {
		draw_hotline_ele();
		$('#ele_layer_button').show();
	} else {
		$('#ele_layer_button').hide();
	}
	if (tempcords.length != 0) {
		draw_hotline_temp();
		$('#temp_layer_button').show();
		document.getElementById('cad_header').innerText =
			"Average Temperature";
		console.log("temp:", gpx.get_average_temp());
		document.getElementById("avg_cad").innerText = avgtemp;
		document.getElementById('cad_unit').innerText = "°C";
		document.getElementById('cad_img').src =
			"https://image.flaticon.com/icons/svg/134/134125.svg";
	} else {
		document.getElementById('cad_header').innerText =
			"Average Cadence";
		document.getElementById('cad_unit').innerText = "cad";
		document.getElementById('cad_img').src =
			"https://image.flaticon.com/icons/svg/670/670750.svg";
		$('#temp_layer_button').hide();
	}
	if (cadcords.length != 0) {
		draw_hotline_cad();
		$('#cad_layer_button').show();
	} else {
		$('#cad_layer_button').hide();
	}

}

// <<<<<-

// Initialise the Hotline for Elevation data ->>>>>

function draw_hotline_ele() {
	eleHotlineLayer = L.hotline(elecords, {
		min: ele_min,
		max: ele_max,
		palette: {
			0.0: '#41ead4',
			0.5: '#fbff12',
			1.0: '#ff206e'
		},
		weight: 7,
		outlineColor: '#000000',
		outlineWidth: 1
	});

	eleHotlineLayerG.push(eleHotlineLayer);
	eleHotlineLayerG = L.layerGroup(eleHotlineLayerG);
	control.addBaseLayer(eleHotlineLayerG, 'Elevation Line').addTo(
		mymap);
}

// Initialise the Hotline for Elevation data ->>>>>

function draw_hotline_hr() {
	hrHotlineLayer = L.hotline(hrcords, {
		min: 90,
		max: 200,
		palette: {
			0.0: '#41ead4',
			0.5: '#fbff12',
			1.0: '#ff206e'
		},
		weight: 7,
		outlineColor: '#000000',
		outlineWidth: 1
	});

	hrHotlineLayerG.push(hrHotlineLayer);
	hrHotlineLayerG = L.layerGroup(hrHotlineLayerG);
	control.addBaseLayer(hrHotlineLayerG, 'Heart Rate Line').addTo(
		mymap);
}

// Initialise the Hotline for Elevation data ->>>>>

function draw_hotline_temp() {
	tempHotlineLayer = L.hotline(tempcords, {
		min: 20,
		max: 40,
		palette: {
			0.0: '#41ead4',
			0.5: '#fbff12',
			1.0: '#ff206e'
		},
		weight: 7,
		outlineColor: '#000000',
		outlineWidth: 1
	});

	tempHotlineLayerG.push(tempHotlineLayer);
	tempHotlineLayerG = L.layerGroup(tempHotlineLayerG);
	control.addBaseLayer(tempHotlineLayerG, 'Temperature Line').addTo(
		mymap);
}

// Initialise the Hotline for Elevation data ->>>>>

function draw_hotline_cad() {
	cadHotlineLayer = L.hotline(cadcords, {
		min: 0,
		max: 150,
		palette: {
			0.0: '#41ead4',
			0.5: '#fbff12',
			1.0: '#ff206e'
		},
		weight: 7,
		outlineColor: '#000000',
		outlineWidth: 1
	});

	cadHotlineLayerG.push(cadHotlineLayer);
	cadHotlineLayerG = L.layerGroup(cadHotlineLayerG);
	control.addBaseLayer(cadHotlineLayerG, 'Cadence Line').addTo(
		mymap);
}

// <<<<<-

// Parses the xml, loads all the data points into variables

function loadXMLDoc() {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			myFunction(this);
		}
	};
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

function myFunction(xml) {
	var xmlDoc;
	xmlDoc = xml.responseXML;

	plotcords = [];
	elecords = [];
	hrcords = [];
	tempcords = [];
	cadcords = [];
	timecords = [];

	plotpoints = xmlDoc.getElementsByTagName("trkpt");
	timepoins = xmlDoc.getElementsByTagName("time");
	if (xmlDoc.getElementsByTagName("bla").length) {
		console.log("bad");
	}
	//elelist = xmlDoc.getElementsByTagName("ele");
	for (i = 0; i < plotpoints.length; i++) {
		plotcords.push([Number(plotpoints[i].getAttribute('lat')),
			Number(plotpoints[i].getAttribute('lon'))
		]);
		elecords.push([Number(plotpoints[i].getAttribute('lat')),
			Number(plotpoints[i].getAttribute('lon')),
		  eledata[i]
		]);
		hrcords.push([Number(plotpoints[i].getAttribute('lat')),
			Number(plotpoints[i].getAttribute('lon')), hrdata[
				i]
		]);
		if (tempdata[i] != null) {
			tempcords.push([Number(plotpoints[i].getAttribute('lat')),
				Number(plotpoints[i].getAttribute('lon')),
				tempdata[i]
			]);
		}
		if (caddata[i] != null) {
			cadcords.push([Number(plotpoints[i].getAttribute('lat')),
				Number(plotpoints[i].getAttribute('lon')),
				caddata[i]
			]);
		}
		timecords.push((timepoins[i].childNodes[0].nodeValue)
			.substring(11, 19));

	}

	console.log(plotcords);
	console.log(timecords);
	console.log(elecords);
	console.log(hrcords);
	console.log(tempcords);
	console.log(cadcords);

}

// <<<<<-

function printcords(cords) {
	console.log("#2");
	console.log(cords);
}

function getCol(matrix, col) {
	var column = [];
	for (var i = 0; i < matrix.length; i++) {
		column.push(matrix[i][col]);
	}
	return column;
}

function getColor(x) {
	return x < 50 ? '#bd0026' :
		x < 100 ? '#f03b20' :
		x < 200 ? '#fd8d3c' :
		x < 300 ? '#fecc5c' :
		'#ffffb2';
}

function draw_markers() {
	remove_layer(markers_layer);
	markers_layer = L.layerGroup([]);

	for (b = 0; b < plotcords.length; b += 10) {
		var firstmarker = L.marker(plotcords[b], {
			riseOnHover: 'true',
			icon: L.icon({
				iconUrl: 'Icons/blank2.png',
				iconSize: [5, 5],
				iconAnchor: [2.5, 5]
			})
		}).addTo(mymap);

		firstmarker.bindTooltip(
			"<b>Elevation: </b>" + eledata[b].toFixed(2) +
			"<br />" +
			"<b>Heart Rate: </b>" + hrdata[b].toFixed(2) +
			"<br />" +
			"<b>Temperature: </b>" + tempdata[b] + "<br />" +
			"<b>Cadence: </b>" + caddata[b] + "<br />"
		);

		markers_layer.addLayer(firstmarker);
	}

	control.addOverlay(markers_layer, 'Markers').addTo(mymap);
}

function remove_layer(layer) {
	if (layer != null) {
		mymap.removeLayer(layer);
		control.removeLayer(layer);
	}

}

function display_chart(inlabels, indata, inchartlabel, inelement,
	incolor, incard) {
	console.log(indata);
	console.log(inlabels);
	for (i = 0; i < indata.length; i++) {
		indata[i] = indata[i].toFixed(2);
	}
	document.getElementById(inelement).style.display = "block";
	document.getElementById(inelement).innerHTML = "";
	document.getElementById(incard).style.marginTop = "4%";
	var ctx = document.getElementById(inelement).getContext('2d');
	var chart_plot = new Chart(ctx, {
		type: 'line',
		data: {

			labels: inlabels,
			datasets: [{

				label: inchartlabel,
				data: indata,
				fill: false,
				borderColor: incolor,
				borderWidth: 2,
				backgroundColor: incolor,
				pointHitRadius: 5,
			}]
		},
		options: {
			tooltips: {
				displayColors: false
			},
			elements: {
				point: {
					radius: 0
				}
			},
			responsive: true,
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true
					}
				}]
			}
		}
	});
	return chart_plot;
}

// function removeChartData(chart) {
// 	chart.data.labels.pop();
// 	chart.data.datasets.forEach((dataset) => {
// 		dataset.data.pop();
// 	});
// 	chart.update();
// }

function all_marker_groups() {
	if (elecords.length != 0) {
		eleHotlineLayerG = [];
	}
	if (hrcords.length != 0) {
		hrHotlineLayerG = [];
	}
	if (cadcords.length != 0) {
		cadHotlineLayerG = [];
	}
	if (tempcords.length != 0) {
		tempHotlineLayerG = [];
	}
	markersLayerG = [];
	invis_marker_iter = 0;
	marker_iter = 0;
	if (plotcords.length < 1000) {
		marker_iter = 25;
		invis_marker_iter = 2;
	} else {
		if (plotcords.length < 5000) {
			marker_iter = 75;
			invis_marker_iter = 5;
		} else {
			marker_iter = 250;
			invis_marker_iter = 10;
		}
	}

	for (j = 0; j < plotcords.length; j += invis_marker_iter) {
		var invisiblemarker = L.marker(plotcords[j], {
			riseOnHover: 'true',
			icon: L.icon({
				iconUrl: 'Icons/blank2.png',
				iconSize: [5, 5],
				iconAnchor: [2.5, 5]
			})
		});
		if (tempdata.length != 0 && caddata.length != 0) {
			invisiblemarker.bindTooltip(
				"<b>Elevation: </b>" + eledata[j].toFixed(2) +
				"<br />" +
				"<b>Heart Rate: </b>" + hrdata[j].toFixed(2) +
				"<br />" +
				"<b>Temperature: </b>" + tempdata[j] + "<br />" +
				"<b>Cadence: </b>" + caddata[j] + "<br />"
			);
		}
		if (tempdata.length == 0 && caddata.length != 0) {
			invisiblemarker.bindTooltip(
				"<b>Elevation: </b>" + eledata[j].toFixed(2) +
				"<br />" +
				"<b>Heart Rate: </b>" + hrdata[j].toFixed(2) +
				"<br />" +
				"<b>Cadence: </b>" + caddata[j] + "<br />"
			);
		}
		if (tempdata.length != 0 && caddata.length == 0) {
			invisiblemarker.bindTooltip(
				"<b>Elevation: </b>" + eledata[j].toFixed(2) +
				"<br />" +
				"<b>Heart Rate: </b>" + hrdata[j].toFixed(2) +
				"<br />" +
				"<b>Temperature: </b>" + tempdata[j] + "<br />"
			);
		}

		markersLayerG.push(invisiblemarker);
		if (j % marker_iter == 0) {
			if (elecords.length != 0) {
				if (eledata[j] < 50) {
					eleicon = 'Icons/hill1.png';
				} else {
					if (eledata[j] < 100) {
						eleicon = 'Icons/hill2.png';
					} else {
						eleicon = 'Icons/hill3.png';
					}
				}
				var elemarker = L.marker(plotcords[j], {
					riseOnHover: 'true',
					icon: L.icon({
						iconUrl: eleicon,
						iconSize: [20, 16.5],
						iconAnchor: [10, 16.5]
					})
				});
				elemarker.bindPopup("<b>Elevation: </b>" + eledata[j]
					.toFixed(2));
				eleHotlineLayerG.push(elemarker);
			}
			if (hrcords.length != 0) {
				if (hrdata[j] < 100) {
					hricon = 'Icons/heart1.png';
				} else {
					if (hrdata[j] < 150) {
						hricon = 'Icons/heart2.png';
					} else {
						hricon = 'Icons/heart3.png';
					}
				}
				var hrmarker = L.marker(plotcords[j], {
					riseOnHover: 'true',
					icon: L.icon({
						iconUrl: hricon,
						iconSize: [20, 19],
						iconAnchor: [10, 19]
					})
				});
				hrmarker.bindPopup("<b>Heart Rate: </b>" + hrdata[j]
					.toFixed(2));
				hrHotlineLayerG.push(hrmarker);
			}
			if (cadcords.length != 0) {
				if (caddata[j] < 50) {
					cadicon = 'Icons/cad1.png';
				} else {
					if (caddata[j] < 100) {
						cadicon = 'Icons/cad2.png';
					} else {
						cadicon = 'Icons/cad3.png';
					}
				}
				var cadmarker = L.marker(plotcords[j], {
					riseOnHover: 'true',
					icon: L.icon({
						iconUrl: cadicon,
						iconSize: [19, 18],
						iconAnchor: [9.5, 18]
					})
				});
				cadmarker.bindPopup("<b>Cadence: </b>" + caddata[j]
					.toFixed(2));
				cadHotlineLayerG.push(cadmarker);
			}
			if (tempcords.length != 0) {
				if (tempdata[j] < 20) {
					tempicon = 'Icons/temp1.png';
				} else {
					if (tempdata[j] < 35) {
						tempicon = 'Icons/temp2.png';
					} else {
						tempicon = 'Icons/temp3.png';
					}
				}
				var tempmarker = L.marker(plotcords[j], {
					riseOnHover: 'true',
					icon: L.icon({
						iconUrl: tempicon,
						iconSize: [10, 20],
						iconAnchor: [5, 20]
					})
				});
				tempmarker.bindPopup("<b>Temperature: </b>" +
					tempdata[j]);
				tempHotlineLayerG.push(tempmarker);
			}
		}

	}
	markersLayerG = L.layerGroup(markersLayerG);
	control.addOverlay(markersLayerG, 'Markers').addTo(mymap);

}

$('#hr_layer_button').hide();
$('#ele_layer_button').hide();
$('#cad_layer_button').hide();
$('#temp_layer_button').hide();

$("#hr_layer_button").click(function() {

	mymap.fitBounds(gpx.getBounds());
	if (mymap.hasLayer(hrHotlineLayerG)) {

		$("#hr_layer_button").attr('class',
			'btn btn-outline-danger');
		mymap.removeLayer(hrHotlineLayerG);
		mymap.addLayer(gpx);
		mymap.addLayer(markersLayerG);
	} else {
		mymap.addLayer(hrHotlineLayerG);
		mymap.addLayer(markersLayerG);
		if (mymap.hasLayer(gpx)) {
			mymap.removeLayer(gpx);
		}
		if (mymap.hasLayer(eleHotlineLayerG)) {
			mymap.removeLayer(eleHotlineLayerG);
		}
		if (mymap.hasLayer(cadHotlineLayerG)) {
			mymap.removeLayer(cadHotlineLayerG);
		}
		if (mymap.hasLayer(tempHotlineLayerG)) {
			mymap.removeLayer(tempHotlineLayerG);
		}

		$("#hr_layer_button").attr('class', 'btn btn-danger');
		$("#ele_layer_button").attr('class',
			'btn btn-outline-warning');
		$("#temp_layer_button").attr('class',
			'btn btn-outline-info');
		$("#cad_layer_button").attr('class',
			'btn btn-outline-success');
	}
});

$("#ele_layer_button").click(function() {

	mymap.fitBounds(gpx.getBounds());
	if (mymap.hasLayer(eleHotlineLayerG)) {

		$("#ele_layer_button").attr('class',
			'btn btn-outline-warning');
		mymap.removeLayer(eleHotlineLayerG);
		mymap.addLayer(gpx);
		mymap.addLayer(markersLayerG);
	} else {
		mymap.addLayer(eleHotlineLayerG);
		mymap.addLayer(markersLayerG);
		if (mymap.hasLayer(gpx)) {
			mymap.removeLayer(gpx);
		}
		if (mymap.hasLayer(hrHotlineLayerG)) {
			mymap.removeLayer(hrHotlineLayerG);
		}
		if (mymap.hasLayer(cadHotlineLayerG)) {
			mymap.removeLayer(cadHotlineLayerG);
		}
		if (mymap.hasLayer(tempHotlineLayerG)) {
			mymap.removeLayer(tempHotlineLayerG);
		}

		$("#hr_layer_button").attr('class',
			'btn btn-outline-danger');
		$("#ele_layer_button").attr('class',
			'btn btn-warning');
		$("#temp_layer_button").attr('class',
			'btn btn-outline-info');
		$("#cad_layer_button").attr('class',
			'btn btn-outline-success');
	}
});

$("#cad_layer_button").click(function() {
	mymap.fitBounds(gpx.getBounds());

	if (mymap.hasLayer(cadHotlineLayerG)) {

		$("#cad_layer_button").attr('class',
			'btn btn-outline-success');
		mymap.removeLayer(cadHotlineLayerG);
		mymap.addLayer(gpx);
		mymap.addLayer(markersLayerG);
	} else {
		mymap.addLayer(cadHotlineLayerG);
		mymap.addLayer(markersLayerG);
		if (mymap.hasLayer(gpx)) {
			mymap.removeLayer(gpx);
		}
		if (mymap.hasLayer(eleHotlineLayerG)) {
			mymap.removeLayer(eleHotlineLayerG);
		}
		if (mymap.hasLayer(hrHotlineLayerG)) {
			mymap.removeLayer(hrHotlineLayerG);
		}
		if (mymap.hasLayer(tempHotlineLayerG)) {
			mymap.removeLayer(tempHotlineLayerG);
		}

		$("#hr_layer_button").attr('class',
			'btn btn-outline-danger');
		$("#ele_layer_button").attr('class',
			'btn btn-outline-warning');
		$("#temp_layer_button").attr('class',
			'btn btn-outline-info');
		$("#cad_layer_button").attr('class',
			'btn btn-success');
	}
});

$("#temp_layer_button").click(function() {
	mymap.fitBounds(gpx.getBounds());

	if (mymap.hasLayer(tempHotlineLayerG)) {

		$("#temp_layer_button").attr('class',
			'btn btn-outline-info');
		mymap.removeLayer(tempHotlineLayerG);
		mymap.addLayer(gpx);
		mymap.addLayer(markersLayerG);
	} else {
		mymap.addLayer(tempHotlineLayerG);
		mymap.addLayer(markersLayerG);
		if (mymap.hasLayer(gpx)) {
			mymap.removeLayer(gpx);
		}
		if (mymap.hasLayer(eleHotlineLayerG)) {
			mymap.removeLayer(eleHotlineLayerG);
		}
		if (mymap.hasLayer(cadHotlineLayerG)) {
			mymap.removeLayer(cadHotlineLayerG);
		}
		if (mymap.hasLayer(hrHotlineLayerG)) {
			mymap.removeLayer(hrHotlineLayerG);
		}

		$("#hr_layer_button").attr('class',
			'btn btn-outline-danger');
		$("#ele_layer_button").attr('class',
			'btn btn-outline-warning');
		$("#temp_layer_button").attr('class', 'btn btn-info');
		$("#cad_layer_button").attr('class',
			'btn btn-outline-success');
	}
});