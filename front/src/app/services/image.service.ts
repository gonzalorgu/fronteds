// app/services/image.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClassificationResult {
  isKnown: boolean;  // Si la persona es conocida o no
  confidence: number; // Confianza de la clasificación
}

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private apiUrl = 'http://localhost:5000/api';  // Dirección del backend Flask

  constructor(private http: HttpClient) {}

  // Método para clasificar la imagen
  classifyImage(imageData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/classify`, imageData);
  }

  // Método para verificar el estado del backend
  getHealthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}
