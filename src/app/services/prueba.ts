import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Prueba {

  private apiUrl= 'http://localhost:8080/api/prueba';
  constructor(private http: HttpClient) {}

  probar(){
    return this.http.get(this.apiUrl, {responseType: 'text'});

  }

}
