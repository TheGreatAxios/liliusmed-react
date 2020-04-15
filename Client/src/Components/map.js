import React, { useState, useEffect, useContext, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import '../App.css';
import hospitals from '../hospital.geojson'

const Map = (props) => {
    const [lng, setLng] = useState(-80.7959);
    const [lat, setLat] = useState(41.3992);
    const [zoom, setZoom] = useState(3);
    const [map, setMap] = useState(null);
    const mapContainer = useRef(null);

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/fogs96/ck8dfn26y2vok1jr0wuxy9nhq',
            center: [lng, lat],
            zoom: zoom
        }
        );

        map.on('load', function () {
            setMap(map);
            var layers = ['0-5', '5-50', '50+'];
            var colors = ['#E3B3A5', '#E2967E', '#E06941'];
            var legend = document.getElementById('legend')
            let legendTitle = document.createElement('h6');
            legendTitle.innerHTML = 'Predicted Cases'
            legend.appendChild(legendTitle)
            for (let i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var color = colors[i];
                var item = document.createElement('div');
                var key = document.createElement('span');
                key.className = 'legend-key';
                key.style.backgroundColor = color;

                var value = document.createElement('span');
                value.innerHTML = layer;
                item.appendChild(key);
                item.appendChild(value);
                legend.appendChild(item);
            }
            const url = 'https://dev.aimee.bio/api/liliusmed/cases/predicted/geojson';
            window.setInterval(function () {
                map.getSource('newyork').setData(url);
            }, 100000);

            map.addSource('newyork', { type: 'geojson', data: url });
            map.addLayer({
                'id': 'newyork',
                'type': 'fill',
                'source': 'newyork',
                'paint': {
                    'fill-color':
                        ['case', ['<=', ['get', "cases"], 5], '#E3B3A5',
                            ['<', ['get', "cases"], 50], '#E2967E',
                            ['>=', ['get', "cases"], 50], '#E06941', '#EAEAEA'],
                    'fill-outline-color': '#bf502b',
                    'fill-opacity': 0.5
                }
            });

            // When a click event occurs on a feature in the states layer, open a popup at the
            // location of the click, with description HTML from its properties.

            map.addSource('hospitals', {
                type: 'geojson',
                data: hospitals
            });

            map.addLayer({
                'id': 'hospital-point',
                'type': 'circle',
                'source': 'hospitals',
                'paint': {
                    // increase the radius of the circle as the zoom level and dbh value increases
                    'circle-radius': {
                        'base': 1.75,
                        'stops': [[4, 3], [6, 4], [7, 5], [8, 8], [10, 12], [12, 20], [15, 25], [18, 30]]
                    },
                    'circle-color': "#A71E15"
                }
            });

            map.on('click', function (e) {
                var ourMapLayers = map.queryRenderedFeatures(e.point, {
                    layers: ['countypolygons-0l4xxe', 'newyork', 'hospital-point']
                });
                // console.log(ourMapLayers);
                const hospitalLayer = ourMapLayers.filter(layer => layer.source == "hospitals")[0];
                const newyorkLayer = ourMapLayers.filter(layer => layer.source == "newyork")[0];
                const countyLayer = ourMapLayers.filter(layer => layer.sourceLayer == "countyPolygons-0l4xxe")[0];

                if (hospitalLayer != null) {
                    new mapboxgl.Popup()
                        .setLngLat(hospitalLayer.geometry.coordinates)
                        .setHTML('<h4>Hospital</h4><h6>' + hospitalLayer.properties.hospitalName + '</h6>' +
                            '<h6>Bed Count: ' + hospitalLayer.properties.bedCount + '</h6>')
                        .addTo(map);
                } else if (newyorkLayer != null && ourMapLayers.length > 1) {
                    let theDate = newyorkLayer.properties.date.split('-');
                    let predictDate = new Date(theDate[0], theDate[1] - 1, theDate[2]);
                    console.log(newyorkLayer.properties.date);
                    new mapboxgl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(`<h3>${countyLayer.properties.NAME}</h3>
                        <h5>${predictDate.toDateString()}</h5>
                        <h5>Predicted Cases: ${newyorkLayer.properties.cases}</h5>`)
                        .addTo(map);
                } else if (ourMapLayers.length > 0) {
                    new mapboxgl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(`<h3>${countyLayer.properties.NAME}</h3>`)
                        .addTo(map);
                }
            });

        });
        map.on('move', () => {
            setLng(map.getCenter().lng.toFixed(4));
            setLat(map.getCenter().lat.toFixed(4));
            setZoom(map.getZoom().toFixed(2));
        });
    }, [])

    return (
        <div>
            <div ref={el => mapContainer.current = el} className="mapContainer" />
        </div>
    )
}

export default Map;