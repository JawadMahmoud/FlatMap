var url = "A.gpx";
var gpx;

var plotcords;
var elecords;
var hrcords;
var tempcords;
var cadcords;

var hrdata;
var eledata;
var tempdata;
var caddata;

var ele_min;
var ele_max;

var marker_list;

var mymap = L.map('mapid').setView([51.505, -0.09], 13);
var control = L.control.layers(null, null).addTo(mymap);


function display_gpx(elt) {
if (!elt) return;

//loadXMLDoc();

function _t(t) { return elt.getElementsByTagName(t)[0]; }
function _c(c) { return elt.getElementsByClassName(c)[0]; }

//var mymap = L.map('mapid').setView([51.505, -0.09], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamF3YWRzaGFoaWQiLCJhIjoiY2puZzQ0eno3MDRjbDNrcWlsZjZxNTcxaSJ9.mavbvckNOMnntmxWcKboyQ', {
maxZoom: 18,
attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
id: 'mapbox.light'
}).addTo(mymap);


new L.GPX(url, {
  async: true,
  polyline_options: {
    color: 'purple',
  },
  marker_options: {
    startIconUrl: 'http://github.com/mpetazzoni/leaflet-gpx/raw/master/pin-icon-start.png',
    endIconUrl:   'http://github.com/mpetazzoni/leaflet-gpx/raw/master/pin-icon-end.png',
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
  _t('h3').textContent = gpx.get_name();
  _c('start').textContent = gpx.get_start_time().toDateString() + ', '
    + gpx.get_start_time().toLocaleTimeString();
  _c('distance').textContent = (gpx.get_distance()/1000).toFixed(2);
  _c('duration').textContent = gpx.get_duration_string(gpx.get_moving_time());
  _c('pace').textContent     = gpx.get_duration_string(gpx.get_moving_pace(), true);
  _c('speed').textContent    = gpx.get_moving_speed().toFixed(2);
  _c('avghr').textContent    = gpx.get_average_hr();
  _c('avgcad').textContent   = gpx.get_average_cadence();
  _c('avgtemp').textContent  = gpx.get_average_temp();
  _c('elevation-gain').textContent = gpx.get_elevation_gain().toFixed(0);
  _c('elevation-loss').textContent = gpx.get_elevation_loss().toFixed(0);
  _c('elevation-net').textContent  = gpx.get_elevation_gain()
    - gpx.get_elevation_loss().toFixed(0);
    //console.log("Heartrate Data:")
    //console.log(gpx.get_heartrate_data());
    //console.log("Elevation Data:")
    //console.log(gpx.get_elevation_data());

    //loadXMLDoc();

    //console.log(gpx.get_elevation_max());
    //console.log(gpx.get_elevation_min());

    hrdata = getCol(gpx.get_heartrate_data(), 1);
    eledata = getCol(gpx.get_elevation_data(), 1);
    tempdata = getCol(gpx.get_temp_data(), 1);
    caddata = getCol(gpx.get_cadence_data(), 1);

    ele_min = gpx.get_elevation_min();
    ele_max = gpx.get_elevation_max();
    //console.log(eledata);

  loadXMLDoc();

}).addTo(mymap);

}

function draw_hotline_all() {
draw_hotline_ele();
draw_hotline_hr();
draw_hotline_temp();
draw_hotline_cad();
}

function draw_hotline_ele() {
var eleHotlineLayer = L.hotline(elecords, {
        min: ele_min,
        max: ele_max,
        palette: {
            0.0: '#41ead4',
            0.5: '#fbff12',
            1.0: '#ff206e'
        },
        weight: 3,
        outlineColor: '#000000',
        outlineWidth: 1
})
control.addBaseLayer(eleHotlineLayer, 'Elevation Line').addTo(mymap);
}

function draw_hotline_hr() {
var hrHotlineLayer = L.hotline(hrcords, {
        min: 50,
        max: 200,
        palette: {
            0.0: '#41ead4',
            0.5: '#fbff12',
            1.0: '#ff206e'
        },
        weight: 3,
        outlineColor: '#000000',
        outlineWidth: 1
})
control.addBaseLayer(hrHotlineLayer, 'HeartRate Line').addTo(mymap);
}

function draw_hotline_temp() {
var tempHotlineLayer = L.hotline(tempcords, {
        min: 20,
        max: 40,
        palette: {
            0.0: '#41ead4',
            0.5: '#fbff12',
            1.0: '#ff206e'
        },
        weight: 3,
        outlineColor: '#000000',
        outlineWidth: 1
})
control.addBaseLayer(tempHotlineLayer, 'Temperature Line').addTo(mymap);
}

function draw_hotline_cad() {
var cadHotlineLayer = L.hotline(cadcords, {
        min: 0,
        max: 100,
        palette: {
            0.0: '#41ead4',
            0.5: '#fbff12',
            1.0: '#ff206e'
        },
        weight: 3,
        outlineColor: '#000000',
        outlineWidth: 1
})
control.addBaseLayer(cadHotlineLayer, 'Cadence Line').addTo(mymap);
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

        plotpoints = xmlDoc.getElementsByTagName("trkpt");
        //elelist = xmlDoc.getElementsByTagName("ele");
        for (i = 0; i < plotpoints.length; i++) {
            plotcords.push([Number(plotpoints[i].getAttribute('lat')), Number(plotpoints[i].getAttribute('lon'))]);
            elecords.push([Number(plotpoints[i].getAttribute('lat')), Number(plotpoints[i].getAttribute('lon')), eledata[i]]);
            hrcords.push([Number(plotpoints[i].getAttribute('lat')), Number(plotpoints[i].getAttribute('lon')), hrdata[i]]);
            if (tempdata[i] != null) {
              tempcords.push([Number(plotpoints[i].getAttribute('lat')), Number(plotpoints[i].getAttribute('lon')), tempdata[i]]);
            }
            cadcords.push([Number(plotpoints[i].getAttribute('lat')), Number(plotpoints[i].getAttribute('lon')), caddata[i]]);
        }
        console.log(plotcords);
        console.log(elecords);
        console.log(hrcords);
        console.log(tempcords);
        console.log(cadcords);

        //console.log(ele_min);
        //console.log(ele_max);

      }

function printcords(cords) {
console.log("#2");
console.log(cords);
}

function getCol(matrix, col){
   var column = [];
   for(var i=0; i<matrix.length; i++){
      column.push(matrix[i][col]);
   }
   return column;
}

function getColor(x) {
return x < 50     ?    '#bd0026':
     x < 100     ?   '#f03b20':
     x < 200     ?   '#fd8d3c':
     x < 300     ?   '#fecc5c':
                      '#ffffb2' ;
}


function draw_markers() {
var markers_layer = L.layerGroup([]);

for (b = 0; b < plotcords.length; b += 25) {
  var firstmarker = L.marker(plotcords[b], { riseOnHover : 'true' }).addTo(mymap);
  firstmarker.bindPopup("<b>Elevation: </b>" + eledata[b].toFixed(2) + "<br />" +
  "<b>Heart Rate: </b>" + hrdata[b].toFixed(2) + "<br />" +
  "<b>Temperature: </b>" + tempdata[b] + "<br />" +
  "<b>Cadence: </b>" + caddata[b] + "<br />");

  markers_layer.addLayer(firstmarker);
}

control.addOverlay(markers_layer, 'Markers').addTo(mymap);
}


//$.when(display_gpx(document.getElementById('demo'))).then(draw_hotline_all());
display_gpx(document.getElementById('demo'));
//draw_hotline_all();
//display_gpx(document.getElementById('demo')).pipe(draw_hotline_all());