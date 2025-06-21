import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-image-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './weather-form.component.html',  // Actualiza la ruta si es necesario
  styleUrls: ['./weather-form.component.scss'],
  encapsulation: ViewEncapsulation.Emulated  
})
export class ImageFormComponent {
  @Output() classifyImage = new EventEmitter<FormData>();  // Emitimos FormData con la imagen
  
  imageForm: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder) {
    this.imageForm = this.fb.group({
      image: [null, Validators.required]  // Solo necesitamos el campo para la imagen
    });
  }

  // Manejar el archivo seleccionado
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageForm.patchValue({ image: file });
    }
  }

  // Enviar el archivo al backend para su clasificación
  onSubmit() {
    if (this.imageForm.valid) {
      this.isLoading = true;

      // Crear un objeto FormData para enviar la imagen
      const formData = new FormData();
      formData.append('file', this.imageForm.get('image')?.value);

      this.classifyImage.emit(formData);

      // Simular un delay de carga (esto lo reemplazas con la lógica real del backend)
      setTimeout(() => {
        this.isLoading = false;
      }, 2000);
    }
  }

  resetForm() {
    this.imageForm.reset();
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }
}
