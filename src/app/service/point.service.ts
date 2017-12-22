import { Injectable,ApplicationRef } from "@angular/core";
import { Http } from "@angular/http";
import { HttpMethods } from '../config/dataProvide'
import { point } from "../models/point";

@Injectable()
export class pointService {
  dataProvide : any;
  private points : point[];
  constructor(
    public http: Http
  ) {
    this.dataProvide = new HttpMethods(this.http);
  }

  getList(): any{
    return this.dataProvide.get('points');
  }

  getCardsByPoint(p:point):any{
    return this.dataProvide.get('cards');
  }
}