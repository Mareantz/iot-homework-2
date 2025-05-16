import { Component } from '@angular/core';
import { MotionSensorComponent } from './components/motion-sensor/motion-sensor.component';

@Component({
  selector: 'app-root',
  imports: [MotionSensorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
