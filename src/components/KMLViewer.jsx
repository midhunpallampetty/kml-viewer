import React, { useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, Polygon } from "react-leaflet";
import * as tj from "togeojson";
import { DOMParser } from "xmldom";
import { Upload, Map, Table, AlertCircle } from "lucide-react";
import "leaflet/dist/leaflet.css";

const mapTypes = {
  normal: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
  }
};

const KMLViewer = () => {
  const [elements, setElements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [detailed, setDetailed] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMapType, setSelectedMapType] = useState('normal');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const kmlText = e.target.result;
        const kmlDom = new DOMParser().parseFromString(kmlText, "text/xml");
        const geoJson = tj.kml(kmlDom);
        processGeoJson(geoJson);
      } catch (err) {
        setError("Error processing KML file: " + err.message);
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const processGeoJson = (geoJson) => {
    const counts = {};
    const details = {};
    const elements = [];

    geoJson.features.forEach((feature) => {
      const type = feature.geometry.type;
      counts[type] = (counts[type] || 0) + 1;

      if (type === "LineString") {
        const length = calculateLength(feature.geometry.coordinates);
        details[type] = (details[type] || 0) + length;
      } else if (type === "MultiLineString") {
        let totalLength = 0;
        feature.geometry.coordinates.forEach(line => {
          totalLength += calculateLength(line);
        });
        details[type] = (details[type] || 0) + totalLength;
      } else if (type === "GeometryCollection") {
        feature.geometry.geometries.forEach(geom => {
          if (geom.type === "LineString") {
            const length = calculateLength(geom.coordinates);
            details[geom.type] = (details[geom.type] || 0) + length;
          }
        });
      }

      elements.push(feature);
    });

    setElements(elements);
    setSummary(counts);
    setDetailed(details);
    setLoading(false);
  };

  const haversineDistance = (coords1, coords2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;

    const [lon1, lat1] = coords1;
    const [lon2, lat2] = coords2;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateLength = (coords) => {
    let length = 0;
    for (let i = 1; i < coords.length; i++) {
      length += haversineDistance(coords[i - 1], coords[i]);
    }
    return length;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Map className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">KML Viewer</h1>
            </div>
            <div className="flex items-center space-x-4">
              <label className="relative flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                <Upload className="w-5 h-5 mr-2" />
                <span>{fileName || 'Upload KML'}</span>
                <input
                  type="file"
                  accept=".kml"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
              <select
                value={selectedMapType}
                onChange={(e) => setSelectedMapType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal Map</option>
                <option value="satellite">Satellite</option>
                <option value="terrain">Terrain</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
              <p className="text-blue-600">Processing file...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center p-4 bg-red-50 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setShowSummary(!showSummary)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showSummary 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Table className="w-4 h-4 inline-block mr-2" />
              Summary
            </button>
            <button
              onClick={() => setShowDetailed(!showDetailed)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showDetailed 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Table className="w-4 h-4 inline-block mr-2" />
              Detailed
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {showSummary && summary && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <Table className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Summary</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Element Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(summary).map(([type, count]) => (
                          <tr key={type}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {showDetailed && detailed && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <Table className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Detailed</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Element Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Length (km)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(detailed).map(([type, length]) => (
                          <tr key={type}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{length.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="h-[600px] bg-gray-100 rounded-lg overflow-hidden">
              <MapContainer
                center={[37.422, -122.082]}
                zoom={15}
                className="h-full w-full"
              >
                <TileLayer {...mapTypes[selectedMapType]} />

                {elements.map((feature, index) => {
                  const { geometry, properties } = feature;

                  if (geometry.type === "Point") {
                    const [lng, lat] = geometry.coordinates;
                    return (
                      <Marker key={index} position={[lat, lng]}>
                        <Popup>{properties.name || `Point ${index + 1}`}</Popup>
                      </Marker>
                    );
                  } else if (geometry.type === "LineString") {
                    const polylineCoords = geometry.coordinates.map(([lng, lat]) => [lat, lng]);
                    return <Polyline key={index} positions={polylineCoords} color="blue" weight={3} />;
                  } else if (geometry.type === "MultiLineString") {
                    const polylineCoords = geometry.coordinates.flatMap((line) =>
                      line.map(([lng, lat]) => [lat, lng])
                    );
                    return <Polyline key={index} positions={polylineCoords} color="purple" weight={3} />;
                  } else if (geometry.type === "Polygon") {
                    const polygonCoords = geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
                    return <Polygon key={index} positions={polygonCoords} color="green" />;
                  } else if (geometry.type === "GeometryCollection") {
                    return geometry.geometries.map((geom, geomIndex) => {
                      if (geom.type === "LineString") {
                        const polylineCoords = geom.coordinates.map(([lng, lat]) => [lat, lng]);
                        return (
                          <Polyline
                            key={`${index}-${geomIndex}`}
                            positions={polylineCoords}
                            color="orange"
                            weight={3}
                          />
                        );
                      }
                      return null;
                    });
                  }

                  return null;
                })}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KMLViewer;