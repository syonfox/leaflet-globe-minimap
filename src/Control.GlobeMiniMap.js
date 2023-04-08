import d3 from 'd3';
import L from 'leaflet';
import 'topojson-client';


class MiniMap extends L.Control {
  //layer is the map layer to be shown in the minimap
  initialize(options) {
    L.Util.setOptions(this, options);

    console.assert(typeof this.options.width === 'number', "width must be number px")
    console.assert(typeof this.options.height === 'number', "height must be number px")
    console.assert(typeof this.options.duration === 'number', "duration must be number ms")

    if (this.options.height !== this.options.width) {
      console.warn("You have asked for a different height then width, this is currently buggy only circles.")
    }
    if (typeof this.options.radius === "number") {
      this.options.width = this.options.radius * 2;
      this.options.height = this.options.radius * 2;
    }

  }

  onAdd(map) {
    // console.log('onAdd()');

    this._mainMap = map;

    //Creating the container and stopping events from spilling through to the main map.
    this._container = L.DomUtil.create('div', 'leaflet-control-minimap');

    //if width is specifed we need to pad by this;
    this._pad = this.options.globeStrokeWidth || 0
    if (this.options.globeStrokeWidth === true) {
      this._pad = this.options.width / 5;
    }
    //we need more padding if the blur is turned on.
    if (this.options.globeBlur) this._pad *= 2;

    this._container.style.width = this.options.width + this._pad + 'px';
    this._container.style.height = this.options.height + this._pad + 'px';


    L.DomEvent.disableClickPropagation(this._container);
    L.DomEvent.on(this._container, 'mousewheel', L.DomEvent.stopPropagation);

    //Keep a record of this to prevent auto toggling when the user explicitly doesn't want it.
    this._userToggledDisplay = false;
    this._minimized = false;

    this._mainMap.on('moveend', this._onMainMapMoved, this);

    return this._container;
  }

  addTo(map) {
    // console.log('addTo()');
    L.Control.prototype.addTo.call(this, map);
    this.initCanvas();

    if (typeof this.options.onAdd === "function") {
      this.options.onAdd(map, this);
    }
    return this;
  }

  initCanvas() {
    //marker icon
    //https://upload.wikimedia.org/wikipedia/commons/9/93/Map_marker_font_awesome.svg
    let w = this.options.width;
    let h = this.options.height;
    let pw = w + this._pad;
    let ph = w + this._pad;
    let p = this._pad;
    let p2 = p / 2;

    let sx = .01 * pw / 82
    let sy = .01 * ph / 82
    let mw = 400
    let ox = (pw * 0.5) / sx;
    let oy = (ph * 0.5) / sy
    let offset = `scale(${sx},-${sy}),translate(${ox - (mw)},-${oy})`;
    console.log("offset: ", offset)
    d3.select('.leaflet-control-minimap')
      .append('svg')
      .attr("width", pw)
      .attr("height", ph)
      .attr("style", "position: absolute; left: 0; top: 0;")
      .append('path')
      .attr('d', 'm 768,896 q 0,106 -75,181 -75,75 -181,75 -106,0 -181,-75 -75,-75 -75,-181 0,-106 75,-181 75,-75 181,-75 106,0 181,75 75,75 75,181 z m 256,0 q 0,-109 -33,-179 L 627,-57 q -16,-33 -47.5,-52 -31.5,-19 -67.5,-19 -36,0 -67.5,19 Q 413,-90 398,-57 L 33,717 Q 0,787 0,896 q 0,212 150,362 150,150 362,150 212,0 362,-150 150,-150 150,-362 z')
      .attr('transform', offset)
      .attr('style', 'fill:' + this.options.marker);


    let s = (w + h) / 4; // no point broken with difrent size
    //todo allow indapendant scaling so difrent numbers doesnt break it
    //https://github.com/d3/d3-zoom/issues/48

    this.projection = d3.geo.orthographic()
      .scale(s)

      // .transform()
      // .scaleLock([w, h])
      .translate([(pw) / 2, (ph) / 2])
      .rotate([0, 0])
      .clipAngle(90);

    var canvas = d3.select('.leaflet-control-minimap').append("canvas")
      .attr("width", pw)
      .attr("height", ph)

    this.c = canvas.node().getContext("2d");

    this.path = d3.geo.path()
      .projection(this.projection)
      .context(this.c);

    d3.json(this.options.topojsonSrc, (world) => {
      this.globe = {type: "Sphere"};
      this.land = topojson.feature(world, world.objects.land);
    });

    //set to current view
    this.transitionMap(this._mainMap.getCenter(), 0);
  }

  hackMation(s, e, self) {
    self = self || this
    s = s || 40
    e = e || 400
    if (s < e) {
      s += 3
      self.setSize(s);
      setTimeout(self.hackMation, 15, s, e, self);
    }

  }

