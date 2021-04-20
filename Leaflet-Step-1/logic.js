// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  console.log(data.features)                                                                //DELETE
  // console.log(data.features[1].geometry.coordinates[2])                                     //DELETE
  // console.log(data.features[1].properties.mag)                                              //DELETE
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {

    // layer.bindPopup("<h3>" + feature.properties.place +                                  //DELETE
    //   "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");                      //DELETE

    //conditionals for earthquate magnitude
    // for (var i = 0; i < feature.properties.place.length; i++) {
    //   var color = ""
    //   if (feature.properties.mag <= 1) {
    //     color = "green"
    //   }
    //   else if (feature.properties.mag <= 3) {
    //     color = "yellow"
    //   }
    //   else {
    //     color = "red"
    //   }
    // }
    var color = "red"
    var circleRadius = feature.geometry.coordinates[2] * 10000
    console.log(circleRadius)

    // Add Circle to map
    L.circleMarker(feature.properties.place, {
      fillOpacity: 0.75,
      color: "white",
      fillcolor: color,

      //Adjust radius
      radius: circleRadius
    }).bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");

    // Add Legend
    // p = colorFactor(palette = c("green", "yellow", "red"), domain = c("<=10", "10-30", "30+"), ordered = T)

    // addLegend(
    //   position = "bottomright",
    //   pal = p,      
    //   values = ("<=1", "1-3", "3+")
    // )

  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  // var earthquakes = L.geoJSON(earthquakeData, {
  //   onEachFeature: onEachFeature,
  //   pointToLayer: function(feature,latlng)
  // });

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

    function getRadius(magnitude) {
      if (magnitude === 0) {
        return 1;
      }
      return magnitude * 5;
    }

    var earthquakes = L.geoJson(data, {
      // We turn each feature into a circleMarker on the map.
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
      },
      // We set the style for each circleMarker using our styleInfo function.
      style: function (feature, layer) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: getColor(feature.geometry.coordinates[2]),
          color: "#1c1c1c",
          // radius: 10,
          radius: getRadius(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
      },
      // We create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
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
    // .addTo(myMap);


    // Sending our earthquakes layer to the createMap function
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

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });
  // Here we create a legend control object.
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
      //<i style='background: "#72fa41"'></i>0-7<br>
    }
    return div;
  };
  // We add our legend to the map.
  legend.addTo(myMap);

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}
