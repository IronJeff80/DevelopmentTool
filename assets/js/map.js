/**
 * Created by Jean on 2019-10-09.
 */

var Map = {
    minZoom: 2,
    maxZoom: 7,
    bounds: L.latLngBounds(Map.southWest, Map.northEast)
};

Map.init = function ()
{
    
    var mapLayers = [];
    mapLayers['Default'] = L.tileLayer('https://s.rsg.sc/sc/images/games/RDR2/map/game/{z}/{x}/{y}.jpg', { noWrap: true});
    mapLayers['Detailed'] = L.tileLayer('assets/maps/detailed/{z}/{x}_{y}.jpg', { noWrap: true});
    mapLayers['Dark'] = L.tileLayer('assets/maps/darkmode/{z}/{x}_{y}.jpg', { noWrap: true});

    map = L.map('map', {
        minZoom: Map.minZoom,
        maxZoom: Map.maxZoom,
        zoomControl: false,
        crs: L.CRS.Simple,
        layers: [mapLayers[Cookies.get('map-layer')]]
    }).setView([-70, 111.75], 3);

    var baseMaps = {
        "Default": mapLayers['Default'],
        "Detailed": mapLayers['Detailed'],
        "Dark": mapLayers['Dark']
    };

    L.control.zoom({
        position:'bottomright'
    }).addTo(map);

    L.control.layers(baseMaps).addTo(map);

    map.on('click', function (e)
    {
       Map.addCoordsOnMap(e);
    });

    map.on('baselayerchange', function (e)
    {
        setMapBackground(e.name);
    });

    var southWest = L.latLng(-170.712, -25.227),
        northEast = L.latLng(10.774, 200.125),
        bounds = L.latLngBounds(southWest, northEast);

    map.setMaxBounds(bounds);
    Map.addMarkers();
};

Map.loadMarkers = function()
{
    markers = [];
    $.getJSON(`data/items.json?nocache=${nocache}`)
        .done(function(data) {
            markers = data;
            Map.addMarkers();
        });
};

Map.addMarkers = function() {

    markersLayer.clearLayers();

    visibleMarkers = [];
    $.each(markers, function (key, value)
    {

        if(parseInt(toolType) < parseInt(value.tool) && toolType !== "3")
            return;

        if(enabledTypes.includes(value.icon))
        {
            if (value.day == day || Cookies.get('ignore-days') == 'true')
            {
                if (languageData[value.text+'.name'] == null)
                {
                    console.error(`[LANG][${lang}]: Text not found: '${value.text}'`);
                }

                if (searchTerms.length > 0)
                {
                    $.each(searchTerms, function (id, term)
                    {
                        if (languageData[value.text+'.name'].toLowerCase().indexOf(term.toLowerCase()) !== -1)
                        {
                            if (visibleMarkers[value.text] == null)
                            {
                                Map.addMarkerOnMap(value);
                            }
                        }
                    });
                }
                else {
                    Map.addMarkerOnMap(value);
                }

            }
        }
    });

    markersLayer.addTo(map);
    Menu.refreshItemsCounter();

    Menu.refreshMenu();

};




Map.addMarkerOnMap = function(value)
{
    var isWeekly = "a";

    var tempMarker = L.marker([value.x, value.y], {icon: L.AwesomeMarkers.icon({iconUrl: './assets/images/icons/' + value.icon + '.png', markerColor: isWeekly ? 'green' : 'day_' + value.day})});

    tempMarker.bindPopup(`<h1> ${languageData[value.text + '.name']} - ${languageData['menu.day']} ${value.day}</h1><p>  ${Map.getToolIcon(value.tool)} ${languageData[value.text + '_' + value.day + '.desc']} </p><p class="remove-button" data-item="${value.text}">${languageData['map.remove_add']}</p>`).on('click', function(e) { Routes.addMarkerOnCustomRoute(value.text); if(customRouteEnabled)e.target.closePopup();});

    visibleMarkers[value.text] = tempMarker;
    markersLayer.addLayer(tempMarker);
};

Map.getToolIcon = function (type) {
    switch(type)
    {
        case '0':
            return '';
            break;
        case '1':
            return '⛏';
            break;
        case '2':
            return '🧲';
            break;
    }
};

Map.debugMarker = function (lat, long)
{
    var marker = L.marker([lat, long], {
        icon: L.AwesomeMarkers.icon({
            iconUrl: './assets/images/icons/help.png',
            markerColor: 'darkblue'
        })
    });

    marker.bindPopup(`<h1>Debug Marker</h1><p>  </p>`);
    markersLayer.addLayer(marker);
};

Map.addCoordsOnMap = function(coords)
{
    
    $('#latitude').val(coords.latlng.lat);
    $('#longitude').val(coords.latlng.lng);

};

Map.placeMarker = function()
{
    var lat = Number($('#latitude').val());
    var lng = Number($('#longitude').val());
    var cat = $('#categories').val();
    var iid = $('#item-id').val();
    var dey = $('#day').val();
    var des = $('#desc').val();
    var tol = $('#tools').val();
    var nam = $('#item-name').val();
    var marker = L.marker([lat, lng], {
        icon: L.AwesomeMarkers.icon({
            iconUrl: `./assets/images/icons/${cat}.png`,
            markerColor: `day_${dey}`
        })
    });

    if (tol == 3){tol = 0;}

    marker.bindPopup(`<h1>${nam}</h1><p>${Map.getToolIcon(tol)}  ${des}</p>`);
    markersLayer.addLayer(marker);
    Map.addItem(iid, dey, tol, cat, lat, lng, nam, des)
}

// {"text": "cups_ace", "day": "1", "tool": "0", "icon": "card-cups", "x": "-26.421875", "y": "90.65625"},
Map.addItem = function(iid, dey, tol, cat, lat, lng, nam, des)
{   
    
    
    var tempMarker = {
                "text": iid, 
                "day": dey,
                "tool": tol,
                "icon": cat,
                "x": String(lat),
                "y": String(lng)
            }
    markers.push(tempMarker)
// {"key": "cups_ace.name", "value": "Ace of Cups"},
// {"key": "cups_ace_1.desc", "value": "Inside the barn on some haybales."},
// {"key": "cups_ace_2.desc", "value": "On a barrel behind the rundown shed."},
// {"key": "cups_ace_3.desc", "value": "On the nightstand in the right bedroom."},
    langData.push({"key": iid+".name", "value": nam});

    if(dey !=4){
        langData.push({"key": iid+"_"+dey+".desc", "value": des});
    }else {
        langData.push({"key": iid+"_1.desc", "value": des});
        langData.push({"key": iid+"_2.desc", "value": des});
        langData.push({"key": iid+"_3.desc", "value": des});
    }
    $('#item-json').val(JSON.stringify(markers))
    $('#item-lang').val(JSON.stringify(langData))
}

function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
