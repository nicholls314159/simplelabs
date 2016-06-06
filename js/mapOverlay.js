/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
 
/** This function instantiates a new OverlayView object and then creates the appropriate "onAdd", "draw", "open", "onRemove"
 * and "close" functions.   Also creates a panToView function to re-center the map to include the map overlay within the map.
 */ 
function GenCustomWindow(){
    var CustomWindow = function(){
        this.container = document.createElement('div');
        this.container.classList.add('mapOverlayWindow');
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
     * Called when this overlay is set to a map via this.setMap. 
     */
    CustomWindow.prototype.onAdd = function(){
        this.layer = this.getPanes().floatPane;
        this.layer.appendChild(this.container);
        this.container.getElementsByClassName('mapOverlayClose')[0].addEventListener('click', function(){
            // Close info window on click
            this.close();
        }.bind(this), false);
        // Ensure newly opened window is fully in view
        setTimeout(this.panToView.bind(this), 200);
    };
    
    /**
     * Called after onAdd, and every time the map is moved, zoomed, ...
     */
    CustomWindow.prototype.draw = function(){
        var markerIcon = this.marker.getIcon(),
            cHeight = this.container.offsetHeight + markerIcon.scaledSize.height + 10,
            cWidth = (this.container.offsetWidth / 2);
        this.position = this.getProjection().fromLatLngToDivPixel(this.marker.getPosition());
        this.container.style.top = this.position.y - cHeight+'px';
        this.container.style.left = this.position.x - cWidth+'px';
        //console.log("CustomWindow.prototype.draw -- this.position.y " + this.position.y);
        //console.log("CustomWindow.prototype.draw -- this.position.x " + this.position.x);
    };
    /**
     * If the custom window is not entirely within the map view, pan the map
     */
    CustomWindow.prototype.panToView = function(){

        var position = this.position,
            latlng = this.marker.getPosition(),
            
            top = parseInt(this.container.style.top, 10),
            cHeight = position.y - top,
            cWidth = (this.container.offsetWidth / 2) + 10,
            map = this.getMap(),
            center = map.getCenter(),
            bounds = map.getBounds(),
            degPerPixel = (function(){
                var degs = {},
                    div = map.getDiv(),
                    span = bounds.toSpan();
                degs.x = span.lng() / div.offsetWidth;
                degs.y = span.lat() / div.offsetHeight;
                return degs;
            })(),
            overlayBorder = (function(){
                var overlayBorder = {};
                overlayBorder.north = latlng.lat() + cHeight * degPerPixel.y;
                overlayBorder.south = latlng.lat();
                overlayBorder.west = latlng.lng() - cWidth * degPerPixel.x;
                overlayBorder.east = latlng.lng() + cWidth * degPerPixel.x;
                return overlayBorder;
            })(),
            newCenter = (function(){
                var ne = bounds.getNorthEast(),
                    sw = bounds.getSouthWest(),
                    north = ne.lat(),
                    east = ne.lng(),
                    south = sw.lat(),
                    west = sw.lng(),
                    x = center.lng(),
                    y = center.lat(),
                    shiftLng = ((overlayBorder.west < west) ? west - overlayBorder.west : 0) +
                        ((overlayBorder.east > east) ? east - overlayBorder.east : 0),
                    shiftLat = ((overlayBorder.north > north) ? north - overlayBorder.north : 0) +
                        ((overlayBorder.south < south) ? south - overlayBorder.south : 0);

                return (shiftLng || shiftLat) ? new google.maps.LatLng(y - shiftLat, x - shiftLng) : void 0;
            })();

        if (newCenter){
            map.panTo(newCenter);
        }
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
}
