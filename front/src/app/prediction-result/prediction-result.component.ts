import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prediction-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prediction-result.component.html',
  styleUrls: ['./prediction-result.component.scss'],
  encapsulation: ViewEncapsulation.Emulated  
})
export class PredictionResultComponent {
getConfidencePercentage(arg0: any) {
throw new Error('Method not implemented.');
}
onFileSelected($event: Event) {
throw new Error('Method not implemented.');
}
  @Input() result: any;  // Contendrá el resultado de la clasificación (conocida/desconocida)
  @Input() imageData: any = null;  // Información adicional sobre la imagen, si es necesario

  // Método para obtener el icono de la clasificación facial
  getFaceClassificationIcon(isKnown: boolean): string {
    return isKnown ? '😊' : '😕';  // Usamos iconos para "conocida" y "desconocida"
  }

  // Método para obtener la interpretación de los resultados
  getInterpretation(): string {
    if (!this.result) return '';  // Si no hay resultado, no mostramos nada

    const isKnown = this.result.isKnown;
    const confidence = this.result.confidence;

    let interpretation = 'Clasificación facial: ';

    // Interpretar el nivel de confianza
    if (confidence >= 0.8) {
      interpretation += 'La clasificación es altamente confiable. ';
    } else if (confidence >= 0.6) {
      interpretation += 'La clasificación tiene una confianza moderada. ';
    } else {
      interpretation += 'La clasificación tiene una baja confianza, revisa la imagen nuevamente. ';
    }

    // Añadir si la persona es conocida o desconocida
    if (isKnown) {
      interpretation += 'La persona en la imagen es conocida.';
    } else {
      interpretation += 'La persona en la imagen es desconocida.';
    }

    return interpretation;
  }
}
