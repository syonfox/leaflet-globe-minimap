import 'd3';
import L from 'leaflet';
import 'topojson-client';


class MiniMap extends L.Control {
  //layer is the map layer to be shown in the minimap
  initialize (options) {
    console.assert(typeof options.width === 'number')
    console.assert(typeof options.height === 'number')
    console.assert(typeof options.duration === 'number')

    if(options.height !== options.width) {
      console.warn("You have asked for a different height then width, this is currently buggy only circles.")
    }
    if(typeof options.radius === "number") {
      options.width = options.radius*2;
      options.height = options.radius*2;
    }

    L.Util.setOptions(this, options);

  }

  onAdd (map) {
    // console.log('onAdd()');

    this._mainMap = map;

    //Creating the container and stopping events from spilling through to the main map.
    this._container = L.DomUtil.create('div', 'leaflet-control-minimap');
    this._container.style.width = this.options.width + 'px';
    this._container.style.height = this.options.height + 'px';

    L.DomEvent.disableClickPropagation(this._container);
    L.DomEvent.on(this._container, 'mousewheel', L.DomEvent.stopPropagation);

    //Keep a record of this to prevent auto toggling when the user explicitly doesn't want it.
    this._userToggledDisplay = false;
    this._minimized = false;

    this._mainMap.on('moveend', this._onMainMapMoved, this);

    return this._container;
  }

  addTo (map) {
    // console.log('addTo()');
    L.Control.prototype.addTo.call(this, map);
    this.initCanvas();

    if(typeof this.options.onAdd === "function") {
      this.options.onAdd(map, this);
    }
    return this;
  }

  initCanvas () {
    //marker icon
    //https://upload.wikimedia.org/wikipedia/commons/9/93/Map_marker_font_awesome.svg
    let w = this.options.width;
    let h = this.options.height
    let sx = .01*w/82
    let sy = .01*h/82
    let mw = 400
    let ox = (w*0.5)*1/sx;
    let oy = (h*0.5)*1/sy
    let offset = `scale(${sx },-${sy}),translate(${ox-(mw)},-${oy})`;
    console.log("offset: ", offset)
    d3.select('.leaflet-control-minimap')
      .append('svg')
      .attr("width", this.options.width)
      .attr("height", this.options.height)
      .attr("style","position: absolute; left: 0; top: 0;")
      .append('path')
      .attr('d','m 768,896 q 0,106 -75,181 -75,75 -181,75 -106,0 -181,-75 -75,-75 -75,-181 0,-106 75,-181 75,-75 181,-75 106,0 181,75 75,75 75,181 z m 256,0 q 0,-109 -33,-179 L 627,-57 q -16,-33 -47.5,-52 -31.5,-19 -67.5,-19 -36,0 -67.5,19 Q 413,-90 398,-57 L 33,717 Q 0,787 0,896 q 0,212 150,362 150,150 362,150 212,0 362,-150 150,-150 150,-362 z')
      .attr('transform',offset)
      .attr('style','fill:' + this.options.marker);


    let s = (w+h)/4; // no point broken with difrent size
    //todo allow indapendant scaling so difrent numbers doesnt break it
    //https://github.com/d3/d3-zoom/issues/48

    this.projection = d3.geo.orthographic()
      .scale(s)

      // .transform()
      // .scaleLock([w, h])
      .translate([h/2, w/2])
      .rotate([0,0])
      .clipAngle(90);

    var canvas = d3.select('.leaflet-control-minimap').append("canvas")
      .attr("width", w)
      .attr("height", h)

    this.c = canvas.node().getContext("2d");

    this.path = d3.geo.path()
      .projection(this.projection)
      .context(this.c);

    var that = this;
    d3.json(this.options.topojsonSrc, function (world) {
      that.globe = {type: "Sphere"},
      that.land = topojson.feature(world, world.objects.land);
    });

    //set to current view
    this.transitionMap(this._mainMap.getCenter(), 0);
  }

  hackMation(s, e, self) {
    self = self || this
    s =  s || 40
    e = e || 400
    if (s < e) {
      s+=3
      self.setSize(s);
      setTimeout(self.hackMation,15, s, e, self);
    }

  }

  /**
   * Animate the map to a position over d ms
   * @param p - L.LatLng
   * @param d - duration in ms
   */
  transitionMap (p, d) {
    if(typeof d != "number") {
      d = d || this.options.duration
    }
    // console.log('transtionMap');
    var that = this;
    var c = that.c;
    var path = that.path;
    d3.transition()
      .duration(d)
      .each("start", function() {
      })
      .tween("rotate", function() {
        var r = d3.interpolate(that.projection.rotate(), [-p.lng, -p.lat]);
        return function(t) {
          that.projection.rotate(r(t));
          c.clearRect(0, 0, that.options.width, that.options.height);
          c.fillStyle = that.options.water, c.beginPath(), path(that.globe), c.fill();
          c.fillStyle = that.options.land, c.beginPath(), path(that.land), c.fill();
        };
      })
  }

  onRemove (map) {
    this._mainMap.off('moveend', this._onMainMapMoved, this);
    this._mainMap.off('move', this._onMainMapMoving, this);

    if(typeof this.options.onRemove === "function") {
      this.options.onRemove(map, this);
    }
  }

  //note size must be square for now.
  setSize(w, h) {
    this.options.width = w;
    this.options.height = h || w;
    if(this._map) {
      //force recompute hack
      this.remove().addTo(this._mainMap);
    }

  }

  _onMainMapMoved (e) {
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
