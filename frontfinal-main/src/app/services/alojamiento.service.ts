import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlojamientoService {

  private apiUrl = 'http://localhost:8080/api/alojamientos/listar';

  constructor(private http: HttpClient) {}

  alojamientos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}