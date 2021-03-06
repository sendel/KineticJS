    /* Yavorovsky M.A. 2013 VIOLONIX(C)
     * Not stopped animation while tab of browser is hidden.
     * Against 'requestAnimationFrame', used 'setTimeout' while tab hidden.
     * 
     * 'setTimeout' delay minimum 1000 ms (1s) while tab hidden! If you need smallest animation than 1000 ms, 
     * try set Tween or Sprite to last position when tab hidden. 
     * 
     */
    
    
    function getHidden(){
    	var hidden, visibilityChange; 
    	if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
    	    hidden = "hidden";
    	} else if (typeof document.mozHidden !== "undefined") {
    	    hidden = "mozHidden";
    	} else if (typeof document.msHidden !== "undefined") {
    	    hidden = "msHidden";
    	} else if (typeof document.webkitHidden !== "undefined") {
    	    hidden = "webkitHidden";
    	}
    	else
    		{
    			return true;
    		}
    	return document[hidden];
    	
    }
    
    
    function setVisibleListener(callback){
    	var visibilityChange =""; 
    	if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
    	    visibilityChange = "visibilitychange";
    	} else if (typeof document.mozHidden !== "undefined") {
    	    visibilityChange = "mozvisibilitychange";
    	} else if (typeof document.msHidden !== "undefined") {
    	    visibilityChange = "msvisibilitychange";
    	} else if (typeof document.webkitHidden !== "undefined") {
    	    visibilityChange = "webkitvisibilitychange";
    	}
    	if(visibilityChange!=""){
    		document.addEventListener(visibilityChange, callback, false);
    	}
    	
    	
    }
    
    function removeVisibleListener(callback){
    	var visibilityChange =""; 
    	if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
    	    visibilityChange = "visibilitychange";
    	} else if (typeof document.mozHidden !== "undefined") {
    	    visibilityChange = "mozvisibilitychange";
    	} else if (typeof document.msHidden !== "undefined") {
    	    visibilityChange = "msvisibilitychange";
    	} else if (typeof document.webkitHidden !== "undefined") {
    	    visibilityChange = "webkitvisibilitychange";
    	}
    	if(visibilityChange!=""){
    		document.removeEventListener(visibilityChange, callback, false);
    	}
    	
    	
    }
    
    var kinetic_anim_stack = []; //stack for running animations
    function AnimationEvent(){
    	for(var i = 0; i < kinetic_anim_stack.length; i++ )
    		kinetic_anim_stack[i].update.call(kinetic_anim_stack[i]);
    		
    }
    
    setVisibleListener(AnimationEvent);



