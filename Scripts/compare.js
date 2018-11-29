//var gpx_file = document.getElementById('gpx_file').files[0];
//var url = "A.gpx";
var url, url2;
var gpx, gpx2;
var file_name_ext, uploaded_file;
var file_name_ext2, uploaded_file2;

var plotcords, plotcords2;
var elecords, elecords2;
var hrcords, hrcords2;
var tempcords, tempcords2;
var cadcords, cadcords2;

var hrdata, hrdata2;
var eledata, eledata2;
var tempdata, tempdata2;
var caddata, caddata2;

var ele_min, ele_min2;
var ele_max, ele_max2;

var marker_list, marker_list2;
var markers_layer, markers_layer2;

var eleHotlineLayer, hrHotlineLayer, cadHotlineLayer, tempHotlineLayer;
var eleHotlineLayer2, hrHotlineLayer2, cadHotlineLayer2, tempHotlineLayer2;

var mymap = L.map('mapid').setView([51.505, -0.09], 13);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamF3YWRzaGFoaWQiLCJhIjoiY2pvcm9nYWo0MGZ3ajNwcGhkdmZnejZvaSJ9.h72OiW0emxnrQTbNxEuj2Q', {
maxZoom: 18,
attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
id: 'mapbox.light'
}).addTo(mymap);
var control = L.control.layers(null, null).addTo(mymap);

var mymap2 = L.map('mapid2').setView([51.505, -0.09], 13);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamF3YWRzaGFoaWQiLCJhIjoiY2puZzRhajc0MHhpNTNwbm05ZHFiMTN1OCJ9.tOzY7JlGfy116CA6tlnaNw', {
maxZoom: 18,
attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
id: 'mapbox.light'
}).addTo(mymap2);
var control2 = L.control.layers(null, null).addTo(mymap2);



document.getElementById('get_file').onclick = function() {
  document.getElementById('gpx_file').click();
  //display_gpx(document.getElementById('demo'));
};

document.getElementById('get_file2').onclick = function() {
    document.getElementById('gpx_file2').click();
    //display_gpx(document.getElementById('demo'));
};

