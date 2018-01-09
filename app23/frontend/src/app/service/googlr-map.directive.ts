import { GoogleMapsAPIWrapper } from "angular2-google-maps/core";
import { Directive, Input, Output } from "@angular/core";
import { CurrencyPipe } from "@angular/common";

declare var google: any;

@Directive({ selector: "sebm-google-map-directions" })
export class DirectionsMapDirective {
  @Input() origin: any;
  @Input() destination: any;
  @Input() directionsDisplay: any;
  @Input() estimatedTime: any;
  @Input() estimatedDistance: any;
  private directionsService: any;

  constructor(private gmapsApi: GoogleMapsAPIWrapper) {}
  clearDirections() {
    this.directionsService = new google.maps.DirectionsService();
    if (this.directionsDisplay != null) {
      this.directionsDisplay.setMap(null);
    }
  }
  updateDirections():boolean {
    this.gmapsApi.getNativeMap().then(map => {
      if (!this.origin || !this.destination) {
        return false;
      }
      this.directionsService = new google.maps.DirectionsService();
      var me = this;
      var latLngA = new google.maps.Marker({
        lat: this.origin.latitude,
        lng: this.origin.longitude
      });
      var latLngB = new google.maps.Marker({
        lat: this.destination.latitude,
        lng: this.destination.longitude
      });
      this.directionsDisplay.setMap(map);
      this.directionsDisplay.setOptions({
        suppressMarkers: true,
        polylineOptions: {
          strokeWeight: 8,
          strokeOpacity: 1,
          strokeColor: "#00468c"
        }
      });
      this.directionsDisplay.suppressMarkers = false;
      this.directionsDisplay.setDirections({ routes: [] });
      this.directionsService.route(
        {
          origin: latLngA,
          destination: latLngB,
          avoidHighways: false,
          travelMode: google.maps.DirectionsTravelMode.DRIVING
          //travelMode: 'DRIVING'
        },
        function(response: any, status: any) {
          if (status === "OK") {
            me.directionsDisplay.setDirections(response);
            var point = response.routes[0].legs[0];
            me.estimatedTime = point.duration.text;
            me.estimatedDistance = point.distance.text;
            return true;
          } else {
            console.log(
              "Directions request failed due to " + latLngA + latLngB
            );
            return false;
          }
        }
      );
    });
    return false;
  }
}
