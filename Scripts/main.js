//var gpx_file = document.getElementById('gpx_file').files[0];
//var url = "A.gpx";
var url;
var gpx;
var file_name_ext, uploaded_file;

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

var eleHotlineLayer, hrHotlineLayer, cadHotlineLayer, tempHotlineLayer;

var mymap = L.map('mapid').setView([51.505, -0.09], 13);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamF3YWRzaGFoaWQiLCJhIjoiY2puZzQ0eno3MDRjbDNrcWlsZjZxNTcxaSJ9.mavbvckNOMnntmxWcKboyQ', {
maxZoom: 18,
attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
id: 'mapbox.light'
}).addTo(mymap);
var control = L.control.layers(null, null).addTo(mymap);


$(document).ready(function(){
  $('#get_file').tooltip('show'); 
  //document.getElementsByClassName("leaflet-control-layers-toggle").id = "MapControl";
  //document.getElementsByClassName("leaflet-control-layers-toggle").title = "Check here for Different Layers and Markers";
  //$('.leaflet-control-layers-toggle').tooltip('show'); 
  //console.log(document.getElementsByClassName("leaflet-control-layers-toggle").title);
  //$('.leaflet-control-layers')
});

$('#get_file').click(function() {
  $('#get_file').tooltip('hide');
});

$('#chart_file').click(function() {
  $('#chart_file').tooltip('hide');
});
$('#All-layers-button').click(function() {
  $('#All-layers-button').tooltip('hide');
  $('.leaflet-control-layers-toggle').tooltip('show'); 
});
$('#All-markers-button').click(function() {
  $('#All-markers-button').tooltip('hide');
  $('.leaflet-control-layers-toggle').tooltip('show'); 
});
$('.leaflet-control-layers-toggle').hover(function() {
  $('.leaflet-control-layers-toggle').tooltip('hide');
});

document.getElementById('get_file').onclick = function() {
  document.getElementById('gpx_file').click();
  //display_gpx(document.getElementById('demo'));
};

document.getElementById('chart_file').onclick = function() {
  display_chart(timecords, eledata, 'Elevation', 'myChart1', 'teal');
  display_chart(timecords, hrdata, 'Heart Rate', 'myChart2', 'SlateBlue');
};

$(document).ready(function(){
  $("#gpx_file").on('change', function(){
    uploaded_file = document.getElementById('gpx_file').value;
    file_name_ext = uploaded_file.split('.').pop().toLowerCase();
    if ( 'gpx' !== file_name_ext ) {
      alert("Incorrect file type, please upload a .gpx file");
      return;
    }
    console.log(file_name_ext);

    remove_layer(gpx);
    remove_layer(markers_layer);
    remove_layer(hrHotlineLayer);
    remove_layer(eleHotlineLayer);
    remove_layer(tempHotlineLayer);
    remove_layer(cadHotlineLayer);
    display_gpx(document.getElementById('demo'));
    //$.when( display_gpx(document.getElementById('demo')) ).done( draw_hotline_all() );
  });
});


