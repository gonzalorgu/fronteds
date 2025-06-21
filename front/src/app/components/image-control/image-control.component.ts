import { Component } from '@angular/core';

@Component({
  selector: 'app-image-control',
  standalone: true,
  imports: [],
  templateUrl: './image-control.component.html',
  styleUrl: './image-control.component.scss'
})
export class ImageControlComponent {
  imageUrl:string|null = null;
  selectedFile:File|null = null; 
}