  /**
   * Animate the map to a position over d ms
   * @param point - L.LatLng
   * @param duration - duration in ms
   */
  transitionMap(point, duration) {
    if (typeof duration != "number") {
      duration = duration || this.options.duration
    }
    // console.log('transtionMap');
    var that = this;
    var c = that.c;
    var path = that.path;


    function drawGlobe() {

    }

    function drawLand() {

    }



    d3.transition()
      .duration(duration)
      .each("start", function () {
      })
      .tween("rotate", function () {
        let r = d3.interpolate(that.projection.rotate(), [-point.lng, -point.lat]);
        let pw = that.options.width + that._pad;
        let ph = that.options.height + that._pad;
        return function (t) { // draw function

          that.projection.rotate(r(t));

          //clear
          c.clearRect(0, 0, pw, ph);

          drawGlobe();
          drawLand();
          //draw base circle
          if (that.options.globeFilter) {
            c.filter = that.options.globeFilter
          }
          c.fillStyle = that.options.water;
          c.beginPath();
          path(that.globe);
          c.fill();

          //allow us to specify a outline of the world
          // suports globeStroke= color, globeFStrokeFilter takes prioraty
          // but there is a preset globeBlur
          // you can set globeStrokeWidth
          if (that.options.globeStroke) {
            c.save()

            let g = that.options.globeStrokeWidth
            if (g === true) { // handle dynamic
              g = that.options.width / 5;
            } else if (typeof g !== "number") {
              g = 2; // default if not defined
            }
            c.lineWidth = g;

            if (that.options.globeStrokeFilter) {
              c.filter = that.options.globeStrokeFilter;
            } else if (that.options.globeBlur) {
              var h = that.options.globeBlur;
              if (h === true) h = g / 4;
              c.filter = 'blur(' + h + 'px)'
            }


            let style = that.options.globeStroke;
            if (Array.isArray(style)) {
              //we will construct a radial gradient based on this
              let center = pw / 2
              let w2 = that.options.width/2;
              let halfStrokeWidth = g / 2;
              let gradient = c.createRadialGradient(center, center, w2 - halfStrokeWidth, center, center, w2+halfStrokeWidth)
              style.forEach(s => {
                console.log("adding step: ", ...s);
                gradient.addColorStop(...s);
              })


              style = gradient;

              if(that.options.drawGlobeGradient) {
                console.log("debug draw")
                c.save()
                c.fillStyle = style;
                c.fillRect(0, 0, pw, ph);
                c.restore()
              }
            }


            c.strokeStyle = style

            c.beginPath();
            path(that.globe);
            c.stroke();
            c.restore();
          }

          //ok now onto drawing the land on top of the circle

          if (that.options.landFilter) {
            c.filter = that.options.landFilter
          } else if (that.options.landShadow) {
            let s = that.options.landShadow;
            let p = pw / 100;
            let l = pw / 100;
            c.filter = 'drop-shadow(' + l + 'px ' + l + 'px ' + p + 'px ' + s + ')'

          } else {
            c.filter = "";
          }
          c.fillStyle = that.options.land,
            c.beginPath(),
            path(that.land),
            c.fill();

          if (that.options.landStroke) {
            c.save();
            if (that.options.landStrokeFilter) {
              c.filter = that.options.landStrokeFilter
            } else {
              c.filter = "";
            }
            c.strokeStyle = that.options.landStroke
            c.lineWidth = that.options.landStrokeWidth || 2
            c.beginPath();
            path(that.land);
            c.stroke()
            c.restore();
          }
        };
      })
  }

  onRemove(map) {
    this._mainMap.off('moveend', this._onMainMapMoved, this);
    this._mainMap.off('move', this._onMainMapMoving, this);

    if (typeof this.options.onRemove === "function") {
      this.options.onRemove(map, this);
    }
  }

  //note size must be square for now.
  setSize(w, h) {
    this.options.width = w;
    this.options.height = h || w;
    if (this._map) {
      //force recompute hack
      this.remove().addTo(this._mainMap);
    }

  }

  _onMainMapMoved(e) {
    // console.log('mainmapmoved');
    if (!this._miniMapMoving) {
      this._mainMapMoving = true;

      this.transitionMap(this._mainMap.getCenter());
    } else {
      this._miniMapMoving = false;
    }
  }

}

MiniMap.prototype.options = {
  position: 'bottomright',
  width: 82,
  height: 82,
  land: "#bbb",
  water: "rgba(0, 0, 0, 0.3)",
  marker: "#CC0000",
  topojsonSrc: 'data/world.json',
  duration: 1250,
  onAdd: false, //(map, this) for adding event listners.
  onRemove: false, // callback for cleaning up on remove
  globeStroke: false, // the color to set for the strokeStyle.
  // implementation note. this._pad is the padding added to the div.
  globeStrokeWidth: 4, // true for 1/5 width,
  globeBlur: false, // preset to pixel for gausian blur on the stroke
  globeStrokeFilter: false, // override stroke filter string.
  globeFilter: false,
  landStroke: false,
  landStrokeWidth: 1,
  landShadow: false, // override filter with a shadow of color
  landFilter: false, // idk try it. https://developer.mozilla.org/en-US/docs/Web/CSS/filter
  landStrokeFilter: false,


}

L.Control.GlobeMiniMap = MiniMap

export default MiniMap

L.control.globeminimap = function (layer, options) {
  return new L.Control.GlobeMiniMap(layer, options);
};

L.Map.mergeOptions({
  miniMapControl: false
});

L.Map.addInitHook(function () {
  if (this.options.miniMapControl) {
    this.miniMapControl = (new GlobeMiniMap()).addTo(this);
  }
});
