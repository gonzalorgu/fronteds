import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PredictionResultComponent } from './prediction-result/prediction-result.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PredictionResultComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
}
