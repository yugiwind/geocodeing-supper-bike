import {Component,NgModule,NgZone,OnInit,ViewChild,ElementRef,Directive,Input,Renderer} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {AgmCoreModule, MapsAPILoader, GoogleMapsAPIWrapper} from 'angular2-google-maps/core';
import {ActivatedRoute, Router} from '@angular/router';
import {} from '@types/googlemaps';
import {ToastyService, ToastyConfig, ToastOptions, ToastData} from 'ng2-toasty';

// import { Notify } from '../../config/toasty';

import {DirectionsMapDirective} from '../../service/googlr-map.directive';
import { pointService } from '../../service/point.service';

import { point } from '../../models/point';
import { geocode } from '../../models/geocode';
import { from } from 'rxjs/observable/from';

declare var google : any;
declare var jQuery : any;

@Component({selector: 'app-maps-near-rooms',
    templateUrl: './maps-near-rooms.component.html',
    styleUrls: ['./maps-near-rooms.component.css'],
    providers: [GoogleMapsAPIWrapper,pointService]
  })

export class MapsNearRoomsComponent implements OnInit {
  public latitude : number;
  public longitude : number;
  public destinationInput : FormControl;
  public destinationOutput : FormControl;
  public zoom : number;
  public points : point[];
  public selectedpoint : point;
  public cars : any;
  private selectedCar :any;
  private interval: any;
  private geoCoder;

  @ViewChild("pickupInput")public pickupInputElementRef : ElementRef;
  @ViewChild("pickupOutput")public pickupOutputElementRef : ElementRef;
  @ViewChild(DirectionsMapDirective)vc : DirectionsMapDirective;

  constructor(private mapsAPILoader : MapsAPILoader, 
    private ngZone : NgZone, 
    private gmapsApi : GoogleMapsAPIWrapper, 
    private _elementRef : ElementRef, 
    private route : ActivatedRoute, 
    private router : Router,
    private pointService: pointService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig) {
      this.toastyConfig.theme = 'material';
    }

  ngOnInit() {
    this.loadListpoint();
    this.interval = setInterval(() => {
      this.loadListpoint();
    }, 5000);
    this.loadmap();
  }

  

  private loadListpoint(){
    this.pointService.getList().subscribe(points=>{ 
      this.points = points;
    });
  }

  loadmap(){
    this.zoom = 4;
    this.latitude = 10.821581049913508;
    this.longitude = 106.78939990781248;
    this.destinationOutput = new FormControl();
    this.setCurrentPosition();
    this.mapsAPILoader.load().then(() => {
      let autocompleteOutput = new google.maps.places.Autocomplete(this.pickupOutputElementRef.nativeElement, {types: ["address"]});
      this.setupPlaceChangedListener(autocompleteOutput);
      });
  }


  selectpoint(point:point){
    this.selectedpoint = point;
    this.cars = [];
    if(this.selectedpoint.status == 0){
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: this.selectedpoint.address }, (results, status) => {
        if(status == "OK"){
          var Geocode  = new geocode();
          this.latitude = this.selectedpoint.latitude =  results[0].geometry.location.lat();
          this.longitude = this.selectedpoint.longitude = results[0].geometry.location.lng();
          this.selectedpoint.status = 1;
          this.addToast("success","Tự động xác định toạn độ thành công","("+this.latitude+"+"+this.longitude);
        }else{
          console.log("fuck");
          this.addToast("warning","Tự động xác định toạn độ không thành công, vùi lòng tìm bằng tay","("+this.latitude+"+"+this.longitude);
        }
      });
      this.vc.clearDirections();
    }else if(this.selectedpoint.status == 1){
      this.latitude = this.selectedpoint.latitude;
      this.longitude = this.selectedpoint.longitude;
      this.pointService.getCardsByPoint(this.selectedpoint).subscribe(cards=>{ 
        this.cars = cards;
      });
      this.vc.clearDirections();
    }else if(this.selectedpoint.status == 2){
      let car = new geocode();
      car.latitude = 10.921581049913508;
      car.longitude = 106.78939990781248;
      this.interval = setInterval(() => {
        car.latitude = car.latitude - 0.001;
      }, 1000);
      this.cars.push(car);
      this.loadDirect(car);
    }
  }

  addToast(type:string,title:string,mgs:string) {
    var toastOptions:ToastOptions = {
      title: title,
      msg: mgs,
      showClose: true,
      timeout: 5000,
      theme: "bootstrap",
        onAdd: (toast:ToastData) => {
            // console.log('Toast ' + toast.id + ' has been added!');
        },
        onRemove: function(toast:ToastData) {
            // console.log('Toast ' + toast.id + ' has been removed!');
        }
    };
    // Add see all possible types in one shot
    switch (type) {
        case 'default': this.toastyService.default(toastOptions); break;
        case 'info': this.toastyService.info(toastOptions); break;
        case 'success': this.toastyService.success(toastOptions); break;
        case 'wait': this.toastyService.wait(toastOptions); break;
        case 'error': this.toastyService.error(toastOptions); break;
        case 'warning': this.toastyService.warning(toastOptions); break;
    }
  }

  geocoding(address: String):geocode{
    var geocoder = new google.maps.Geocoder();
    return geocoder.geocode({ address: address }, (results, status) => {
      var Geocode  = new geocode();
      Geocode.latitude =  results[0].geometry.location.lat();
      Geocode.longitude = results[0].geometry.location.lng();
      console.log("lat: " + Geocode.latitude + ", long: " + Geocode.longitude);
      return Geocode;
    });
  }


  markerDragEnd($event: any) {
    this.latitude = this.selectedpoint.latitude = $event.coords.lat;
    this.longitude = this.selectedpoint.longitude = $event.coords.lng;
    this.getAddress();
    if(this.selectedpoint.status == 2){
      this.interval = setInterval(() => {
        this.cars[0].latitude = this.cars[0].latitude - 0.001;
      }, 1000);
      this.loadDirect(this.cars[0]);
    }
    // this.addToast("success","Cập nhật toạn độ thành công","("+this.latitude+"+"+this.longitude);
  }

  private setupPlaceChangedListener(autocomplete : any) {
    autocomplete.addListener("place_changed", () => {
      this.ngZone.run(() => {
          let place : google.maps.places.PlaceResult = autocomplete.getPlace();
          if (place.geometry === undefined) {
            return;
          }
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          if(this.selectedpoint){
            this.selectedpoint.latitude = place.geometry.location.lat();
            this.selectedpoint.longitude = place.geometry.location.lng();
            this.selectedpoint.address = place.formatted_address;
          }
        });
    });

  }

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.zoom = 12;
        });
    }
  }

  
  loadDirect(destination:geocode){
    this.vc.origin = {
      latitude: this.selectedpoint.latitude,
      longitude: this.selectedpoint.longitude
    };
    this.vc.destination = {
      latitude: destination.latitude,
      longitude: destination.longitude
    }

    if (this.vc.directionsDisplay === undefined) {
      this.mapsAPILoader.load().then(() => {
          this.vc.directionsDisplay = new google.maps.DirectionsRenderer;
        });
    }
    this.vc.updateDirections();
  }

  closeSelect(){
    this.selectedpoint = null;
  }

  getAddress() {
    this.geoCoder = new google.maps.Geocoder;
    this.geoCoder.geocode({ 'location': { lat: this.selectedpoint.latitude, lng: this.selectedpoint.longitude } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.selectedpoint.address = results[0].formatted_address;
        } 
      } 
    });
  }
}
