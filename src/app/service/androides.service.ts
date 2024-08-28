import { Injectable } from '@angular/core';
import { Androide } from '../interface/androide';

@Injectable({
  providedIn: 'root'
})
export class AndroidesService {

  private androides: Androide[] = [
    {
      id: 1,
      nombre: "Jorrie",
      apellido: "Beckley",
      amigo: true,
      fechaFabricacion: "7/29/1986",
      avatar: "https://robohash.org/voluptatumestsint.jpg?size=250x250&set=set1"
    },
    {
      id: 2,
      nombre: "Felic",
      apellido: "Roiz",
      amigo: false,
      fechaFabricacion: "6/22/1985",
      avatar: "https://robohash.org/magnamfugaminima.bmp?size=250x250&set=set1"
    },
    {
      id: 3,
      nombre: "Adelaida",
      apellido: "Clinnick",
      amigo: true,
      fechaFabricacion: "1/23/1976",
      avatar: "https://robohash.org/impeditquislaborum.bmp?size=250x250&set=set1"
    },
    {
      id: 4,
      nombre: "Pauline",
      apellido: "Coulter",
      amigo: false,
      fechaFabricacion: "6/25/1977",
      avatar: "https://robohash.org/repellatadvel.bmp?size=250x250&set=set1"
    },
    {
      id: 5,
      nombre: "Gilles",
      apellido: "Dyneley",
      amigo: true,
      fechaFabricacion: "4/4/1989",
      avatar: "https://robohash.org/rerumveniamsit.jpg?size=250x250&set=set1"
    },
    {
      id: 6,
      nombre: "Zebadiah",
      apellido: "Hayhoe",
      amigo: false,
      fechaFabricacion: "11/27/1986",
      avatar: "https://robohash.org/atinventoremaxime.bmp?size=250x250&set=set1"
    },
    {
      id: 7,
      nombre: "Lothaire",
      apellido: "Moreby",
      amigo: true,
      fechaFabricacion: "11/11/1980",
      avatar: "https://robohash.org/laborumvoluptatemet.bmp?size=250x250&set=set1"
    },
    {
      id: 8,
      nombre: "Karl",
      apellido: "Hagart",
      amigo: false,
      fechaFabricacion: "3/30/1985",
      avatar: "https://robohash.org/iureinut.jpg?size=250x250&set=set1"
    },
    {
      id: 9,
      nombre: "Tadio",
      apellido: "Vasyukhin",
      amigo: true,
      fechaFabricacion: "3/12/1971",
      avatar: "https://robohash.org/velitetsunt.png?size=250x250&set=set1"
    },
    {
      id: 10,
      nombre: "Steward",
      apellido: "de la Tremoille",
      amigo: false,
      fechaFabricacion: "7/11/1982",
      avatar: "https://robohash.org/quiadebitisvoluptate.bmp?size=250x250&set=set1"
    }

  ]
  constructor(){ console.log("servicio listo!!!"); }
  public getAndroides(): Androide[]{
    return this.androides;
  }
  public getAndroideXId(idx: number): Androide {
    for (let androide of this.androides) {
      if (androide.id == idx) {
        return androide;
      }
    }
    return this.androides[0];
  }
  public buscarAndroide(termino: string):Androide[] {
    let androideArr: Androide[] = [];
    termino = termino.toLowerCase();
    for(let androide of this.androides){
      let apellido = androide.apellido.toLowerCase();
      if (apellido.indexOf(termino) >= 0) {
        androideArr.push(androide);
      }
    }
   return androideArr;
  }
}
