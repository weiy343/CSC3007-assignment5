
// Load external data
Promise.all([d3.json("https://api.data.gov.sg/v1/environment/psi")]).then(data => {

    readings = data[0].items[0].readings.psi_twenty_four_hourly;
    coords = data[0].region_metadata
    time = new Date(data[0].items[0].update_timestamp).toLocaleString()

    // Time
    $("#lastUpdated").text("Last updated: " + time);

    // Map
    let tiles = new L.tileLayer('https://maps-{s}.onemap.sg/v3/Grey/{z}/{x}/{y}.png', {
        detectRetina: true,
        maxZoom: 18,
        minZoom: 11,
        //Do not remove this attribution
        attribution: '<img src="https://docs.onemap.sg/maps/images/oneMap64-01.png" style="height:20px;width:20px;">' +
            'New OneMap | Map data © contributors, <a href="http://SLA.gov.sg">Singapore Land Authority</a>'
    });

    let center = L.bounds([1.56073, 104.11475], [1.16, 103.502]).getCenter();

    let map = new L.Map('map', {
        center: [center.x, center.y],
        zoom: 12,
        minZoom: 12
    }).addLayer(tiles);

    map.setMaxBounds([[1.56073, 104.1147], [1.16, 103.502]]);

    let domain = [51, 101, 201, 301];
    let colorRange = ["green", "blue", "yellow", "orange", "red"];
    let psiLevelsRange = ["Good", "Moderate", "Unhealthy", "Very Unhealthy", "Hazardous"];
    let myColor = d3.scaleThreshold()
        .domain(domain)
        .range(colorRange);

    let psiLevels = d3.scaleThreshold()
        .domain(domain)
        .range(psiLevelsRange);

    // Markers
    for (let i = 0; i < coords.length; i++) {
        coord = coords[i].label_location;
        region = coords[i].name;

        let circleMarker = L.circle([coord.latitude, coord.longitude], {
            radius: readings[region] * 40,
            fillColor: myColor(readings[region]),
            color: myColor(readings[region]),
            fillOpacity: 0.4,
        }

        ).addTo(map);

        let textMarker = L.marker([coord.latitude, coord.longitude], {
            icon: new L.DivIcon({
                className: 'text-labels',
                iconAnchor: [13, 16],
                direction: 'center',
                html: "<b>" + readings[region] + "</b>"
            })
        }).addTo(map);

        circleMarker.bindPopup("Status: " + psiLevels(readings[region]), {
            className: "bd"
        });
        textMarker.bindPopup("Status: " + psiLevels(readings[region]), {
            className: "bd"
        });
    }

    // Legend
    var legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            levels = [0, 50, 100, 200, 300];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < levels.length; i++) {
            div.innerHTML +=
            '<div class="mt-1">' + 
                '<i style="background:' + myColor(levels[i] + 1) + '"></i> ' + psiLevelsRange[i] +
            '</div>';
        }

        return div;
    };

    legend.addTo(map);
})