import { Component, EventEmitter, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ImageFormComponent } from './app/weather-form/weather-form.component';
import { PredictionResultComponent } from './app/prediction-result/prediction-result.component';
import { ClassificationResult, ImageService } from './app/services/image.service';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ImageFormComponent, PredictionResultComponent],
  providers: [ImageService],
  template: `
    <div class="container" style="padding: 2rem 1rem; min-height: 100vh;">
      <header style="text-align: center; margin-bottom: 3rem;">
        <h1 style="color: white; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          📸 Clasificador Facial
        </h1>
        <p style="color: rgba(255,255,255,0.9); font-size: 1.125rem; max-width: 600px; margin: 0 auto;">
          Utiliza inteligencia artificial para clasificar imágenes faciales y determinar si la persona es conocida o desconocida
        </p>
        <div class="status-indicator" [class.connected]="backendConnected" [class.disconnected]="!backendConnected">
          <span class="status-dot"></span>
          <span class="status-text">
            {{ backendConnected ? 'Backend Conectado' : 'Backend Desconectado' }}
          </span>
        </div>
      </header>

      <main>
        <div class="grid grid-2">
          <div>
            <app-image-form 
              #imageForm
              (classifyImage)="onClassifyImage($event)">
            </app-image-form>
          </div>

          <div>
            <app-prediction-result 
              [result]="classificationResult"
              [imageData]="lastImageData">
            </app-prediction-result>

            <div *ngIf="errorMessage" class="error-card card fade-in" style="margin-top: 1rem; padding: 1.5rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                <span style="font-size: 1.5rem;">⚠️</span>
                <h4 style="color: var(--error); font-weight: 600; margin: 0;">Error de Conexión</h4>
              </div>
              <p style="color: var(--neutral-700); margin: 0; font-size: 0.875rem;">{{ errorMessage }}</p>
              <div style="margin-top: 1rem;">
                <button class="btn btn-primary" (click)="checkBackendConnection()">
                  🔄 Reintentar Conexión
                </button>
              </div>
            </div>

            <div *ngIf="!classificationResult && !errorMessage" class="placeholder-card card" style="margin-top: 1rem; padding: 2rem; text-align: center;">
              <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">📈</div>
              <h3 style="color: var(--neutral-600); font-weight: 500; margin-bottom: 0.5rem;">
                Esperando Clasificación
              </h3>
              <p style="color: var(--neutral-500); font-size: 0.875rem;">
                Completa el formulario para clasificar la imagen.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer style="text-align: center; margin-top: 4rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.2);">
        <p style="color: rgba(255,255,255,0.8); font-size: 0.875rem;">
          Python • 
          <span style="color: rgba(255,255,255,0.6);">Modelo de Clasificación Facial</span>
        </p>
      </footer>
    </div>
  `,
  styles: [`/* Los estilos pueden permanecer como están */`],
  encapsulation: ViewEncapsulation.Emulated
})
export class App {
  @ViewChild('imageForm') imageForm!: ImageFormComponent;
  
  classificationResult: ClassificationResult | null = null;
  lastImageData: any = null;
  errorMessage: string = '';
  backendConnected: boolean = false;

  constructor(private imageService: ImageService) {
    this.checkBackendConnection();
  }

  onClassifyImage(imageData: FormData) {
    this.errorMessage = '';
    this.lastImageData = imageData;
    
    this.imageService.classifyImage(imageData).subscribe({
      next: (response) => {
        this.imageForm.setLoading(false);
        if (response.success) {
          this.classificationResult = response.result;
        } else {
          this.errorMessage = response.message || 'Error en la clasificación';
        }
      },
      error: (error) => {
        this.imageForm.setLoading(false);
        this.errorMessage = error.message;
        this.backendConnected = false;
      }
    });
  }

  checkBackendConnection() {
    this.imageService.getHealthCheck().subscribe({
      next: () => {
        this.backendConnected = true;
        this.errorMessage = '';
      },
      error: (error) => {
        this.backendConnected = false;
        if (!this.errorMessage) {
          this.errorMessage = 'No se puede conectar con el backend. Asegúrate de que el servidor Python esté ejecutándose en el puerto 5000.';
        }
      }
    });
  }
}

bootstrapApplication(App, {
  providers: []
});
