# KML Viewer

A modern, interactive web application for visualizing and analyzing KML (Keyhole Markup Language) files. Built with React, TypeScript, and Leaflet.

![KML Viewer Screenshot](https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?auto=format&fit=crop&q=80&w=2000)

## Live Demo

🌐 [View Live Demo](https://kml-viewer.netlify.app)

Try it out with your own KML files or explore the demo data!

## Features

- 📍 Interactive map visualization of KML data
- 📊 Detailed statistics and summaries
- 🗺️ Multiple map types (Normal, Satellite, Terrain)
- 📏 Distance calculations for linear features
- 💫 Smooth animations and transitions
- 📱 Responsive design for all devices

## Supported KML Elements

- Points with markers and popups
- LineStrings with customizable styles
- MultiLineStrings
- Polygons
- GeometryCollections

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kml-viewer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Usage

1. Launch the application
2. Click the "Upload KML" button to select your KML file
3. Use the map type selector to switch between different map views
4. Toggle the Summary and Detailed buttons to view statistics
5. Interact with the map to explore your KML data

## Technical Details

### Built With

- React 18
- TypeScript
- Leaflet & React-Leaflet
- ToGeoJSON
- Tailwind CSS
- Lucide React Icons

### Key Components

- **Map Visualization**: Uses Leaflet for rendering interactive maps
- **KML Processing**: Converts KML to GeoJSON using ToGeoJSON
- **Distance Calculation**: Implements Haversine formula for accurate distance measurements
- **Responsive UI**: Built with Tailwind CSS for a modern, responsive design

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenStreetMap for map data
- Esri for satellite imagery
- OpenTopoMap for terrain data
