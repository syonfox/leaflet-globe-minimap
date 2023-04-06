# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).
## 0.0.3
### Added
  - updated pages / readme
  - fix bug with resize
  - add some option validation
  - `options.radius` is in testing now overrides width and height if used

## 0.0.2
### Added
- `topojsonSrc` option to specify custom TopoJSON world-map data
- `setSize(w,h)` update options and re add to map to rerender and compute
- `hackMation()` try it for a demo hacky animation of resize todo figure out how to do this fast with css.
- `transitionMap(pos, duration)` added duration option.
- `options.onAdd / onRemove` calbacks with map, miniMap, for adding you events to the dom.

### Changed
- Also made things correctly scale, note width and height must be = for now due to d3 mathyness. todo fix :)
- Fixed bug with size change and transparency (issue)[https://github.com/chriswhong/leaflet-globeminimap/issues/12]
- Upgrade dependencies: d3, leaflet, topojson(-client), uglify-js
- Example page loads dependencies from `node_modules/` instead of making network requests
- Convert to ES6+ module
- Convert to ES6+ class
- Use Webpack for build process (instead of directly calling uglify-js)
- Example page loads plugin from `dist/` instead of `src/`

## 0.0.1 - 2015-10-10
### Added
- Thanks for the es6 update https://github.com/stilist/leaflet-globeminimap
- Forked from https://github.com/chriswhong/leaflet-globeminimap
- Forked from https://github.com/Norkart/Leaflet-MiniMap
