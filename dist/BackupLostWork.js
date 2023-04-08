!function (t, o) {
  if ('object' == typeof exports && 'object' == typeof module) module.exports = o(require('d3'), require('leaflet'), require('topojson-client'));
  else if ('function' == typeof define && define.amd) define(['d3',
    'leaflet',
    'topojson-client'], o);
  else {
    var e = 'object' == typeof exports ? o(require('d3'), require('leaflet'), require('topojson-client')) : o(t.d3, t.L, t.topojson);
    for (var i in e) ('object' == typeof exports ? exports : t) [i] = e[i]
  }
}(this, function (t, o, e) {
  return function (t) {
    function o(i) {
      if (e[i]) return e[i].exports;
      var n = e[i] = {
        i: i,
        l: !1,
        exports: {}
      };
      return t[i].call(n.exports, n, n.exports, o),
        n.l = !0,
        n.exports
    }

    var e = {};
    return o.m = t,
      o.c = e,
      o.i = function (t) {
        return t
      },
      o.d = function (t, e, i) {
        o.o(t, e) || Object.defineProperty(t, e, {
          configurable: !1,
          enumerable: !0,
          get: i
        })
      },
      o.n = function (t) {
        var e = t && t.__esModule ? function () {
            return t.default
          }
          : function () {
            return t
          };
        return o.d(e, 'a', e),
          e
      },
      o.o = function (t, o) {
        return Object.prototype.hasOwnProperty.call(t, o)
      },
      o.p = '',
      o(o.s = 3)
  }([function (o, e) {
    o.exports = t
  },
    function (t, e) {
      t.exports = o
    },
    function (t, o) {
      t.exports = e
    },
    function (t, o, e) {
      'use strict';

      function i(t, o) {
        if (!(t instanceof o)) throw new TypeError('Cannot call a class as a function')
      }

      function n(t, o) {
        if (!t) throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
        return !o || 'object' != typeof o && 'function' != typeof o ? t : o
      }

      function r(t, o) {
        if ('function' != typeof o && null !== o) throw new TypeError('Super expression must either be null or a function, not ' + typeof o);
        t.prototype = Object.create(o && o.prototype, {
          constructor: {
            value: t,
            enumerable: !1,
            writable: !0,
            configurable: !0
          }
        }),
        o && (Object.setPrototypeOf ? Object.setPrototypeOf(t, o) : t.__proto__ = o)
      }

      Object.defineProperty(o, '__esModule', {
        value: !0
      });
      var a = function () {
        function t(t, o) {
          for (var e = 0; e < o.length; e++) {
            var i = o[e];
            i.enumerable = i.enumerable || !1,
              i.configurable = !0,
            'value' in i && (i.writable = !0),
              Object.defineProperty(t, i.key, i)
          }
        }

        return function (o, e, i) {
          return e && t(o.prototype, e),
          i && t(o, i),
            o
        }
      }();
      e(0);
      var s = e(1),
        p = function (t) {
          return t && t.__esModule ? t : {
            default:
            t
          }
        }(s);
      e(2);
      var l = function (t) {
        function o() {
          return i(this, o),
            n(this, (o.__proto__ || Object.getPrototypeOf(o)).apply(this, arguments))
        }

        return r(o, t),
          a(o, [
            {
              key: 'initialize',
              value: function (t) {
                p.default.Util.setOptions(this, t),
                  console.assert('number' == typeof this.options.width, 'width must be number px'),
                  console.assert('number' == typeof this.options.height, 'height must be number px'),
                  console.assert('number' == typeof this.options.duration, 'duration must be number ms'),
                this.options.height !== this.options.width && console.warn('You have asked for a different height then width, this is currently buggy only circles.'),
                'number' == typeof this.options.radius && (this.options.width = 2 * this.options.radius, this.options.height = 2 * this.options.radius)
              }
            },
            {
              key: 'onAdd',
              value: function (t) {
                return this._mainMap = t,
                  this._container = p.default.DomUtil.create('div', 'leaflet-control-minimap'),
                  this._pad = this.options.globeStrokeWidth || 0,
                !0 === this.options.globeStrokeWidth && (this._pad = this.options.width / 5),
                  this._container.style.width = this.options.width + this._pad + 'px',
                  this._container.style.height = this.options.height + this._pad + 'px',
                  p.default.DomEvent.disableClickPropagation(this._container),
                  p.default.DomEvent.on(this._container, 'mousewheel', p.default.DomEvent.stopPropagation),
                  this._userToggledDisplay = !1,
                  this._minimized = !1,
                  this._mainMap.on('moveend', this._onMainMapMoved, this),
                  this._container
              }
            },
            {
              key: 'addTo',
              value: function (t) {
                return p.default.Control.prototype.addTo.call(this, t),
                  this.initCanvas(),
                'function' == typeof this.options.onAdd && this.options.onAdd(t, this),
                  this
              }
            },
            {
              key: 'initCanvas',
              value: function () {
                var w = this.options.width,
                  h = this.options.height,
                  p2 = this._pad / 2,
                  sx = 0.01 * (w + this._pad) / 82,
                  sy = 0.01 * (h + this._pad) / 82,
                  ox = 0.5 * (w + this._pad) * 1 / sx,
                  oy = 0.5 * (h + this._pad) * 1 / sy,
                  offset = 'scale(' + sx + ',-' + sy + '),translate(' + (ox - 400) + ',-' + a + ')';
                console.log('offset: ', offset),
                  d3.select('.leaflet-control-minimap').append('svg').attr('width', w + this._pad).attr('height', h + this._pad).attr('style', 'position: absolute; left: 0; top: 0;').append('path').attr('d', 'm 768,896 q 0,106 -75,181 -75,75 -181,75 -106,0 -181,-75 -75,-75 -75,-181 0,-106 75,-181 75,-75 181,-75 106,0 181,75 75,75 75,181 z m 256,0 q 0,-109 -33,-179 L 627,-57 q -16,-33 -47.5,-52 -31.5,-19 -67.5,-19 -36,0 -67.5,19 Q 413,-90 398,-57 L 33,717 Q 0,787 0,896 q 0,212 150,362 150,150 362,150 212,0 362,-150 150,-150 150,-362 z').attr('transform', offset).attr('style', 'fill:' + this.options.marker);
                var p = (w + h) / 4;
                this.projection = d3.geo.orthographic().scale(p).translate([p2 + w / 2,
                  p2 + w / 2]).rotate([0,
                  0]).clipAngle(90);
                var canvas = d3.select('.leaflet-control-minimap').append('canvas').attr('width', w + this._pad).attr('height', h + this._pad);
                this.c = canvas.node().getContext('2d'),
                  this.path = d3.geo.path().projection(this.projection).context(this.c);
                var that = this;
                d3.json(this.options.topojsonSrc, function (t) {
                  that.globe = {
                    type: 'Sphere'
                  },
                    that.land = topojson.feature(t, t.objects.land)
                }),
                  this.transitionMap(this._mainMap.getCenter(), 0)
              }
            },
            {
              key: 'hackMation',
              value: function (t, o, e) {
                e = e || this,
                  t = t || 40,
                  o = o || 400,
                t < o && (t += 3, e.setSize(t), setTimeout(e.hackMation, 15, t, o, e))
              }
            },
            {
              key: 'transitionMap',
              value: function (t, o) {
                'number' != typeof o && (o = o || this.options.duration);
                var that = this,
                  c = that.c,
                  n = that.path;
                d3.transition().duration(o).each('start', function () {
                }).tween('rotate', function () {
                  var r = d3.interpolate(that.projection.rotate(), [
                      -t.lng,
                      -t.lat
                    ]),
                    pw = that.options.width + that._pad,
                    ph = that.options.height + that._pad;
                  return function (t) {
                    if (that.projection.rotate(r(t)), console.log(pw, ph, that._pad, that.options.width), c.clearRect(0, 0, pw, ph), that.options.shadow) {
                      var s = that.options.shadow,
                        p = pw / 100,
                        l = pw / 100;
                      c.filter = 'drop-shadow(' + l + 'px ' + l + 'px ' + p + 'px ' + s + ')'
                    }
                    if (console.log(c.filter),
                      c.fillStyle = that.options.water,
                      c.beginPath(), n(that.globe),
                      c.fill(),
                      that.options.globeStroke) {

                      if (c.save(),
                        c.strokeStyle = that.options.globeStroke,
                        that.options.globeBlur) {
                        var h = that.options.globeBlur;
                        !0 === that.options.globeBlur && (h = that._pad / 4),
                          c.filter = 'blur(' + h + 'px)'
                      }
                      c.lineWidth = that._pad || 2,
                        c.beginPath(),
                        n(that.globe),
                        c.stroke(),
                        c.restore()
                    }
                    c.fillStyle = that.options.land,
                      c.filter = '',
                      c.beginPath(),
                      n(that.land),
                      c.fill(),
                    that.options.landStroke && (c.save(),
                      c.strokeStyle = that.options.landStroke,
                      c.lineWidth = that.options.landStrokeWidth || 2,
                      c.beginPath(), n(that.land),
                      c.stroke(),
                      c.restore())
                  }
                })
              }
            },
            {
              key: 'onRemove',
              value: function (t) {
                this._mainMap.off('moveend', this._onMainMapMoved, this),
                  this._mainMap.off('move', this._onMainMapMoving, this),
                'function' == typeof this.options.onRemove && this.options.onRemove(t, this)
              }
            },
            {
              key: 'setSize',
              value: function (t, o) {
                this.options.width = t,
                  this.options.height = o || t,
                this._map && this.remove().addTo(this._mainMap)
              }
            },
            {
              key: '_onMainMapMoved',
              value: function (t) {
                this._miniMapMoving ? this._miniMapMoving = !1 : (this._mainMapMoving = !0, this.transitionMap(this._mainMap.getCenter()))
              }
            }
          ]),
          o
      }(p.default.Control);
      l.prototype.options = {
        position: 'bottomright',
        width: 82,
        height: 82,
        land: '#bbb',
        water: 'rgba(0, 0, 0, 0.3)',
        marker: '#CC0000',
        topojsonSrc: 'data/world.json',
        duration: 1250,
        onAdd: !1,
        onRemove: !1,
        globeStroke: !1,
        globeStrokeWidth: 4,
        landStroke: !1,
        landStrokeWidth: 1
      },
        p.default.Control.GlobeMiniMap = l,
        o.default = l,
        p.default.control.globeminimap = function (t, o) {
          return new p.default.Control.GlobeMiniMap(t, o)
        },
        p.default.Map.mergeOptions({
          miniMapControl: !1
        }),
        p.default.Map.addInitHook(function () {
          this.options.miniMapControl && (this.miniMapControl = (new GlobeMiniMap).addTo(this))
        })
    }
  ])
});
