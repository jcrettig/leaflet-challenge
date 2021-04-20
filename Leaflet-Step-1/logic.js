// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
  //Send data.features object to createFeatures function
  createFeatures(data.features);  
});

function createFeatures(earthquakeData) {

    //Create circle colors based on depth of earthquake
 
  d3.json(queryUrl, function (data) {

    function getColor(Depth) {
      var color = ""
      if (Depth <= 7) {
        color = "#72fa41"
      }
      else if (Depth <= 14) {
        color = "#fbff00"
      }
      else {
        color = "#eb3434"
      }
      return color;
    }

    //Create circle size based on magnitude of earthquakes
    function getRadius(magnitude) {
      if (magnitude === 0) {
        return 1;
      }
      return magnitude * 5;
    }

    // Create a GeoJSON layer 
    var earthquakes = L.geoJson(data, {
      // Turn features into  circleMarkers on the map.
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
      },

      // Set style for circleMarkers
      style: function (feature, layer) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: getColor(feature.geometry.coordinates[2]),
          color: "#1c1c1c",          
          radius: getRadius(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
      },

      // Create popups for each marker that display  magnitude depth and location of the earthquakes 
      onEachFeature: function (feature, layer) {
        layer.bindPopup(
          "Magnitude: "
          + feature.properties.mag
          + "<br>Depth: "
          + feature.geometry.coordinates[2]
          + "<br>Location: "
          + feature.properties.place
        );
      }
    })
    
    // Send earthquakes layer to createMap function
    createMap(earthquakes);
  });
}
function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define baseMaps object to hold base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create map, giving it streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create legend control object.
  var legend = L.control({
    position: "bottomleft"
  });

  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");
    var grades = [0, 7, 14];
    var colors = [
      "#72fa41",
      "#fbff00",
      "#eb3434"];

    // Loop through our intervals and generate a label with a colored square for each interval.
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<div style='margin-top: 10px;'><i style='background: " + colors[i] + "'></i> " + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "</div><br>" : "+");     
    }
    return div;
  };

  //Add legend to map.
  legend.addTo(myMap);

  // Create a layer control
  // Pass in baseMaps and overlayMaps
  // Add layer control to map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}
