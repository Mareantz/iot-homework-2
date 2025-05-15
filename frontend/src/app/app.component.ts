import { Component } from '@angular/core';
import { SensorTableComponent } from './components/sensor-table/sensor-table.component';

@Component({
  selector: 'app-root',
  imports: [SensorTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