document.getElementById('compare_button').onclick = function() {
    compare_gpx(document.getElementById('compare'), gpx, gpx2)
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

    remove_layer(gpx, mymap, control);
    //remove_layer(markers_layer);
    display_gpx(document.getElementById('demo'));
    //$.when( display_gpx(document.getElementById('demo')) ).done( draw_hotline_all() );
  });
  $("#gpx_file2").on('change', function(){
    uploaded_file2 = document.getElementById('gpx_file2').value;
    file_name_ext2 = uploaded_file2.split('.').pop().toLowerCase();
    if ( 'gpx' !== file_name_ext2 ) {
      alert("Incorrect file type, please upload a .gpx file");
      return;
    }
    console.log(file_name_ext2);

    remove_layer(gpx2, mymap2, control2);
    //remove_layer(markers_layer);
    display_gpx2(document.getElementById('demo2'));
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

//var mymap = L.map('mapid').setView([51.505, -0.09], 13);


var new_gpx = new L.GPX(url, {
  async: true,
  polyline_options: {
    color: 'BlueViolet',
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


function display_gpx2(elt) {

    if (!elt) return;
    
    
    url2 = document.getElementById('gpx_file2').files[0].name;
    //console.log(url);
    
    //loadXMLDoc();
    
    function _t(t) { return elt.getElementsByTagName(t)[0]; }
    function _c(c) { return elt.getElementsByClassName(c)[0]; }
    
    //var mymap = L.map('mapid').setView([51.505, -0.09], 13);
    
    
    var new_gpx = new L.GPX(url2, {
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
      gpx2 = e.target;
      mymap2.fitBounds(gpx2.getBounds());
      control2.addBaseLayer(gpx2, 'Simple line');
    
      //new_gpx.bindTooltip('bla')
    
    
      /*
       * Note: the code below relies on the fact that the demo GPX file is
       * an actual GPS track with timing and heartrate information.
       */
      _c('title2').textContent = gpx2.get_name();
      console.log(gpx2.get_moving_time());
      _c('start2').textContent = gpx2.get_start_time().toDateString() + ', '
        + gpx2.get_start_time().toLocaleTimeString();
      _c('distance2').textContent = (gpx2.get_distance()/1000).toFixed(2);
      _c('duration2').textContent = gpx2.get_duration_string(gpx2.get_moving_time());
      _c('pace2').textContent     = gpx2.get_duration_string(gpx2.get_moving_pace(), true);
      _c('speed2').textContent    = gpx2.get_moving_speed().toFixed(2);
      _c('avghr2').textContent    = gpx2.get_average_hr();
      _c('avgcad2').textContent   = gpx2.get_average_cadence();
      _c('avgtemp2').textContent  = gpx2.get_average_temp();
      _c('elevation-gain2').textContent = gpx2.get_elevation_gain().toFixed(0);
      _c('elevation-loss2').textContent = gpx2.get_elevation_loss().toFixed(0);
      _c('elevation-net2').textContent  = gpx2.get_elevation_gain().toFixed(2)
        - gpx2.get_elevation_loss().toFixed(2);
        //console.log("Heartrate Data:")
        //console.log(gpx.get_heartrate_data());
        //console.log("Elevation Data:")
        //console.log(gpx.get_elevation_data());
    
        //loadXMLDoc();
    
        //console.log(gpx.get_elevation_max());
        //console.log(gpx.get_elevation_min());
    
        hrdata2 = getCol(gpx.get_heartrate_data(), 1);
        eledata2 = getCol(gpx.get_elevation_data(), 1);
        tempdata2 = getCol(gpx.get_temp_data(), 1);
        caddata2 = getCol(gpx.get_cadence_data(), 1);
    
        ele_min2 = gpx.get_elevation_min();
        ele_max2 = gpx.get_elevation_max();
        //console.log(eledata);
    
      loadXMLDoc2();
    
    }).addTo(mymap2);
    
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

        plotpoints = xmlDoc.getElementsByTagName("trkpt");
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
            
        }
        console.log(plotcords);
        console.log(elecords);
        console.log(hrcords);
        console.log(tempcords);
        console.log(cadcords);

        //console.log(ele_min);
        //console.log(ele_max);

}


function loadXMLDoc2() {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            myFunction(this);
        }
        };
        xmlhttp.open("GET", url2, true);
        xmlhttp.send();
}

function myFunction2(xml) {
        var xmlDoc;
        xmlDoc = xml.responseXML;

        plotcords2 = [];
        elecords2 = [];
        hrcords2 = [];
        tempcords2 = [];
        cadcords2 = [];

        plotpoints = xmlDoc.getElementsByTagName("trkpt");
        //elelist = xmlDoc.getElementsByTagName("ele");
        for (i = 0; i < plotpoints.length; i++) {
            plotcords2.push([Number(plotpoints[i].getAttribute('lat')), Number(plotpoints[i].getAttribute('lon'))]);
            elecords2.push([Number(plotpoints[i].getAttribute('lat')), Number(plotpoints[i].getAttribute('lon')), eledata2[i]]);
            hrcords2.push([Number(plotpoints[i].getAttribute('lat')), Number(plotpoints[i].getAttribute('lon')), hrdata2[i]]);
            if (tempdata2[i] != null) {
              tempcords2.push([Number(plotpoints[i].getAttribute('lat')), Number(plotpoints[i].getAttribute('lon')), tempdata2[i]]);
            }
            if (caddata2[i] != null) {
              cadcords2.push([Number(plotpoints[i].getAttribute('lat')), Number(plotpoints[i].getAttribute('lon')), caddata2[i]]);
            }
            
        }
        console.log(plotcords2);
        console.log(elecords2);
        console.log(hrcords2);
        console.log(tempcords2);
        console.log(cadcords2);

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

function remove_layer(layer, map, control) {
  if (layer != null) {
    map.removeLayer(layer);
    control.removeLayer(layer);
  }
  
}

function compare_gpx(elt, gpx, gpx2) {

  if (!gpx || !gpx2) {
    alert('You need to upload two files for comparison, please make sure you have selected two files');
    return;
  }
  
    function _t(t) { return elt.getElementsByTagName(t)[0]; }
    function _c(c) { return elt.getElementsByClassName(c)[0]; }

    var cdistance1, cduration1, cspeed1, cheartrate1, ccadence1, ctemperature1, celevation1;
    var cdistance2, cduration2, cspeed2, cheartrate2, ccadence2, ctemperature2, celevation2;
    var cdistancetotal, cdurationtotal, cspeedtotal, cheartratetotal, ccadencetotal, ctemperaturetotal, celevationtotal;

    

    cdistancetotal = Number((gpx.get_distance()/1000).toFixed(2)) + Number((gpx2.get_distance()/1000).toFixed(2));
    cdurationtotal = Number(gpx.get_moving_time()) + Number(gpx2.get_moving_time());
    cspeedtotal = Number(gpx.get_moving_speed().toFixed(2)) + Number(gpx2.get_moving_speed().toFixed(2));
    cheartratetotal = gpx.get_average_hr() + gpx2.get_average_hr();
    ccadencetotal = gpx.get_average_cadence() + gpx2.get_average_cadence();
    ctemperaturetotal = gpx.get_average_temp() + gpx2.get_average_temp();
    celevationtotal = (gpx.get_elevation_gain().toFixed(2) - gpx.get_elevation_loss().toFixed(2)) + (gpx2.get_elevation_gain().toFixed(2) - gpx2.get_elevation_loss().toFixed(2));

    cdistance1 = ((gpx.get_distance()/1000).toFixed(2) * 100 / cdistancetotal).toFixed(2);
    cduration1 = (gpx.get_moving_time() * 100 / cdurationtotal).toFixed(2);
    cspeed1 = (gpx.get_moving_speed().toFixed(2) * 100 / cspeedtotal).toFixed(2);
    cheartrate1 = (gpx.get_average_hr() * 100 / cheartratetotal).toFixed(2);
    ccadence1 = (gpx.get_average_cadence() * 100 / ccadencetotal).toFixed(2);
    ctemperature1 = (gpx.get_average_temp() * 100 / ctemperaturetotal).toFixed(2);
    celevation1 = ((gpx.get_elevation_gain().toFixed(2) - gpx.get_elevation_loss().toFixed(2)) * 100 / celevationtotal).toFixed(2);

    cdistance2 = ((gpx2.get_distance()/1000).toFixed(2) * 100 / cdistancetotal).toFixed(2);
    cduration2 = (gpx2.get_moving_time() * 100 / cdurationtotal).toFixed(2);
    cspeed2 = (gpx2.get_moving_speed().toFixed(2) * 100 / cspeedtotal).toFixed(2);
    cheartrate2 = (gpx2.get_average_hr() * 100 / cheartratetotal).toFixed(2);
    ccadence2 = (gpx2.get_average_cadence() * 100 / ccadencetotal).toFixed(2);
    ctemperature2 = (gpx2.get_average_temp() * 100 / ctemperaturetotal).toFixed(2);
    celevation2 = ((gpx2.get_elevation_gain().toFixed(2) - gpx2.get_elevation_loss().toFixed(2)) * 100 / celevationtotal).toFixed(2);

      _c('Comparison').innerHTML = 'Comparison';
      //console.log(gpx2.get_moving_time());

      _c('distance31').innerHTML = cdistance1;
      console.log(cdistancetotal);
      _c('duration31').innerHTML = cduration1;
      _c('speed31').innerHTML    = cspeed1;
      _c('avghr31').innerHTML    = cheartrate1;
      _c('avgcad31').innerHTML   = ccadence1;
      _c('avgtemp31').innerHTML  = ctemperature1;
      _c('elevation-net31').innerHTML  = celevation1;

      _c('distance32').innerHTML = cdistance2;
      //console.log(cdistancetotal);
      _c('duration32').innerHTML = cduration2;
      _c('speed32').innerHTML    = cspeed2;
      _c('avghr32').innerHTML    = cheartrate2;
      _c('avgcad32').innerHTML   = ccadence2;
      _c('avgtemp32').innerHTML  = ctemperature2;
      _c('elevation-net32').innerHTML  = celevation2;


      document.getElementById('progress1').style.width = cdistance1 + '%';
      document.getElementById('progress2').style.width = cdistance2 + '%';
      document.getElementById('progress3').style.width = cduration1 + '%';
      document.getElementById('progress4').style.width = cduration2 + '%';
      document.getElementById('progress5').style.width = cspeed1 + '%';
      document.getElementById('progress6').style.width = cspeed2 + '%';
      document.getElementById('progress7').style.width = cheartrate1 + '%';
      document.getElementById('progress8').style.width = cheartrate2 + '%';
      document.getElementById('progress9').style.width = ccadence1 + '%';
      document.getElementById('progress10').style.width = ccadence2 + '%';
      document.getElementById('progress11').style.width = ctemperature1 + '%';
      document.getElementById('progress12').style.width = ctemperature2 + '%';
      document.getElementById('progress13').style.width = celevation1 + '%';
      document.getElementById('progress14').style.width = celevation2 + '%';

}

//$.when(display_gpx(document.getElementById('demo'))).then(draw_hotline_all());
//display_gpx(document.getElementById('demo'));
//draw_hotline_all();
//display_gpx(document.getElementById('demo')).pipe(draw_hotline_all());