/*
 (c) 2017, iosphere GmbH
 Leaflet.hotline, a Leaflet plugin for drawing gradients along polylines.
 https://github.com/iosphere/Leaflet.hotline/
*/

(function (root, plugin) {
	/**
	 * UMD wrapper.
	 * When used directly in the Browser it expects Leaflet to be globally
	 * available as `L`. The plugin then adds itself to Leaflet.
	 * When used as a CommonJS module (e.g. with browserify) only the plugin
	 * factory gets exported, so one hast to call the factory manually and pass
	 * Leaflet as the only parameter.
	 * @see {@link https://github.com/umdjs/umd}
	 */
	if (typeof define === 'function' && define.amd) {
		define(['leaflet'], plugin);
	} else if (typeof exports === 'object') {
		module.exports = plugin;
	} else {
		plugin(root.L);
	}
}(this, function (L) {
	// Plugin is already added to Leaflet
	if (L.Hotline) {
		return L;
	}

	/**
	 * Core renderer.
	 * @constructor
	 * @param {HTMLElement | string} canvas - &lt;canvas> element or its id
	 * to initialize the instance on.
	 */
	var Hotline = function (canvas) {
		if (!(this instanceof Hotline)) { return new Hotline(canvas); }

		var defaultPalette = {
			0.0: 'green',
			0.5: 'yellow',
			1.0: 'red'
		};

		this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

		this._ctx = canvas.getContext('2d');
		this._width = canvas.width;
		this._height = canvas.height;

		this._weight = 5;
		this._outlineWidth = 1;
		this._outlineColor = 'black';

		this._min = 0;
		this._max = 1;

		this._data = [];

		this.palette(defaultPalette);
	};

	Hotline.prototype = {
		/**
		 * Sets the width of the canvas. Used when clearing the canvas.
		 * @param {number} width - Width of the canvas.
		 */
		width: function (width) {
			this._width = width;
			return this;
		},

		/**
		 * Sets the height of the canvas. Used when clearing the canvas.
		 * @param {number} height - Height of the canvas.
		 */
		height: function (height) {
			this._height = height;
			return this;
		},

		/**
		 * Sets the weight of the path.
		 * @param {number} weight - Weight of the path in px.
		 */
		weight: function (weight) {
			this._weight = weight;
			return this;
		},

		/**
		 * Sets the width of the outline around the path.
		 * @param {number} outlineWidth - Width of the outline in px.
		 */
		outlineWidth: function (outlineWidth) {
			this._outlineWidth = outlineWidth;
			return this;
		},

		/**
		 * Sets the color of the outline around the path.
		 * @param {string} outlineColor - A CSS color value.
		 */
		outlineColor: function (outlineColor) {
			this._outlineColor = outlineColor;
			return this;
		},

		/**
		 * Sets the palette gradient.
		 * @param {Object.<number, string>} palette  - Gradient definition.
		 * e.g. { 0.0: 'white', 1.0: 'black' }
		 */
		palette: function (palette) {
			var canvas = document.createElement('canvas'),
					ctx = canvas.getContext('2d'),
					gradient = ctx.createLinearGradient(0, 0, 0, 256);

			canvas.width = 1;
			canvas.height = 256;

			for (var i in palette) {
				gradient.addColorStop(i, palette[i]);
			}

			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, 1, 256);

			this._palette = ctx.getImageData(0, 0, 1, 256).data;

			return this;
		},

		/**
		 * Sets the value used at the start of the palette gradient.
		 * @param {number} min
		 */
		min: function (min) {
			this._min = min;
			return this;
		},

		/**
		 * Sets the value used at the end of the palette gradient.
		 * @param {number} max
		 */
		max: function (max) {
			this._max = max;
			return this;
		},

		/**
		 * A path to rander as a hotline.
		 * @typedef Array.<{x:number, y:number, z:number}> Path - Array of x, y and z coordinates.
		 */

		/**
		 * Sets the data that gets drawn on the canvas.
		 * @param {(Path|Path[])} data - A single path or an array of paths.
		 */
		data: function (data) {
			this._data = data;
			return this;
		},

		/**
		 * Adds a path to the list of paths.
		 * @param {Path} path
		 */
		add: function (path) {
			this._data.push(path);
			return this;
		},

		/**
		 * Draws the currently set paths.
		 */
		draw: function () {
			var ctx = this._ctx;

			ctx.globalCompositeOperation = 'source-over';
			ctx.lineCap = 'round';

			this._drawOutline(ctx);
			this._drawHotline(ctx);

			return this;
		},

		/**
		 * Gets the RGB values of a given z value of the current palette.
		 * @param {number} value - Value to get the color for, should be between min and max.
		 * @returns {Array.<number>} The RGB values as an array [r, g, b]
		 */
		getRGBForValue: function (value) {
			var valueRelative = Math.min(Math.max((value - this._min) / (this._max - this._min), 0), 0.999);
			var paletteIndex = Math.floor(valueRelative * 256) * 4;

			return [
				this._palette[paletteIndex],
				this._palette[paletteIndex + 1],
				this._palette[paletteIndex + 2]
			];
		},

		/**
		 * Draws the outline of the graphs.
		 * @private
		 */
		_drawOutline: function (ctx) {
			var i, j, dataLength, path, pathLength, pointStart, pointEnd;

			if (this._outlineWidth) {
				for (i = 0, dataLength = this._data.length; i < dataLength; i++) {
					path = this._data[i];
					ctx.lineWidth = this._weight + 2 * this._outlineWidth;

					for (j = 1, pathLength = path.length; j < pathLength; j++) {
						pointStart = path[j - 1];
						pointEnd = path[j];

						ctx.strokeStyle = this._outlineColor;
						ctx.beginPath();
						ctx.moveTo(pointStart.x, pointStart.y);
						ctx.lineTo(pointEnd.x, pointEnd.y);
						ctx.stroke();
					}
				}
			}
		},

		/**
		 * Draws the color encoded hotline of the graphs.
		 * @private
		 */
		_drawHotline: function (ctx) {
			var i, j, dataLength, path, pathLength, pointStart, pointEnd,
					gradient, gradientStartRGB, gradientEndRGB;

			ctx.lineWidth = this._weight;

			for (i = 0, dataLength = this._data.length; i < dataLength; i++) {
				path = this._data[i];

				for (j = 1, pathLength = path.length; j < pathLength; j++) {
					pointStart = path[j - 1];
					pointEnd = path[j];

					// Create a gradient for each segment, pick start end end colors from palette gradient
					gradient = ctx.createLinearGradient(pointStart.x, pointStart.y, pointEnd.x, pointEnd.y);
					gradientStartRGB = this.getRGBForValue(pointStart.z);
					gradientEndRGB = this.getRGBForValue(pointEnd.z);
					gradient.addColorStop(0, 'rgb(' + gradientStartRGB.join(',') + ')');
					gradient.addColorStop(1, 'rgb(' + gradientEndRGB.join(',') + ')');

					ctx.strokeStyle = gradient;
					ctx.beginPath();
					ctx.moveTo(pointStart.x, pointStart.y);
					ctx.lineTo(pointEnd.x, pointEnd.y);
					ctx.stroke();
				}
			}
		}
	};


	var Renderer = L.Canvas.extend({
		_initContainer: function () {
			L.Canvas.prototype._initContainer.call(this);
			this._hotline = new Hotline(this._container);
		},

		_update: function () {
			L.Canvas.prototype._update.call(this);
			this._hotline.width(this._container.width);
			this._hotline.height(this._container.height);
		},

		_updatePoly: function (layer) {
			if (!this._drawing) { return; }

			var parts = layer._parts;

			if (!parts.length) { return; }

			this._updateOptions(layer);

			this._hotline
				.data(parts)
				.draw();
		},

		_updateOptions: function (layer) {
			if (layer.options.min != null) {
				this._hotline.min(layer.options.min);
			}
			if (layer.options.max != null) {
				this._hotline.max(layer.options.max);
			}
			if (layer.options.weight != null) {
				this._hotline.weight(layer.options.weight);
			}
			if (layer.options.outlineWidth != null) {
				this._hotline.outlineWidth(layer.options.outlineWidth);
			}
			if (layer.options.outlineColor != null) {
				this._hotline.outlineColor(layer.options.outlineColor);
			}
			if (layer.options.palette) {
				this._hotline.palette(layer.options.palette);
			}
		}
	});

	var renderer = function (options) {
		return L.Browser.canvas ? new Renderer(options) : null;
	};


	var Util = {
		/**
		 * This is just a copy of the original Leaflet version that support a third z coordinate.
		 * @see {@link http://leafletjs.com/reference.html#lineutil-clipsegment|Leaflet}
		 */
		clipSegment: function (a, b, bounds, useLastCode, round) {
			var codeA = useLastCode ? this._lastCode : L.LineUtil._getBitCode(a, bounds),
					codeB = L.LineUtil._getBitCode(b, bounds),
					codeOut, p, newCode;

			// save 2nd code to avoid calculating it on the next segment
			this._lastCode = codeB;

			while (true) {
				// if a,b is inside the clip window (trivial accept)
				if (!(codeA | codeB)) {
					return [a, b];
				// if a,b is outside the clip window (trivial reject)
				} else if (codeA & codeB) {
					return false;
				// other cases
				} else {
					codeOut = codeA || codeB;
					p = L.LineUtil._getEdgeIntersection(a, b, codeOut, bounds, round);
					newCode = L.LineUtil._getBitCode(p, bounds);

					if (codeOut === codeA) {
						p.z = a.z;
						a = p;
						codeA = newCode;
					} else {
						p.z = b.z;
						b = p;
						codeB = newCode;
					}
				}
			}
		}
	};


	L.Hotline = L.Polyline.extend({
		statics: {
			Renderer: Renderer,
			renderer: renderer
		},

		options: {
			renderer: renderer(),
			min: 0,
			max: 1,
			palette: {
				0.0: 'green',
				0.5: 'yellow',
				1.0: 'red'
			},
			weight: 5,
			outlineColor: 'black',
			outlineWidth: 1
		},

		getRGBForValue: function (value) {
			return this._renderer._hotline.getRGBForValue(value);
		},

		/**
		 * Just like the Leaflet version, but with support for a z coordinate.
		 */
		_projectLatlngs: function (latlngs, result, projectedBounds) {
			var flat = latlngs[0] instanceof L.LatLng,
					len = latlngs.length,
					i, ring;

			if (flat) {
				ring = [];
				for (i = 0; i < len; i++) {
					ring[i] = this._map.latLngToLayerPoint(latlngs[i]);
					// Add the altitude of the latLng as the z coordinate to the point
					ring[i].z = latlngs[i].alt;
					projectedBounds.extend(ring[i]);
				}
				result.push(ring);
			} else {
				for (i = 0; i < len; i++) {
					this._projectLatlngs(latlngs[i], result, projectedBounds);
				}
			}
		},

		/**
		 * Just like the Leaflet version, but uses `Util.clipSegment()`.
		 */
		_clipPoints: function () {
			if (this.options.noClip) {
				this._parts = this._rings;
				return;
			}

			this._parts = [];

			var parts = this._parts,
					bounds = this._renderer._bounds,
					i, j, k, len, len2, segment, points;

			for (i = 0, k = 0, len = this._rings.length; i < len; i++) {
				points = this._rings[i];

				for (j = 0, len2 = points.length; j < len2 - 1; j++) {
					segment = Util.clipSegment(points[j], points[j + 1], bounds, j, true);

					if (!segment) { continue; }

					parts[k] = parts[k] || [];
					parts[k].push(segment[0]);

					// if segment goes out of screen, or it's the last one, it's the end of the line part
					if ((segment[1] !== points[j + 1]) || (j === len2 - 2)) {
						parts[k].push(segment[1]);
						k++;
					}
				}
			}
		},

		_clickTolerance: function () {
			return this.options.weight / 2 + this.options.outlineWidth + (L.Browser.touch ? 10 : 0);
		}
	});

	L.hotline = function (latlngs, options) {
		return new L.Hotline(latlngs, options);
	};


	return L;
}));
;var url;
var gpx;
var file_name_ext, uploaded_file;
var avgtemp, avgcad;

var plotcords;
var elecords;
var hrcords;
var tempcords;
var cadcords;
var timecords;

var hrdata;
var eledata;
var tempdata;
var caddata;

var ele_min;
var ele_max;

var marker_list;
var markers_layer;
var markersLayerG;
var invis_marker_iter, marker_iter;

var eleHotlineLayer, hrHotlineLayer, cadHotlineLayer, tempHotlineLayer;
var eleHotlineLayerG, hrHotlineLayerG, cadHotlineLayerG, tempHotlineLayerG;
var eleHotlineMarkers, hrHotlineMarkers, cadHotlineMarkers, tempHotlineMarkers;

var eleicon, hricon, cadicon, tempicon;

var chart_left, chart_right;

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

document.getElementById('get_file').onclick = function() {
	document.getElementById('gpx_file').click();
};

document.getElementById('chart_file').onclick = function() {
	display_chart(timecords, eledata, 'Elevation', 'myChart1',
		'teal');
	display_chart(timecords, hrdata, 'Heart Rate', 'myChart2',
		'red');
};

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