function display_gpx(elt) {

if (!elt) return;


url = document.getElementById('gpx_file').files[0].name;
//console.log(url);

//loadXMLDoc();

function _t(t) { return elt.getElementsByTagName(t)[0]; }
function _c(c) { return elt.getElementsByClassName(c)[0]; }
function _i(i) { return elt.getElementById(i); }

//var mymap = L.map('mapid').setView([51.505, -0.09], 13);


var new_gpx = new L.GPX(url, {
  async: true,
  polyline_options: {
    color: 'MidnightBlue',
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

  //new_gpx.bindTooltip('bla')


  /*
   * Note: the code below relies on the fact that the demo GPX file is
   * an actual GPS track with timing and heartrate information.
   */
  //_c('title').textContent = gpx.get_name();
  //_c('start').textContent = gpx.get_start_time().toDateString() + ', ' + gpx.get_start_time().toLocaleTimeString();
  _c('distance').textContent = (gpx.get_distance()/1000).toFixed(2);
  _c('duration').textContent = gpx.get_duration_string(gpx.get_moving_time());
  //_c('pace').textContent     = gpx.get_duration_string(gpx.get_moving_pace(), true);
  _c('speed').textContent    = gpx.get_moving_speed().toFixed(2);
  _c('avghr').textContent    = gpx.get_average_hr();
  _c('avgcad').textContent   = gpx.get_average_cadence();
  //_c('avgtemp').textContent  = gpx.get_average_temp();
  //_c('elevation-gain').textContent = gpx.get_elevation_gain().toFixed(0);
  //_c('elevation-loss').textContent = gpx.get_elevation_loss().toFixed(0);
  _c('elevation-net').textContent  = (gpx.get_elevation_gain() - gpx.get_elevation_loss().toFixed(0)).toFixed(2);
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

document.getElementById("layers-buttons-group").style.display = "block";
$('#chart_file').tooltip('show');
$('#All-layers-button').tooltip('show'); 
$('#All-markers-button').tooltip('show'); 
$('#file_success_alert').show();
document.getElementById("myChart1").style.display = "none";
document.getElementById("myChart2").style.display = "none";

}

function draw_hotline_all() {
  remove_layer(hrHotlineLayer);
  remove_layer(eleHotlineLayer);
  remove_layer(tempHotlineLayer);
  remove_layer(cadHotlineLayer);
  if (hrcords.length != 0) {
    draw_hotline_hr();
  }
  if (elecords.length != 0) {
    draw_hotline_ele();
  }
  if (tempcords.length != 0) {
    draw_hotline_temp();
  }
  if (cadcords.length != 0) {
    draw_hotline_cad();
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
        weight: 3,
        outlineColor: '#000000',
        outlineWidth: 1
})
//control.removeLayer(eleHotlineLayer).addTo(mymap);
control.addBaseLayer(eleHotlineLayer, 'Elevation Line').addTo(mymap);
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
        weight: 3,
        outlineColor: '#000000',
        outlineWidth: 1
})
//control.removeLayer(hrHotlineLayer).addTo(mymap);
control.addBaseLayer(hrHotlineLayer, 'HeartRate Line').addTo(mymap);
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
        weight: 3,
        outlineColor: '#000000',
        outlineWidth: 1
})
//control.removeLayer(tempHotlineLayer).addTo(mymap);
control.addBaseLayer(tempHotlineLayer, 'Temperature Line').addTo(mymap);
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
        weight: 3,
        outlineColor: '#000000',
        outlineWidth: 1
})
//control.removeLayer(cadHotlineLayer).addTo(mymap);
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
        timecords = [];
        

        plotpoints = xmlDoc.getElementsByTagName("trkpt");
        timepoins = xmlDoc.getElementsByTagName("time");
        //elelist = xmlDoc.getElementsByTagName("ele");
        for (i = 0; i < plotpoints.length; i++) {
            plotcords.push([Number(plotpoints[i].getAttribute('lat')), Number(plotpoints[i].getAttribute('lon'))]);
            elecords.push([Number(plotpoints[i].getAttribute('lat')), Number(plotpoints[i].getAttribute('lon')), eledata[i]]);
            hrcords.push([Number(plotpoints[i].getAttribute('lat')), Number(plotpoints[i].getAttribute('lon')), hrdata[i]]);
            if (tempdata[i] != null) {
              tempcords.push([Number(plotpoints[i].getAttribute('lat')), Number(plotpoints[i].getAttribute('lon')), tempdata[i]]);
            }
            if (caddata[i] != null) {
              cadcords.push([Number(plotpoints[i].getAttribute('lat')), Number(plotpoints[i].getAttribute('lon')), caddata[i]]);
            }
            timecords.push((timepoins[i].childNodes[0].nodeValue).substring(11,19))
            
        }

        

        console.log(plotcords);
        console.log(timecords);
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
  remove_layer(markers_layer);
markers_layer = L.layerGroup([]);

for (b = 0; b < plotcords.length; b += 10) {
  var firstmarker = L.marker(plotcords[b], { riseOnHover : 'true', 
  icon : L.icon({ iconUrl : 'Icons/blank2.png', iconSize : [5,5], iconAnchor : [2.5,5]})
  }).addTo(mymap);

  firstmarker.bindTooltip(
  "<b>Elevation: </b>" + eledata[b].toFixed(2) + "<br />" +
  "<b>Heart Rate: </b>" + hrdata[b].toFixed(2) + "<br />" +
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


function display_chart(inlabels, indata, inchartlabel, inelement, incolor) {
  console.log(indata);
  console.log(inlabels);
  document.getElementById(inelement).style.display = "block";
  document.getElementById(inelement).innerHTML = "";
  var ctx = document.getElementById(inelement).getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
        //labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        labels: inlabels,
        datasets: [{
            //label: '# of Votes',
            label: inchartlabel,
            data: indata,
            fill: false,
            borderColor: incolor,
            backgroundColor: incolor,
        }]
    },
    options: {
        responsive: true,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});
}

//$.when(display_gpx(document.getElementById('demo'))).then(draw_hotline_all());
//display_gpx(document.getElementById('demo'));
//draw_hotline_all();
//display_gpx(document.getElementById('demo')).pipe(draw_hotline_all());