(function() {
    /**
     * Animation constructor.  A stage is used to contain multiple layers and handle
     * @constructor
     * @memberof Kinetic
     * @param {Function} func function executed on each animation frame.  The function is passed a frame object, which contains
     *  timeDiff, lastTime, time, and frameRate properties.  The timeDiff property is the number of milliseconds that have passed
     *  since the last animation frame.  The lastTime property is time in milliseconds that elapsed from the moment the animation started
     *  to the last animation frame.  The time property is the time in milliseconds that ellapsed from the moment the animation started
     *  to the current animation frame.  The frameRate property is the current frame rate in frames / second
     * @param {Kinetic.Layer|Array} [layers] layer(s) to be redrawn on each animation frame. Can be a layer, an array of layers, or null.  
     *  Not specifying a node will result in no redraw.
     * @example
     * // move a node to the right at 50 pixels / second<br>
     * var velocity = 50;<br><br>
     *
     * var anim = new Kinetic.Animation(function(frame) {<br>
     *   var dist = velocity * (frame.timeDiff / 1000);<br>
     *   node.move(dist, 0);<br>
     * }, layer);<br><br>
     *
     * anim.start();
     */
    Kinetic.Animation = function(func, layers) {
        this.func = func;
        this.setLayers(layers);
        this.id = Kinetic.Animation.animIdCounter++;
        this.frame = {
            time: 0,
            timeDiff: 0,
            lastTime: new Date().getTime()
        };
    };
    /*
     * Animation methods
     */
    Kinetic.Animation.prototype = {
        /**
         * set layers to be redrawn on each animation frame
         * @method
         * @memberof Kinetic.Animation.prototype
         * @param {Kinetic.Layer|Array} [layers] layer(s) to be redrawn.&nbsp; Can be a layer, an array of layers, or null.  Not specifying a node will result in no redraw.
         */
        setLayers: function(layers) {
            var lays = []; 
            // if passing in no layers
            if (!layers) {
                lays = [];
            }
            // if passing in an array of Layers
            // NOTE: layers could be an array or Kinetic.Collection.  for simplicity, I'm just inspecting
            // the length property to check for both cases
            else if (layers.length > 0) {
                lays = layers;
            }
            // if passing in a Layer
            else {
                lays = [layers];
            }

            this.layers = lays;
        },
        /**
         * get layers
         * @method
         * @memberof Kinetic.Animation.prototype
         */
        getLayers: function() {
            return this.layers;
        },
        /**
         * add layer.  Returns true if the layer was added, and false if it was not
         * @method
         * @memberof Kinetic.Animation.prototype
         * @param {Kinetic.Layer} layer
         */
        addLayer: function(layer) {
            var layers = this.layers,
                len, n;

            if (layers) {
                len = layers.length;

                // don't add the layer if it already exists
                for (n = 0; n < len; n++) {
                    if (layers[n]._id === layer._id) {
                        return false; 
                    } 
                } 
            }
            else {
                this.layers = [];
            }

            this.layers.push(layer);
            return true;
        },
        /**
         * determine if animation is running or not.  returns true or false
         * @method
         * @memberof Kinetic.Animation.prototype
         */
        isRunning: function() {
            var a = Kinetic.Animation, animations = a.animations;
            for(var n = 0; n < animations.length; n++) {
                if(animations[n].id === this.id) {
                    return true;
                }
            }
            return false;
        },
        /**
         * start animation
         * @method
         * @memberof Kinetic.Animation.prototype
         */
        start: function() {
            this.stop();
            this.frame.timeDiff = 0;
            this.frame.lastTime = new Date().getTime();
	    kinetic_anim_stack.push(this);
            Kinetic.Animation._addAnimation(this);
        },
        /**
         * stop animation
         * @method
         * @memberof Kinetic.Animation.prototype
         */
        stop: function() {
		var _self = this;
        	for(var i = 0; i< kinetic_anim_stack.length; i++){
        		if(kinetic_anim_stack[i].id==_self.id){
        			kinetic_anim_stack.splice(i,1);
        			break;
        		}
        	}
            Kinetic.Animation._removeAnimation(this);
        },
        _updateFrameObject: function(time) {
            this.frame.timeDiff = time - this.frame.lastTime;
            this.frame.lastTime = time;
            this.frame.time += this.frame.timeDiff;
            this.frame.frameRate = 1000 / this.frame.timeDiff;
        },
        update: function(){
        	console.log('update: ' + getHidden());
        	//if(getHidden())
        		Kinetic.Animation._animationOnce();
        }
    };
    Kinetic.Animation.animations = [];
    Kinetic.Animation.animIdCounter = 0;
    Kinetic.Animation.animRunning = false;

    Kinetic.Animation._addAnimation = function(anim) {
        this.animations.push(anim);
        this._handleAnimation();
    };
    Kinetic.Animation._removeAnimation = function(anim) {
        var id = anim.id, animations = this.animations, len = animations.length;
        for(var n = 0; n < len; n++) {
            if(animations[n].id === id) {
                this.animations.splice(n, 1);
                break;
            }
        }
    };

    Kinetic.Animation._runFrames = function() {
        var layerHash = {}, 
            animations = this.animations,
            anim, layers, func, n, i, layersLen, layer, key;
        /*
         * loop through all animations and execute animation
         *  function.  if the animation object has specified node,
         *  we can add the node to the nodes hash to eliminate
         *  drawing the same node multiple times.  The node property
         *  can be the stage itself or a layer
         */
        /*
         * WARNING: don't cache animations.length because it could change while
         * the for loop is running, causing a JS error
         */
        for(n = 0; n < animations.length; n++) {
            anim = animations[n];
            layers = anim.layers; 
            func = anim.func;

            anim._updateFrameObject(new Date().getTime());
            layersLen = layers.length;

            for (i=0; i<layersLen; i++) {
                layer = layers[i];
                if(layer._id !== undefined) {
                    layerHash[layer._id] = layer;
                }
            }

            // if animation object has a function, execute it
            if(func) {
                func.call(anim, anim.frame);
            }
        }

        for(key in layerHash) {
            layerHash[key].draw();
        }
    };
    Kinetic.Animation._animationLoop = function() {
        var that = this;
        if(this.animations.length > 0) {
            this._runFrames();
            Kinetic.Animation.requestAnimFrame(function() {
                that._animationLoop();
            });
        }
        else {
            this.animRunning = false;
        }
    };
    
    Kinetic.Animation._animationOnce = function() {
        var that = this;
        if(this.animations.length > 0) {
            this._runFrames();
            setFRAF(function() {
                that._animationOnce();
            });

        }
        else {
            this.animRunning = false;
        }
    };
    
    Kinetic.Animation._handleAnimation = function() {
        var that = this;
        if(!this.animRunning) {
            this.animRunning = true;
            that._animationLoop();
        }
    };
    RAF = (function() {
        return window.requestAnimationFrame 
            || window.webkitRequestAnimationFrame 
            || window.mozRequestAnimationFrame 
            || window.oRequestAnimationFrame 
            || window.msRequestAnimationFrame 
            || setFRAF;
    })();

    function setFRAF(callback){
    	far_cb_stack.push(callback);
    	if(!tm_startded) FRAF(this);
    }
    
    
    var far_cb_stack = [];
    var tm_startded = false;
    
    function FRAF(anim) {
    	//console.log('FRAF:start');
    	tm_startded = true;
    	var that = anim;
    	cit = window.setTimeout(function(){

        	if(far_cb_stack.length==0){
        		//nothing, stop while no need
        		//console.log('FRAF:ended');
        		tm_startded = false;
        		return; 
        	}
        	//console.log(far_cb_stack);
        	var cb_stack = far_cb_stack.slice(0);
        	far_cb_stack = [];
        	while(cb_stack.length){
        		var cb = cb_stack.pop(); 
        		cb.call();
        	}
        	FRAF(that);
        }, 1000 / 60);
    }


    Kinetic.Animation.requestAnimFrame = function(callback) {
        var raf = Kinetic.DD && Kinetic.DD.isDragging ? setFRAF : RAF;
        if(getHidden())
        {
        	setFRAF(callback);
        }
        else
        {
        	raf(callback);
        }
    };
    
    var moveTo = Kinetic.Node.prototype.moveTo;
    Kinetic.Node.prototype.moveTo = function(container) {
        moveTo.call(this, container);
    };

    Kinetic.Layer.batchAnim = new Kinetic.Animation(function() {
        if (this.getLayers().length === 0) {
            this.stop();
        }
        this.setLayers([]);
    });

    /**
     * get batch draw
     * @method
     * @memberof Kinetic.Layer.prototype
     */
    Kinetic.Layer.prototype.batchDraw = function() {
        var batchAnim = Kinetic.Layer.batchAnim;
        batchAnim.addLayer(this);  

        if (!batchAnim.isRunning()) {
            batchAnim.start(); 
        } 
    };
})();