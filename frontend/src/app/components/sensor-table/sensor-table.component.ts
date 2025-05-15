import { Component, OnInit } from '@angular/core';
import { SensorDataService, SensorData } from '../../services/sensor-data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sensor-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sensor-table.component.html'
})
export class SensorTableComponent implements OnInit {
  data: SensorData[] = [];

  constructor(private sensorService: SensorDataService) {}

  ngOnInit(): void {
    this.load();
    setInterval(() => this.load(), 5000);
  }

  load() {
    this.sensorService.getData().subscribe(d => this.data = d);
  }
}
