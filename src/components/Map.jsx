import React, { useEffect, useState, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import MapGL, {
  NavigationControl,
  GeolocateControl,
  Marker,
  Source,
  Layer,
  Popup,
} from "@urbica/react-map-gl";

// Assuming the mapContainerStyle, mapboxToken, and other necessary configurations are already set
const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const Map = ({ buildings, selectedBuilding }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(17);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [travelTime, setTravelTime] = useState(null);
  const [directions, setDirections] = useState([]);
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/streets-v11");
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentTurnInstruction, setCurrentTurnInstruction] = useState(null);
  const [mapInstance, setMapInstance] = useState(null); // Store the map instance


  const mapboxToken = 'pk.eyJ1IjoiZmFpemJhc2giLCJhIjoiY2x6Nm1mMGk1M295ejJrc2c2eThqOTJzNCJ9.fVCrUYo2j_Dci4hJXwL7Nw';

  useEffect(() => {
    const handleSuccess = (position) => {
      const { latitude, longitude } = position.coords;
      const currentLocation = new mapboxgl.LngLat(longitude, latitude);
      setUserLocation(currentLocation);
      setLoading(false);
      setZoom(17);
      setLastUpdateTime(new Date().toLocaleTimeString());

      if (route) {
        updateNavigation(currentLocation);
      }

      if (mapInstance) {
        mapInstance.flyTo({ center: [longitude, latitude], zoom: 17, speed: 0.5 });
      }
    };

    const handleError = (error) => {
      setError("Unable to retrieve your location");
      setLoading(false);
    };

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  }, [route, mapInstance]);

  const getDirections = (destination) => {
    if (!userLocation) return;

    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${userLocation.lng},${userLocation.lat};${destination.lng},${destination.lat}?geometries=geojson&access_token=${mapboxToken}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.routes && data.routes.length) {
          setRoute(data.routes[0].geometry);
          const duration = Math.round(data.routes[0].duration / 60);
          setTravelTime(duration);
          setDirections(data.routes[0].legs[0].steps);
          setCurrentStepIndex(0);
        } else {
          setRoute(null);
          setTravelTime(null);
          setDirections([]);
          setError("No route found");
        }
      })
      .catch((err) => {
        console.error(err);
        setRoute(null);
        setTravelTime(null);
        setDirections([]);
        setError("Error fetching route");
      });
  };

  useEffect(() => {
    if (selectedBuilding) {
      getDirections(
        new mapboxgl.LngLat(
          selectedBuilding.longitude,
          selectedBuilding.latitude
        )
      );
      setZoom(17);
    }
  }, [selectedBuilding, userLocation]);

  const updateNavigation = (currentLocation) => {
    if (!directions.length) return;

    console.log(currentLocation)
    const currentStep = directions[currentStepIndex];
    const nextStep = directions[currentStepIndex + 1];

    if (nextStep) {
      const distanceToNextStep = currentLocation.distanceTo(new mapboxgl.LngLat(nextStep.maneuver.location[0], nextStep.maneuver.location[1]));

      if (distanceToNextStep < 20) { // Move to the next step when close to the current one
        setCurrentStepIndex(currentStepIndex + 1);
      }
    }

    if (currentStep.maneuver.type === 'turn') {
      const instruction = `Turn ${currentStep.maneuver.instruction}`;
      setCurrentTurnInstruction(instruction);

      // Optionally, use Web Speech API to read out the instruction
      const speech = new SpeechSynthesisUtterance(instruction);
      window.speechSynthesis.speak(speech);

      console.log(instruction); // For debugging purposes
    }
  };

  const handleStyleChange = (style) => {
    setMapStyle(style);
  };

  const handleRecenter = () => {
    if (userLocation && mapInstance) {
      mapInstance.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 17, speed: 0.5 });
    }
  };

  return (
    <div>
      {loading && <p>Loading map...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <div className="relative">
          <MapGL
            style={mapContainerStyle}
            mapStyle={mapStyle}
            accessToken={mapboxToken}
            latitude={userLocation ? userLocation.lat : 37.7749}
            longitude={userLocation ? userLocation.lng : -122.4194}
            zoom={zoom}
            pitch={60} // Tilt the map for 3D view
            bearing={-30} // Angle the map for better perspective
            onLoad={(map) => setMapInstance(map)} // Get the map instance on load
          >
            {userLocation && (
              <Marker latitude={userLocation.lat} longitude={userLocation.lng}>
                <div
                  style={{
                    backgroundColor: "blue",
                    borderRadius: "50%",
                    width: "10px",
                    height: "10px",
                  }}
                />
                <Popup
                  latitude={userLocation.lat}
                  longitude={userLocation.lng}
                  closeButton={false}
                  offset={[0, -10]}
                  anchor="top"
                >
                  <div>
                    <p>You Are Here</p>
                    <p>Last Updated: {lastUpdateTime}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            {buildings.map((building) => (
              <React.Fragment key={building.id}>
                <Marker
                  latitude={building.latitude}
                  longitude={building.longitude}
                >
                  <div
                    onMouseEnter={() => setHoveredBuilding(building)}
                    onMouseLeave={() => setHoveredBuilding(null)}
                    style={{
                      backgroundColor: "red",
                      borderRadius: "50%",
                      width: "10px",
                      height: "10px",
                      cursor: "pointer",
                    }}
                  />
                </Marker>
                {hoveredBuilding && hoveredBuilding.id === building.id && (
                  <Popup
                    latitude={building.latitude}
                    longitude={building.longitude}
                    closeButton={false}
                    offset={[0, -10]}
                    anchor="top"
                  >
                    <div>
                      <p>{building.name}</p>
                      {travelTime !== null && (
                        <p>Estimated Travel Time: {travelTime} minutes</p>
                      )}
                    </div>
                  </Popup>
                )}
                {(selectedBuilding && selectedBuilding.id === building.id) && (
                  <Popup
                    latitude={building.latitude}
                    longitude={building.longitude}
                    closeButton={false}
                    offset={[0, -10]}
                    anchor="top"
                  >
                    <div>
                      <p>{building.name}</p>
                      {travelTime !== null && (
                        <p>Estimated Travel Time: {travelTime} minutes</p>
                      )}
                      {directions.length > 0 && (
                        <ul>
                          {directions.map((step, index) => (
                            <li key={index}>{step.maneuver.instruction}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Popup>
                )}
              </React.Fragment>
            ))}
            {route && (
              <Source id="route" type="geojson" data={route}>
                <Layer
                  id="route"
                  type="line"
                  source="route"
                  layout={{
                    "line-join": "round",
                    "line-cap": "round",
                  }}
                  paint={{
                    "line-color": "#007cbf",
                    "line-width": 5,
                  }}
                />
              </Source>
            )}
            <GeolocateControl
              position="top-left"
              trackUserLocation
              showAccuracyCircle={false}
              positionOptions={{ enableHighAccuracy: true }}
              auto
            />
            <button className="mapboxgl-ctrl-icon mapboxgl-ctrl-geolocate" aria-label="Recenter" style={{ top: "10px", left: "10px", position: "absolute", zIndex: 1 }}></button>
            <NavigationControl showCompass showZoom position="top-left" onClick={handleRecenter} />
          </MapGL>
          <div className="absolute top-2 left-10">
            <button className="bg-white p-2 hover:bg-gray-600" onClick={() => handleStyleChange("mapbox://styles/mapbox/streets-v11")}>Streets</button>
            <button className="bg-white p-2 hover:bg-gray-600" onClick={() => handleStyleChange("mapbox://styles/mapbox/satellite-v9")}>Satellite</button>
            <button className="bg-white p-2 hover:bg-gray-600" onClick={() => handleStyleChange("mapbox://styles/mapbox/outdoors-v11")}>Outdoors</button>
          </div>
          {currentTurnInstruction && (
            <div className="absolute bottom-5 left-10 bg-white p-3 border border-gray-300 shadow-lg">
              <p>{currentTurnInstruction}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Map;
