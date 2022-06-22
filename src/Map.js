import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.css';
import Tooltip from './components/Tooltip';
import * as turf from "turf";
import ReactDOM from 'react-dom';

mapboxgl.accessToken =
  'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

  var midpoint = turf.midpoint([-109.2542939845633, 44.92099025142325], [-109.2594810116001, 44.92454601936934]);
  console.log("midpoint", midpoint.geometry.coordinates);

  var polygon = turf.polygon([
    [
      [-109.2542939845633, 44.92099025142325],
      [-109.2543213737221, 44.92453629766354],
      [-109.2594810116001, 44.92454601936934],
      [-109.2595220820459, 44.92097073571021],
      [-109.2542939845633, 44.92099025142325],
    ],
  ]);
  console.log("polygon", polygon);

  //var length = turf.length(polygon, {units: 'miles'});
  //console.log("length", length);

  var area = turf.area(polygon);
  var areainacres = area * 0.000247105;
  console.log("Areade: " + areainacres);

  var bbox = turf.bbox(polygon);
  console.log("bbox: " + bbox);
  var bboxPolygon = turf.bboxPolygon(bbox);
  console.log("bboxPolygon", bboxPolygon);



  var cellSide = 0.005;
  //var options = { units: "meters" };
  //var squareGrid = turf.squareGrid(bbox, cellSide, options);
  var squareGrid = turf.squareGrid(bbox, cellSide);
  console.log("squareGrid", squareGrid);
  console.log("Total no. of parcels", squareGrid.features.length);

  var midpoint = turf.midpoint([-109.2542939845633, 44.92099025142325], [-109.2594810116001, 44.92454601936934]);
  console.log("midpoint", midpoint.geometry.coordinates);

const Map = () => {
  const mapContainerRef = useRef(null);
  const tooltipRef = useRef(new mapboxgl.Popup({ offset: 15 }));

 

  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v11',
      center: midpoint.geometry.coordinates,
      zoom: 16.5
    });


    map.on("load", () => {

      // Add a data source containing GeoJSON data.
      map.addSource("citydao", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            // These coordinates outline Maine.
            coordinates: [
              [
                [-109.2542939845633, 44.92099025142325],
                [-109.2543213737221, 44.92453629766354],
                [-109.2594810116001, 44.92454601936934],
                [-109.2595220820459, 44.92097073571021],
                [-109.2542939845633, 44.92099025142325],
              ],
            ],
          },
        },
      });

      map.addSource("gridmm", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: squareGrid.features,
        },
      });

      //Add a new layer to visualize the polygon.
        map.addLayer({
          id: "citydao",
          type: "fill",
          source: "citydao", // reference the data source
          layout: {},
          paint: {
            "fill-color": "#040404", // blue color fill
            "fill-opacity": 0.2,
          },
        });

        // Add a black outline around the polygon.
        map.addLayer({
          id: "outline",
          type: "line",
          source: "citydao",
          layout: {},
          paint: {
            "line-color": "#1cf39b",
            "line-width": 3,
          },
        });

        //Subgrid
        map.addLayer({
          id: "outlinegrid22",
          type: "line",
          source: "gridmm",
          layout: {},
          paint: {
            "line-color": "#11ff9f",
            "line-width": 0.8,
          },
        });

    })
    // change cursor to pointer when user hovers over a clickable feature
    map.on('mouseenter', e => {
      if (e.features.length) {
        map.getCanvas().style.cursor = 'pointer';
      }
    });

    // reset cursor to default when user is no longer hovering over a clickable feature
    map.on('mouseleave', () => {
      map.getCanvas().style.cursor = '';
    });

    // add tooltip when users mouse move over a point
    map.on('mousemove', e => {
      const features = map.queryRenderedFeatures(e.point);
      if (features.length) {
        const feature = features[0];

        // Create tooltip node
        const tooltipNode = document.createElement('div');
        ReactDOM.render(<Tooltip feature={feature} />, tooltipNode);

        // Set tooltip on map
        tooltipRef.current
          .setLngLat(e.lngLat)
          .setDOMContent(tooltipNode)
          .addTo(map);
      }
    });

    // Clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className='map-container' ref={mapContainerRef} />
    </div>
  );
};

export default Map;
