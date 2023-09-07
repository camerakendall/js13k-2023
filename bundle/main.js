(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  /**
   * @preserve
   * Kontra.js v9.0.0
   */
  let noop = () => {};

  /**
   * Remove an item from an array.
   *
   * @param {*[]} array - Array to remove from.
   * @param {*} item - Item to remove.
   *
   * @returns {Boolean|undefined} True if the item was removed.
   */
  function removeFromArray(array, item) {
    let index = array.indexOf(item);
    if (index != -1) {
      array.splice(index, 1);
      return true;
    }
  }

  /**
   * A simple event system. Allows you to hook into Kontra lifecycle events or create your own, such as for [Plugins](api/plugin).
   *
   * ```js
   * import { on, off, emit } from 'kontra';
   *
   * function callback(a, b, c) {
   *   console.log({a, b, c});
   * });
   *
   * on('myEvent', callback);
   * emit('myEvent', 1, 2, 3);  //=> {a: 1, b: 2, c: 3}
   * off('myEvent', callback);
   * ```
   * @sectionName Events
   */

  // expose for testing
  let callbacks$2 = {};

  /**
   * There are currently only three lifecycle events:
   * - `init` - Emitted after `kontra.init()` is called.
   * - `tick` - Emitted every frame of [GameLoop](api/gameLoop) before the loops `update()` and `render()` functions are called.
   * - `assetLoaded` - Emitted after an asset has fully loaded using the asset loader. The callback function is passed the asset and the url of the asset as parameters.
   * @sectionName Lifecycle Events
   */

  /**
   * Register a callback for an event to be called whenever the event is emitted. The callback will be passed all arguments used in the `emit` call.
   * @function on
   *
   * @param {String} event - Name of the event.
   * @param {Function} callback - Function that will be called when the event is emitted.
   */
  function on(event, callback) {
    callbacks$2[event] = callbacks$2[event] || [];
    callbacks$2[event].push(callback);
  }

  /**
   * Call all callback functions for the event. All arguments will be passed to the callback functions.
   * @function emit
   *
   * @param {String} event - Name of the event.
   * @param {...*} args - Comma separated list of arguments passed to all callbacks.
   */
  function emit(event, ...args) {
    (callbacks$2[event] || []).map(fn => fn(...args));
  }

  /**
   * Functions for initializing the Kontra library and getting the canvas and context
   * objects.
   *
   * ```js
   * import { getCanvas, getContext, init } from 'kontra';
   *
   * let { canvas, context } = init();
   *
   * // or can get canvas and context through functions
   * canvas = getCanvas();
   * context = getContext();
   * ```
   * @sectionName Core
   */

  let canvasEl, context$1;

  // allow contextless environments, such as using ThreeJS as the main
  // canvas, by proxying all canvas context calls
  let handler$1 = {
    // by using noop we can proxy both property and function calls
    // so neither will throw errors
    get(target, key) {
      // export for testing
      if (key == '_proxy') return true;
      return noop;
    }
  };

  /**
   * Return the context object.
   * @function getContext
   *
   * @returns {CanvasRenderingContext2D} The context object the game draws to.
   */
  function getContext() {
    return context$1;
  }

  /**
   * Initialize the library and set up the canvas. Typically you will call `init()` as the first thing and give it the canvas to use. This will allow all Kontra objects to reference the canvas when created.
   *
   * ```js
   * import { init } from 'kontra';
   *
   * let { canvas, context } = init('game');
   * ```
   * @function init
   *
   * @param {String|HTMLCanvasElement} [canvas] - The canvas for Kontra to use. Can either be the ID of the canvas element or the canvas element itself. Defaults to using the first canvas element on the page.
   * @param {Object} [options] - Game options.
   * @param {Boolean} [options.contextless=false] - If the game will run in an contextless environment. A contextless environment uses a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) for the `canvas` and `context` so all property and function calls will noop.
   *
   * @returns {{canvas: HTMLCanvasElement, context: CanvasRenderingContext2D}} An object with properties `canvas` and `context`. `canvas` it the canvas element for the game and `context` is the context object the game draws to.
   */
  function init$1(canvas, { contextless = false } = {}) {
    // check if canvas is a string first, an element next, or default to
    // getting first canvas on page
    canvasEl =
      document.getElementById(canvas) ||
      canvas ||
      document.querySelector('canvas');

    if (contextless) {
      canvasEl = canvasEl || new Proxy({}, handler$1);
    }

    // @ifdef DEBUG
    if (!canvasEl) {
      throw Error('You must provide a canvas element for the game');
    }
    // @endif

    context$1 = canvasEl.getContext('2d') || new Proxy({}, handler$1);
    context$1.imageSmoothingEnabled = false;

    emit('init');

    return { canvas: canvasEl, context: context$1 };
  }

  /**
   * Rotate a point by an angle.
   * @function rotatePoint
   *
   * @param {{x: Number, y: Number}} point - The {x,y} point to rotate.
   * @param {Number} angle - Angle (in radians) to rotate.
   *
   * @returns {{x: Number, y: Number}} The new x and y coordinates after rotation.
   */
  function rotatePoint(point, angle) {
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);

    return {
      x: point.x * cos - point.y * sin,
      y: point.x * sin + point.y * cos
    };
  }

  /**
   * Clamp a number between two values, preventing it from going below or above the minimum and maximum values.
   * @function clamp
   *
   * @param {Number} min - Min value.
   * @param {Number} max - Max value.
   * @param {Number} value - Value to clamp.
   *
   * @returns {Number} Value clamped between min and max.
   */
  function clamp(min, max, value) {
    return Math.min(Math.max(min, value), max);
  }

  /**
   * A simple 2d vector object. Takes either separate `x` and `y` coordinates or a Vector-like object.
   *
   * ```js
   * import { Vector } from 'kontra';
   *
   * let vector = Vector(100, 200);
   * let vector2 = Vector({x: 100, y: 200});
   * ```
   * @class Vector
   *
   * @param {Number|{x: number, y: number}} [x=0] - X coordinate of the vector or a Vector-like object. If passing an object, the `y` param is ignored.
   * @param {Number} [y=0] - Y coordinate of the vector.
   */
  class Vector {
    constructor(x = 0, y = 0, vec = {}) {
      if (x.x != undefined) {
        this.x = x.x;
        this.y = x.y;
      }
      else {
        this.x = x;
        this.y = y;
      }

      // @ifdef VECTOR_CLAMP
      // preserve vector clamping when creating new vectors
      if (vec._c) {
        this.clamp(vec._a, vec._b, vec._d, vec._e);

        // reset x and y so clamping takes effect
        this.x = x;
        this.y = y;
      }
      // @endif
    }

    /**
     * Set the x and y coordinate of the vector.
     * @memberof Vector
     * @function set
     *
     * @param {Vector|{x: number, y: number}} vector - Vector to set coordinates from.
     */
    set(vec) {
      this.x = vec.x;
      this.y = vec.y;
    }

    /**
     * Calculate the addition of the current vector with the given vector.
     * @memberof Vector
     * @function add
     *
     * @param {Vector|{x: number, y: number}} vector - Vector to add to the current Vector.
     *
     * @returns {Vector} A new Vector instance whose value is the addition of the two vectors.
     */
    add(vec) {
      return new Vector(this.x + vec.x, this.y + vec.y, this);
    }

    // @ifdef VECTOR_SUBTRACT
    /**
     * Calculate the subtraction of the current vector with the given vector.
     * @memberof Vector
     * @function subtract
     *
     * @param {Vector|{x: number, y: number}} vector - Vector to subtract from the current Vector.
     *
     * @returns {Vector} A new Vector instance whose value is the subtraction of the two vectors.
     */
    subtract(vec) {
      return new Vector(this.x - vec.x, this.y - vec.y, this);
    }
    // @endif

    // @ifdef VECTOR_SCALE
    /**
     * Calculate the multiple of the current vector by a value.
     * @memberof Vector
     * @function scale
     *
     * @param {Number} value - Value to scale the current Vector.
     *
     * @returns {Vector} A new Vector instance whose value is multiplied by the scalar.
     */
    scale(value) {
      return new Vector(this.x * value, this.y * value);
    }
    // @endif

    // @ifdef VECTOR_NORMALIZE
    /**
     * Calculate the normalized value of the current vector. Requires the Vector [length](api/vector#length) function.
     * @memberof Vector
     * @function normalize
     *
     * @returns {Vector} A new Vector instance whose value is the normalized vector.
     */
    // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
    normalize(length = this.length() || 1) {
      return new Vector(this.x / length, this.y / length);
    }
    // @endif

    // @ifdef VECTOR_DOT||VECTOR_ANGLE
    /**
     * Calculate the dot product of the current vector with the given vector.
     * @memberof Vector
     * @function dot
     *
     * @param {Vector|{x: number, y: number}} vector - Vector to dot product against.
     *
     * @returns {Number} The dot product of the vectors.
     */
    dot(vec) {
      return this.x * vec.x + this.y * vec.y;
    }
    // @endif

    // @ifdef VECTOR_LENGTH||VECTOR_NORMALIZE||VECTOR_ANGLE
    /**
     * Calculate the length (magnitude) of the Vector.
     * @memberof Vector
     * @function length
     *
     * @returns {Number} The length of the vector.
     */
    length() {
      return Math.hypot(this.x, this.y);
    }
    // @endif

    // @ifdef VECTOR_DISTANCE
    /**
     * Calculate the distance between the current vector and the given vector.
     * @memberof Vector
     * @function distance
     *
     * @param {Vector|{x: number, y: number}} vector - Vector to calculate the distance between.
     *
     * @returns {Number} The distance between the two vectors.
     */
    distance(vec) {
      return Math.hypot(this.x - vec.x, this.y - vec.y);
    }
    // @endif

    // @ifdef VECTOR_ANGLE
    /**
     * Calculate the angle (in radians) between the current vector and the given vector. Requires the Vector [dot](api/vector#dot) and [length](api/vector#length) functions.
     * @memberof Vector
     * @function angle
     *
     * @param {Vector} vector - Vector to calculate the angle between.
     *
     * @returns {Number} The angle (in radians) between the two vectors.
     */
    angle(vec) {
      return Math.acos(this.dot(vec) / (this.length() * vec.length()));
    }
    // @endif

    // @ifdef VECTOR_DIRECTION
    /**
     * Calculate the angle (in radians) of the current vector.
     * @memberof Vector
     * @function direction
     *
     * @returns {Number} The angle (in radians) of the vector.
     */
    direction() {
      return Math.atan2(this.y, this.x);
    }
    // @endif

    // @ifdef VECTOR_CLAMP
    /**
     * Clamp the Vector between two points, preventing `x` and `y` from going below or above the minimum and maximum values. Perfect for keeping a sprite from going outside the game boundaries.
     *
     * ```js
     * import { Vector } from 'kontra';
     *
     * let vector = Vector(100, 200);
     * vector.clamp(0, 0, 200, 300);
     *
     * vector.x += 200;
     * console.log(vector.x);  //=> 200
     *
     * vector.y -= 300;
     * console.log(vector.y);  //=> 0
     *
     * vector.add({x: -500, y: 500});
     * console.log(vector);    //=> {x: 0, y: 300}
     * ```
     * @memberof Vector
     * @function clamp
     *
     * @param {Number} xMin - Minimum x value.
     * @param {Number} yMin - Minimum y value.
     * @param {Number} xMax - Maximum x value.
     * @param {Number} yMax - Maximum y value.
     */
    clamp(xMin, yMin, xMax, yMax) {
      this._c = true;
      this._a = xMin;
      this._b = yMin;
      this._d = xMax;
      this._e = yMax;
    }

    /**
     * X coordinate of the vector.
     * @memberof Vector
     * @property {Number} x
     */
    get x() {
      return this._x;
    }

    /**
     * Y coordinate of the vector.
     * @memberof Vector
     * @property {Number} y
     */
    get y() {
      return this._y;
    }

    set x(value) {
      this._x = this._c ? clamp(this._a, this._d, value) : value;
    }

    set y(value) {
      this._y = this._c ? clamp(this._b, this._e, value) : value;
    }
    // @endif
  }

  function factory$a() {
    return new Vector(...arguments);
  }

  /**
   * This is a private class that is used just to help make the GameObject class more manageable and smaller.
   *
   * It maintains everything that can be changed in the update function:
   * position
   * velocity
   * acceleration
   * ttl
   */
  class Updatable {
    constructor(properties) {
      return this.init(properties);
    }

    init(properties = {}) {
      // --------------------------------------------------
      // defaults
      // --------------------------------------------------

      /**
       * The game objects position vector. Represents the local position of the object as opposed to the [world](api/gameObject#world) position.
       * @property {Vector} position
       * @memberof GameObject
       * @page GameObject
       */
      this.position = factory$a();

      // --------------------------------------------------
      // optionals
      // --------------------------------------------------

      // @ifdef GAMEOBJECT_VELOCITY
      /**
       * The game objects velocity vector.
       * @memberof GameObject
       * @property {Vector} velocity
       * @page GameObject
       */
      this.velocity = factory$a();
      // @endif

      // @ifdef GAMEOBJECT_ACCELERATION
      /**
       * The game objects acceleration vector.
       * @memberof GameObject
       * @property {Vector} acceleration
       * @page GameObject
       */
      this.acceleration = factory$a();
      // @endif

      // @ifdef GAMEOBJECT_TTL
      /**
       * How may frames the game object should be alive.
       * @memberof GameObject
       * @property {Number} ttl
       * @page GameObject
       */
      this.ttl = Infinity;
      // @endif

      // add all properties to the object, overriding any defaults
      Object.assign(this, properties);
    }

    /**
     * Update the position of the game object and all children using their velocity and acceleration. Calls the game objects [advance()](api/gameObject#advance) function.
     * @memberof GameObject
     * @function update
     * @page GameObject
     *
     * @param {Number} [dt] - Time since last update.
     */
    update(dt) {
      this.advance(dt);
    }

    /**
     * Move the game object by its acceleration and velocity. If you pass `dt` it will multiply the vector and acceleration by that number. This means the `dx`, `dy`, `ddx` and `ddy` should be how far you want the object to move in 1 second rather than in 1 frame.
     *
     * If you override the game objects [update()](api/gameObject#update) function with your own update function, you can call this function to move the game object normally.
     *
     * ```js
     * import { GameObject } from 'kontra';
     *
     * let gameObject = GameObject({
     *   x: 100,
     *   y: 200,
     *   width: 20,
     *   height: 40,
     *   dx: 5,
     *   dy: 2,
     *   update: function() {
     *     // move the game object normally
     *     this.advance();
     *
     *     // change the velocity at the edges of the canvas
     *     if (this.x < 0 ||
     *         this.x + this.width > this.context.canvas.width) {
     *       this.dx = -this.dx;
     *     }
     *     if (this.y < 0 ||
     *         this.y + this.height > this.context.canvas.height) {
     *       this.dy = -this.dy;
     *     }
     *   }
     * });
     * ```
     * @memberof GameObject
     * @function advance
     * @page GameObject
     *
     * @param {Number} [dt] - Time since last update.
     *
     */
    advance(dt) {
      // @ifdef GAMEOBJECT_VELOCITY
      // @ifdef GAMEOBJECT_ACCELERATION
      let acceleration = this.acceleration;

      // @ifdef VECTOR_SCALE
      if (dt) {
        acceleration = acceleration.scale(dt);
      }
      // @endif

      this.velocity = this.velocity.add(acceleration);
      // @endif
      // @endif

      // @ifdef GAMEOBJECT_VELOCITY
      let velocity = this.velocity;

      // @ifdef VECTOR_SCALE
      if (dt) {
        velocity = velocity.scale(dt);
      }
      // @endif

      this.position = this.position.add(velocity);
      this._pc();
      // @endif

      // @ifdef GAMEOBJECT_TTL
      this.ttl--;
      // @endif
    }

    // --------------------------------------------------
    // velocity
    // --------------------------------------------------

    // @ifdef GAMEOBJECT_VELOCITY
    /**
     * X coordinate of the velocity vector.
     * @memberof GameObject
     * @property {Number} dx
     * @page GameObject
     */
    get dx() {
      return this.velocity.x;
    }

    /**
     * Y coordinate of the velocity vector.
     * @memberof GameObject
     * @property {Number} dy
     * @page GameObject
     */
    get dy() {
      return this.velocity.y;
    }

    set dx(value) {
      this.velocity.x = value;
    }

    set dy(value) {
      this.velocity.y = value;
    }
    // @endif

    // --------------------------------------------------
    // acceleration
    // --------------------------------------------------

    // @ifdef GAMEOBJECT_ACCELERATION
    /**
     * X coordinate of the acceleration vector.
     * @memberof GameObject
     * @property {Number} ddx
     * @page GameObject
     */
    get ddx() {
      return this.acceleration.x;
    }

    /**
     * Y coordinate of the acceleration vector.
     * @memberof GameObject
     * @property {Number} ddy
     * @page GameObject
     */
    get ddy() {
      return this.acceleration.y;
    }

    set ddx(value) {
      this.acceleration.x = value;
    }

    set ddy(value) {
      this.acceleration.y = value;
    }
    // @endif

    // --------------------------------------------------
    // ttl
    // --------------------------------------------------

    // @ifdef GAMEOBJECT_TTL
    /**
     * Check if the game object is alive.
     * @memberof GameObject
     * @function isAlive
     * @page GameObject
     *
     * @returns {Boolean} `true` if the game objects [ttl](api/gameObject#ttl) property is above `0`, `false` otherwise.
     */
    isAlive() {
      return this.ttl > 0;
    }
    // @endif

    _pc() {}
  }

  /**
   * The base class of most renderable classes. Handles things such as position, rotation, anchor, and the update and render life cycle.
   *
   * Typically you don't create a GameObject directly, but rather extend it for new classes.
   * @class GameObject
   *
   * @param {Object} [properties] - Properties of the game object.
   * @param {Number} [properties.x] - X coordinate of the position vector.
   * @param {Number} [properties.y] - Y coordinate of the position vector.
   * @param {Number} [properties.width] - Width of the game object.
   * @param {Number} [properties.height] - Height of the game object.
   *
   * @param {CanvasRenderingContext2D} [properties.context] - The context the game object should draw to. Defaults to [core.getContext()](api/core#getContext).
   *
   * @param {Number} [properties.dx] - X coordinate of the velocity vector.
   * @param {Number} [properties.dy] - Y coordinate of the velocity vector.
   * @param {Number} [properties.ddx] - X coordinate of the acceleration vector.
   * @param {Number} [properties.ddy] - Y coordinate of the acceleration vector.
   * @param {Number} [properties.ttl=Infinity] - How many frames the game object should be alive. Used by [Pool](api/pool).
   *
   * @param {{x: Number, y: Number}} [properties.anchor={x:0,y:0}] - The x and y origin of the game object. {x:0, y:0} is the top left corner of the game object, {x:1, y:1} is the bottom right corner.
   * @param {GameObject[]} [properties.children] - Children to add to the game object.
   * @param {Number} [properties.opacity=1] - The opacity of the game object.
   * @param {Number} [properties.rotation=0] - The rotation around the anchor in radians.
   * @param {Number} [properties.scaleX=1] - The x scale of the game object.
   * @param {Number} [properties.scaleY=1] - The y scale of the game object.
   *
   * @param {(dt?: Number) => void} [properties.update] - Function called every frame to update the game object.
   * @param {Function} [properties.render] - Function called every frame to render the game object.
   *
   * @param {...*} properties.props - Any additional properties you need added to the game object. For example, if you pass `gameObject({type: 'player'})` then the game object will also have a property of the same name and value. You can pass as many additional properties as you want.
   */
  class GameObject extends Updatable {
    /**
     * @docs docs/api_docs/gameObject.js
     */

    /**
     * Use this function to reinitialize a game object. It takes the same properties object as the constructor. Useful it you want to repurpose a game object.
     * @memberof GameObject
     * @function init
     *
     * @param {Object} properties - Properties of the game object.
     */
    init({
      // --------------------------------------------------
      // defaults
      // --------------------------------------------------

      /**
       * The width of the game object. Represents the local width of the object as opposed to the [world](api/gameObject#world) width.
       * @memberof GameObject
       * @property {Number} width
       */
      width = 0,

      /**
       * The height of the game object. Represents the local height of the object as opposed to the [world](api/gameObject#world) height.
       * @memberof GameObject
       * @property {Number} height
       */
      height = 0,

      /**
       * The context the game object will draw to.
       * @memberof GameObject
       * @property {CanvasRenderingContext2D} context
       */
      context = getContext(),

      render = this.draw,
      update = this.advance,

      // --------------------------------------------------
      // optionals
      // --------------------------------------------------

      // @ifdef GAMEOBJECT_GROUP
      /**
       * The game objects parent object.
       * @memberof GameObject
       * @property {GameObject|null} parent
       */

      /**
       * The game objects children objects.
       * @memberof GameObject
       * @property {GameObject[]} children
       */
      children = [],
      // @endif

      // @ifdef GAMEOBJECT_ANCHOR
      /**
       * The x and y origin of the game object. {x:0, y:0} is the top left corner of the game object, {x:1, y:1} is the bottom right corner.
       * @memberof GameObject
       * @property {{x: Number, y: Number}} anchor
       *
       * @example
       * // exclude-code:start
       * let { GameObject } = kontra;
       * // exclude-code:end
       * // exclude-script:start
       * import { GameObject } from 'kontra';
       * // exclude-script:end
       *
       * let gameObject = GameObject({
       *   x: 150,
       *   y: 100,
       *   width: 50,
       *   height: 50,
       *   color: 'red',
       *   // exclude-code:start
       *   context: context,
       *   // exclude-code:end
       *   render: function() {
       *     this.context.fillStyle = this.color;
       *     this.context.fillRect(0, 0, this.height, this.width);
       *   }
       * });
       *
       * function drawOrigin(gameObject) {
       *   gameObject.context.fillStyle = 'yellow';
       *   gameObject.context.beginPath();
       *   gameObject.context.arc(gameObject.x, gameObject.y, 3, 0, 2*Math.PI);
       *   gameObject.context.fill();
       * }
       *
       * gameObject.render();
       * drawOrigin(gameObject);
       *
       * gameObject.anchor = {x: 0.5, y: 0.5};
       * gameObject.x = 300;
       * gameObject.render();
       * drawOrigin(gameObject);
       *
       * gameObject.anchor = {x: 1, y: 1};
       * gameObject.x = 450;
       * gameObject.render();
       * drawOrigin(gameObject);
       */
      anchor = { x: 0, y: 0 },
      // @endif

      // @ifdef GAMEOBJECT_OPACITY
      /**
       * The opacity of the object. Represents the local opacity of the object as opposed to the [world](api/gameObject#world) opacity.
       * @memberof GameObject
       * @property {Number} opacity
       */
      opacity = 1,
      // @endif

      // @ifdef GAMEOBJECT_ROTATION
      /**
       * The rotation of the game object around the anchor in radians. Represents the local rotation of the object as opposed to the [world](api/gameObject#world) rotation.
       * @memberof GameObject
       * @property {Number} rotation
       */
      rotation = 0,
      // @endif

      // @ifdef GAMEOBJECT_SCALE
      /**
       * The x scale of the object. Represents the local x scale of the object as opposed to the [world](api/gameObject#world) x scale.
       * @memberof GameObject
       * @property {Number} scaleX
       */
      scaleX = 1,

      /**
       * The y scale of the object. Represents the local y scale of the object as opposed to the [world](api/gameObject#world) y scale.
       * @memberof GameObject
       * @property {Number} scaleY
       */
      scaleY = 1,
      // @endif

      ...props
    } = {}) {
      // @ifdef GAMEOBJECT_GROUP
      this._c = [];
      // @endif

      // by setting defaults to the parameters and passing them into
      // the init, we can ensure that a parent class can set overriding
      // defaults and the GameObject won't undo it (if we set
      // `this.width` then no parent could provide a default value for
      // width)
      super.init({
        width,
        height,
        context,

        // @ifdef GAMEOBJECT_ANCHOR
        anchor,
        // @endif

        // @ifdef GAMEOBJECT_OPACITY
        opacity,
        // @endif

        // @ifdef GAMEOBJECT_ROTATION
        rotation,
        // @endif

        // @ifdef GAMEOBJECT_SCALE
        scaleX,
        scaleY,
        // @endif

        ...props
      });

      // di = done init
      this._di = true;
      this._uw();

      // @ifdef GAMEOBJECT_GROUP
      this.addChild(children);
      // @endif

      // rf = render function
      this._rf = render;

      // uf = update function
      this._uf = update;

      on('init', () => {
        this.context ??= getContext();
      });
    }

    /**
     * Update all children
     */
    update(dt) {
      this._uf(dt);

      // @ifdef GAMEOBJECT_GROUP
      this.children.map(child => child.update && child.update(dt));
      // @endif
    }

    /**
     * Render the game object and all children. Calls the game objects [draw()](api/gameObject#draw) function.
     * @memberof GameObject
     * @function render
     */
    render() {
      let context = this.context;
      context.save();

      // 1) translate to position
      //
      // it's faster to only translate if one of the values is non-zero
      // rather than always translating
      // @see https://jsperf.com/translate-or-if-statement/2
      if (this.x || this.y) {
        context.translate(this.x, this.y);
      }

      // @ifdef GAMEOBJECT_ROTATION
      // 3) rotate around the anchor
      //
      // it's faster to only rotate when set rather than always rotating
      // @see https://jsperf.com/rotate-or-if-statement/2
      if (this.rotation) {
        context.rotate(this.rotation);
      }
      // @endif

      // @ifdef GAMEOBJECT_SCALE
      // 4) scale after translation to position so object can be
      // scaled in place (rather than scaling position as well).
      //
      // it's faster to only scale if one of the values is not 1
      // rather than always scaling
      // @see https://jsperf.com/scale-or-if-statement/4
      if (this.scaleX != 1 || this.scaleY != 1) {
        context.scale(this.scaleX, this.scaleY);
      }
      // @endif

      // @ifdef GAMEOBJECT_ANCHOR
      // 5) translate to the anchor so (0,0) is the top left corner
      // for the render function
      let anchorX = -this.width * this.anchor.x;
      let anchorY = -this.height * this.anchor.y;

      if (anchorX || anchorY) {
        context.translate(anchorX, anchorY);
      }
      // @endif

      // @ifdef GAMEOBJECT_OPACITY
      // it's not really any faster to gate the global alpha
      // @see https://jsperf.com/global-alpha-or-if-statement/1
      this.context.globalAlpha = this.opacity;
      // @endif

      this._rf();

      // @ifdef GAMEOBJECT_ANCHOR
      // 7) translate back to the anchor so children use the correct
      // x/y value from the anchor
      if (anchorX || anchorY) {
        context.translate(-anchorX, -anchorY);
      }
      // @endif

      // @ifdef GAMEOBJECT_GROUP
      // perform all transforms on the parent before rendering the
      // children
      let children = this.children;
      children.map(child => child.render && child.render());
      // @endif

      context.restore();
    }

    /**
     * Draw the game object at its X and Y position, taking into account rotation, scale, and anchor.
     *
     * Do note that the canvas has been rotated and translated to the objects position (taking into account anchor), so {0,0} will be the top-left corner of the game object when drawing.
     *
     * If you override the game objects `render()` function with your own render function, you can call this function to draw the game object normally.
     *
     * ```js
     * let { GameObject } = kontra;
     *
     * let gameObject = GameObject({
     *  x: 290,
     *  y: 80,
     *  width: 20,
     *  height: 40,
     *
     *  render: function() {
     *    // draw the game object normally (perform rotation and other transforms)
     *    this.draw();
     *
     *    // outline the game object
     *    this.context.strokeStyle = 'yellow';
     *    this.context.lineWidth = 2;
     *    this.context.strokeRect(0, 0, this.width, this.height);
     *  }
     * });
     *
     * gameObject.render();
     * ```
     * @memberof GameObject
     * @function draw
     */
    draw() {}

    /**
     * Sync property changes from the parent to the child
     */
    _pc() {
      this._uw();

      // @ifdef GAMEOBJECT_GROUP
      this.children.map(child => child._pc());
      // @endif
    }

    /**
     * X coordinate of the position vector.
     * @memberof GameObject
     * @property {Number} x
     */
    get x() {
      return this.position.x;
    }

    /**
     * Y coordinate of the position vector.
     * @memberof GameObject
     * @property {Number} y
     */
    get y() {
      return this.position.y;
    }

    set x(value) {
      this.position.x = value;

      // pc = property changed
      this._pc();
    }

    set y(value) {
      this.position.y = value;
      this._pc();
    }

    get width() {
      // w = width
      return this._w;
    }

    set width(value) {
      this._w = value;
      this._pc();
    }

    get height() {
      // h = height
      return this._h;
    }

    set height(value) {
      this._h = value;
      this._pc();
    }

    /**
     * Update world properties
     */
    _uw() {
      // don't update world properties until after the init has finished
      if (!this._di) return;

      // @ifdef GAMEOBJECT_GROUP||GAMEOBJECT_OPACITY||GAMEOBJECT_ROTATION||GAMEOBJECT_SCALE
      let {
        _wx = 0,
        _wy = 0,

        // @ifdef GAMEOBJECT_OPACITY
        _wo = 1,
        // @endif

        // @ifdef GAMEOBJECT_ROTATION
        _wr = 0,
        // @endif

        // @ifdef GAMEOBJECT_SCALE
        _wsx = 1,
        _wsy = 1
        // @endif
      } = this.parent || {};
      // @endif

      // wx = world x, wy = world y
      this._wx = this.x;
      this._wy = this.y;

      // ww = world width, wh = world height
      this._ww = this.width;
      this._wh = this.height;

      // @ifdef GAMEOBJECT_OPACITY
      // wo = world opacity
      this._wo = _wo * this.opacity;
      // @endif

      // @ifdef GAMEOBJECT_SCALE
      // wsx = world scale x, wsy = world scale y
      this._wsx = _wsx * this.scaleX;
      this._wsy = _wsy * this.scaleY;

      this._wx = this._wx * _wsx;
      this._wy = this._wy * _wsy;
      this._ww = this.width * this._wsx;
      this._wh = this.height * this._wsy;
      // @endif

      // @ifdef GAMEOBJECT_ROTATION
      // wr = world rotation
      this._wr = _wr + this.rotation;

      let { x, y } = rotatePoint({ x: this._wx, y: this._wy }, _wr);
      this._wx = x;
      this._wy = y;
      // @endif

      // @ifdef GAMEOBJECT_GROUP
      this._wx += _wx;
      this._wy += _wy;
      // @endif
    }

    /**
     * The world position, width, height, opacity, rotation, and scale. The world property is the true position, width, height, etc. of the object, taking into account all parents.
     *
     * The world property does not adjust for anchor or scale, so if you set a negative scale the world width or height could be negative. Use [getWorldRect](/api/helpers#getWorldRect) to get the world position and size adjusted for anchor and scale.
     * @property {{x: Number, y: Number, width: Number, height: Number, opacity: Number, rotation: Number, scaleX: Number, scaleY: Number}} world
     * @memberof GameObject
     */
    get world() {
      return {
        x: this._wx,
        y: this._wy,
        width: this._ww,
        height: this._wh,

        // @ifdef GAMEOBJECT_OPACITY
        opacity: this._wo,
        // @endif

        // @ifdef GAMEOBJECT_ROTATION
        rotation: this._wr,
        // @endif

        // @ifdef GAMEOBJECT_SCALE
        scaleX: this._wsx,
        scaleY: this._wsy
        // @endif
      };
    }

    // --------------------------------------------------
    // group
    // --------------------------------------------------

    // @ifdef GAMEOBJECT_GROUP
    set children(value) {
      this.removeChild(this._c);
      this.addChild(value);
    }

    get children() {
      return this._c;
    }

    /**
     * Add an object as a child to this object. The objects position, size, and rotation will be relative to the parents position, size, and rotation. The childs [world](api/gameObject#world) property will be updated to take into account this object and all of its parents.
     * @memberof GameObject
     * @function addChild
     *
     * @param {...(GameObject|GameObject[])[]} objects - Object to add as a child. Can be a single object, an array of objects, or a comma-separated list of objects.
     *
     * @example
     * // exclude-code:start
     * let { GameObject } = kontra;
     * // exclude-code:end
     * // exclude-script:start
     * import { GameObject } from 'kontra';
     * // exclude-script:end
     *
     * function createObject(x, y, color, size = 1) {
     *   return GameObject({
     *     x,
     *     y,
     *     width: 50 / size,
     *     height: 50 / size,
     *     anchor: {x: 0.5, y: 0.5},
     *     color,
     *     // exclude-code:start
     *     context: context,
     *     // exclude-code:end
     *     render: function() {
     *       this.context.fillStyle = this.color;
     *       this.context.fillRect(0, 0, this.height, this.width);
     *     }
     *   });
     * }
     *
     * let parent = createObject(300, 100, 'red');
     *
     * // create a child that is 25px to the right and
     * // down from the parents position
     * let child = createObject(25, 25, 'yellow', 2);
     *
     * parent.addChild(child);
     *
     * parent.render();
     */
    addChild(...objects) {
      objects.flat().map(child => {
        this.children.push(child);
        child.parent = this;
        child._pc = child._pc || noop;
        child._pc();
      });
    }

    /**
     * Remove an object as a child of this object. The removed objects [world](api/gameObject#world) property will be updated to not take into account this object and all of its parents.
     * @memberof GameObject
     * @function removeChild
     *
     * @param {...(GameObject|GameObject[])[]} objects - Object to remove as a child. Can be a single object, an array of objects, or a comma-separated list of objects.
     */
    removeChild(...objects) {
      objects.flat().map(child => {
        if (removeFromArray(this.children, child)) {
          child.parent = null;
          child._pc();
        }
      });
    }
    // @endif

    // --------------------------------------------------
    // opacity
    // --------------------------------------------------

    // @ifdef GAMEOBJECT_OPACITY
    get opacity() {
      return this._opa;
    }

    set opacity(value) {
      this._opa = clamp(0, 1, value);
      this._pc();
    }
    // @endif

    // --------------------------------------------------
    // rotation
    // --------------------------------------------------

    // @ifdef GAMEOBJECT_ROTATION
    get rotation() {
      return this._rot;
    }

    set rotation(value) {
      this._rot = value;
      this._pc();
    }
    // @endif

    // --------------------------------------------------
    // scale
    // --------------------------------------------------

    // @ifdef GAMEOBJECT_SCALE
    /**
     * Set the x and y scale of the object. If only one value is passed, both are set to the same value.
     * @memberof GameObject
     * @function setScale
     *
     * @param {Number} x - X scale value.
     * @param {Number} [y=x] - Y scale value.
     */
    setScale(x, y = x) {
      this.scaleX = x;
      this.scaleY = y;
    }

    get scaleX() {
      return this._scx;
    }

    set scaleX(value) {
      this._scx = value;
      this._pc();
    }

    get scaleY() {
      return this._scy;
    }

    set scaleY(value) {
      this._scy = value;
      this._pc();
    }
    // @endif
  }

  /**
   * A versatile way to update and draw your sprites. It can handle simple rectangles, images, and sprite sheet animations. It can be used for your main player object as well as tiny particles in a particle engine.
   * @class Sprite
   * @extends GameObject
   *
   * @param {Object} [properties] - Properties of the sprite.
   * @param {String} [properties.color] - Fill color for the game object if no image or animation is provided.
   * @param {HTMLImageElement|HTMLCanvasElement} [properties.image] - Use an image to draw the sprite.
   * @param {{[name: String] : Animation}} [properties.animations] - An object of [Animations](api/animation) from a [Spritesheet](api/spriteSheet) to animate the sprite.
   */
  class Sprite extends GameObject {
    /**
     * @docs docs/api_docs/sprite.js
     */

    init({
      /**
       * The color of the game object if it was passed as an argument.
       * @memberof Sprite
       * @property {String} color
       */

      // @ifdef SPRITE_IMAGE
      /**
       * The image the sprite will use when drawn if passed as an argument.
       * @memberof Sprite
       * @property {HTMLImageElement|HTMLCanvasElement} image
       */
      image,

      /**
       * The width of the sprite. If the sprite is a [rectangle sprite](api/sprite#rectangle-sprite), it uses the passed in value. For an [image sprite](api/sprite#image-sprite) it is the width of the image. And for an [animation sprite](api/sprite#animation-sprite) it is the width of a single frame of the animation.
       * @memberof Sprite
       * @property {Number} width
       */
      width = image ? image.width : undefined,

      /**
       * The height of the sprite. If the sprite is a [rectangle sprite](api/sprite#rectangle-sprite), it uses the passed in value. For an [image sprite](api/sprite#image-sprite) it is the height of the image. And for an [animation sprite](api/sprite#animation-sprite) it is the height of a single frame of the animation.
       * @memberof Sprite
       * @property {Number} height
       */
      height = image ? image.height : undefined,
      // @endif

      ...props
    } = {}) {
      super.init({
        // @ifdef SPRITE_IMAGE
        image,
        width,
        height,
        // @endif
        ...props
      });
    }

    // @ifdef SPRITE_ANIMATION
    /**
     * An object of [Animations](api/animation) from a [SpriteSheet](api/spriteSheet) to animate the sprite. Each animation is named so that it can can be used by name for the sprites [playAnimation()](api/sprite#playAnimation) function.
     *
     * ```js
     * import { Sprite, SpriteSheet } from 'kontra';
     *
     * let spriteSheet = SpriteSheet({
     *   // ...
     *   animations: {
     *     idle: {
     *       frames: 1,
     *       loop: false,
     *     },
     *     walk: {
     *       frames: [1,2,3]
     *     }
     *   }
     * });
     *
     * let sprite = Sprite({
     *   x: 100,
     *   y: 200,
     *   animations: spriteSheet.animations
     * });
     *
     * sprite.playAnimation('idle');
     * ```
     * @memberof Sprite
     * @property {{[name: String] : Animation}} animations
     */
    get animations() {
      return this._a;
    }

    set animations(value) {
      let prop, firstAnimation;
      // a = animations
      this._a = {};

      // clone each animation so no sprite shares an animation
      for (prop in value) {
        this._a[prop] = value[prop].clone();

        // default the current animation to the first one in the list
        firstAnimation = firstAnimation || this._a[prop];
      }

      /**
       * The currently playing Animation object if `animations` was passed as an argument.
       * @memberof Sprite
       * @property {Animation} currentAnimation
       */
      this.currentAnimation = firstAnimation;
      this.width = this.width || firstAnimation.width;
      this.height = this.height || firstAnimation.height;
    }

    /**
     * Set the currently playing animation of an animation sprite.
     *
     * ```js
     * import { Sprite, SpriteSheet } from 'kontra';
     *
     * let spriteSheet = SpriteSheet({
     *   // ...
     *   animations: {
     *     idle: {
     *       frames: 1
     *     },
     *     walk: {
     *       frames: [1,2,3]
     *     }
     *   }
     * });
     *
     * let sprite = Sprite({
     *   x: 100,
     *   y: 200,
     *   animations: spriteSheet.animations
     * });
     *
     * sprite.playAnimation('idle');
     * ```
     * @memberof Sprite
     * @function playAnimation
     *
     * @param {String} name - Name of the animation to play.
     */
    playAnimation(name) {
      this.currentAnimation?.stop();
      this.currentAnimation = this.animations[name];
      this.currentAnimation.start();
    }

    advance(dt) {
      super.advance(dt);
      this.currentAnimation?.update(dt);
    }
    // @endif

    draw() {
      // @ifdef SPRITE_IMAGE
      if (this.image) {
        this.context.drawImage(
          this.image,
          0,
          0,
          this.image.width,
          this.image.height
        );
      }
      // @endif

      // @ifdef SPRITE_ANIMATION
      if (this.currentAnimation) {
        this.currentAnimation.render({
          x: 0,
          y: 0,
          width: this.width,
          height: this.height,
          context: this.context
        });
      }
      // @endif

      if (this.color) {
        this.context.fillStyle = this.color;
        this.context.fillRect(0, 0, this.width, this.height);
      }
    }
  }

  function factory$8() {
    return new Sprite(...arguments);
  }

  /**
   * Clear the canvas.
   */
  function clear(context) {
    let canvas = context.canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * The game loop updates and renders the game every frame. The game loop is stopped by default and will not start until the loops `start()` function is called.
   *
   * The game loop uses a time-based animation with a fixed `dt` to [avoid frame rate issues](http://blog.sklambert.com/using-time-based-animation-implement/). Each update call is guaranteed to equal 1/60 of a second.
   *
   * This means that you can avoid having to do time based calculations in your update functions and instead do fixed updates.
   *
   * ```js
   * import { Sprite, GameLoop } from 'kontra';
   *
   * let sprite = Sprite({
   *   x: 100,
   *   y: 200,
   *   width: 20,
   *   height: 40,
   *   color: 'red'
   * });
   *
   * let loop = GameLoop({
   *   update: function(dt) {
   *     // no need to determine how many pixels you want to
   *     // move every second and multiple by dt
   *     // sprite.x += 180 * dt;
   *
   *     // instead just update by how many pixels you want
   *     // to move every frame and the loop will ensure 60FPS
   *     sprite.x += 3;
   *   },
   *   render: function() {
   *     sprite.render();
   *   }
   * });
   *
   * loop.start();
   * ```
   * @class GameLoop
   *
   * @param {Object} properties - Properties of the game loop.
   * @param {(dt: Number) => void} [properties.update] - Function called every frame to update the game. Is passed the fixed `dt` as a parameter.
   * @param {Function} properties.render - Function called every frame to render the game.
   * @param {Number}   [properties.fps=60] - Desired frame rate.
   * @param {Boolean}  [properties.clearCanvas=true] - Clear the canvas every frame before the `render()` function is called.
   * @param {CanvasRenderingContext2D} [properties.context] - The context that should be cleared each frame if `clearContext` is not set to `false`. Defaults to [core.getContext()](api/core#getContext).
   * @param {Boolean} [properties.blur=false] - If the loop should still update and render if the page does not have focus.
   */
  function GameLoop({
    fps = 60,
    clearCanvas = true,
    update = noop,
    render,
    context = getContext(),
    blur = false
  } = {}) {
    // check for required functions
    // @ifdef DEBUG
    if (!render) {
      throw Error('You must provide a render() function');
    }
    // @endif

    // animation variables
    let accumulator = 0;
    let delta = 1e3 / fps; // delta between performance.now timings (in ms)
    let step = 1 / fps;
    let clearFn = clearCanvas ? clear : noop;
    let last, rAF, now, dt, loop;
    let focused = true;

    if (!blur) {
      window.addEventListener('focus', () => {
        focused = true;
      });
      window.addEventListener('blur', () => {
        focused = false;
      });
    }

    on('init', () => {
      loop.context ??= getContext();
    });

    /**
     * Called every frame of the game loop.
     */
    function frame() {
      rAF = requestAnimationFrame(frame);

      // don't update the frame if tab isn't focused
      if (!focused) return;

      now = performance.now();
      dt = now - last;
      last = now;

      // prevent updating the game with a very large dt if the game
      // were to lose focus and then regain focus later
      if (dt > 1e3) {
        return;
      }

      emit('tick');
      accumulator += dt;

      while (accumulator >= delta) {
        loop.update(step);

        accumulator -= delta;
      }

      clearFn(loop.context);
      loop.render();
    }

    // game loop object
    loop = {
      /**
       * Called every frame to update the game. Put all of your games update logic here.
       * @memberof GameLoop
       * @function update
       *
       * @param {Number} [dt] - The fixed dt time of 1/60 of a frame.
       */
      update,

      /**
       * Called every frame to render the game. Put all of your games render logic here.
       * @memberof GameLoop
       * @function render
       */
      render,

      /**
       * If the game loop is currently stopped.
       *
       * ```js
       * import { GameLoop } from 'kontra';
       *
       * let loop = GameLoop({
       *   // ...
       * });
       * console.log(loop.isStopped);  //=> true
       *
       * loop.start();
       * console.log(loop.isStopped);  //=> false
       *
       * loop.stop();
       * console.log(loop.isStopped);  //=> true
       * ```
       * @memberof GameLoop
       * @property {Boolean} isStopped
       */
      isStopped: true,

      /**
       * The context the game loop will clear. Defaults to [core.getContext()](api/core#getCcontext).
       *
       * @memberof GameLoop
       * @property {CanvasRenderingContext2D} context
       */
      context,

      /**
       * Start the game loop.
       * @memberof GameLoop
       * @function start
       */
      start() {
        last = performance.now();
        this.isStopped = false;
        requestAnimationFrame(frame);
      },

      /**
       * Stop the game loop.
       * @memberof GameLoop
       * @function stop
       */
      stop() {
        this.isStopped = true;
        cancelAnimationFrame(rAF);
      },

      // expose properties for testing
      // @ifdef DEBUG
      _frame: frame,
      set _last(value) {
        last = value;
      }
      // @endif
    };

    return loop;
  }

  console.log('hello world');
  const game = document.querySelector('canvas');
  // const g = game.getContext('2d')
  let { canvas, context } = init$1(game);

  let sprite = factory$8({
    x: 100,        // starting x,y position of the sprite
    y: 80,
    color: 'red',  // fill color of the sprite rectangle
    width: 20,     // width and height of the sprite rectangle
    height: 40,
    dx: 2          // move the sprite 2px to the right every frame
  });

  let loop = GameLoop({  // create the main game loop
    update: function() { // update the game state
      sprite.update();

      // wrap the sprites position when it reaches
      // the edge of the screen
      if (sprite.x > canvas.width) {
        sprite.x = -sprite.width;
      }
    },
    render: function() { // render the game state
      sprite.render();
    }
  });

  loop.start();    // start the game

}));
