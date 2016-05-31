function GMaps(){
   // Set properties
   this.mapReady = false;
}
 
/**
* Note you'll need to have an object of type GMaps sitting in the global context ready to receive the init callback
* which you would append to the script as object.init
*/
GMaps.prototype.init = function(){
   this.mapReady = true;
}
 
// OR
 
/*
* This function is 'static', and could be passed to the callback param as GMaps.init
*/
GMaps.init = function(){
   // No access to 'this' here - just perform whatever startup tasks you think are necessary
}


//GMaps.CustomWindow = (function(){

/**
 * Create a custom overlay for our window marker display, extending google.maps.OverlayView.
 * This is somewhat complicated by needing to async load the google.maps api first - thus, we
 * wrap CustomWindow into a closure, and when instantiating CustomNativeWindow, we first execute the closure
 * (to create our CustomNativeWindow function, now properly extending the newly loaded google.maps.OverlayView),
 * and then instantiate said function.
 * @type {Function}
 * @see _mapView.onRender
 */
GMaps.CustomWindow = (function(){
    var CustomWindow = function(){
        this.container = document.createElement('div');
        this.container.classList.add('map-info-window');
        this.layer = null;
        this.marker = null;
        this.position = null;
    };
    /**
     * Inherit from OverlayView
     * @type {google.maps.OverlayView}
     */
    CustomWindow.prototype = new google.maps.OverlayView();
    /**
     * Called when this overlay is set to a map via this.setMap. Get the appropriate map pane
     * to add the window to, append the container, bind to close element.
     * @see CustomWindow.open
     */
    CustomWindow.prototype.onAdd = function(){
        this.layer = this.getPanes().floatPane;
        this.layer.appendChild(this.container);
        this.container.getElementsByClassName('map-info-close')[0].addEventListener('click', function(){
            // Close info window on click
            this.close();
        }.bind(this), false);
    };
    /**
     * Called after onAdd, and every time the map is moved, zoomed, or anything else that
     * would effect positions, to redraw this overlay.
     */
    CustomWindow.prototype.draw = function(){
        var markerIcon = this.marker.getIcon(),
            cBounds = this.container.getBoundingClientRect(),
            cHeight = cBounds.height + markerIcon.scaledSize.height + 10,
            cWidth = cBounds.width / 2;
        this.position = this.getProjection().fromLatLngToDivPixel(this.marker.getPosition());
        this.container.style.top = this.position.y - cHeight+'px';
        this.container.style.left = this.position.x - cWidth+'px';
    };
    /**
     * Called when this overlay has its map set to null.
     * @see CustomWindow.close
     */
    CustomWindow.prototype.onRemove = function(){
        this.layer.removeChild(this.container);
    };
    /**
     * Sets the contents of this overlay.
     * @param {string} html
     */
    CustomWindow.prototype.setContent = function(html){
        this.container.innerHTML = html;
    };
    /**
     * Sets the map and relevant marker for this overlay.
     * @param {google.maps.Map} map
     * @param {google.maps.Marker} marker
     */
    CustomWindow.prototype.open = function(map, marker){
        this.marker = marker;
        this.setMap(map);
    };
    /**
     * Close this overlay by setting its map to null.
     */
    CustomWindow.prototype.close = function(){
        this.setMap(null);
    };
    return CustomWindow;
});
