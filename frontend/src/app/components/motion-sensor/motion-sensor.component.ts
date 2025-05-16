import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface SensorData {
  distance: number;
  status: string;
  timestamp: string;
}

interface LogEntry {
  time: string;
  distance: number;
  status: string;
}

interface Position {
  x: number;
  y: number;
}

@Component({
  selector: 'app-motion-sensor',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './motion-sensor.component.html',
  styleUrls: ['./motion-sensor.component.css']
})
export class MotionSensorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sensorCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  distance = 100;
  currentTime = new Date();
  serverResponse: any = null;
  isDragging = false;
  objectPosition: Position = { x: 150, y: 150 };
  canvasWidth = 500;
  canvasHeight = 300;

  dataLog: LogEntry[] = [];
  logInterval: any;
  autoMoveInterval: any;
  isAutoMoving = false;
  autoMoveDirection = 'away';

  sensorPosition = { x: 450, y: 150 };

  coneAngle = 60;
  maxDistance = 300;

  private readonly THRESHOLD = 75;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

    this.logInterval = setInterval(() => {
      this.logSensorData();
    }, 2000);
  }

  ngAfterViewInit() {
    this.drawScene();
    this.logSensorData();
  }

  ngOnDestroy() {
    if (this.logInterval) {
      clearInterval(this.logInterval);
    }
    if (this.autoMoveInterval) {
      clearInterval(this.autoMoveInterval);
    }
  }

  get status(): string {
    return this.distance <= this.THRESHOLD ? 'INTRUDER' : 'SAFE';
  }

  onDistanceChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.distance = parseInt(input.value, 10);

    this.updateObjectPositionFromDistance();
    this.drawScene();
  }

  updateObjectPositionFromDistance(): void {
    const normalizedDistance = this.distance / this.maxDistance;
    const angle = 0;
    const x = this.sensorPosition.x - normalizedDistance * this.canvasWidth * 0.8;
    const y = this.sensorPosition.y;

    this.objectPosition = { x, y };
  }

  drawScene(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.drawDetectionCone(ctx);
    this.drawDistanceLine(ctx);
    this.drawSensor(ctx);
    this.drawObject(ctx);
    this.calculateDistanceFromPosition();
  }

  drawDetectionCone(ctx: CanvasRenderingContext2D): void {
    const angleRad = (this.coneAngle / 2) * (Math.PI / 180);

    ctx.beginPath();
    ctx.moveTo(this.sensorPosition.x, this.sensorPosition.y);
    ctx.lineTo(
      this.sensorPosition.x - Math.cos(-angleRad) * this.canvasWidth,
      this.sensorPosition.y + Math.sin(-angleRad) * this.canvasWidth
    );
    ctx.lineTo(
      this.sensorPosition.x - Math.cos(angleRad) * this.canvasWidth,
      this.sensorPosition.y + Math.sin(angleRad) * this.canvasWidth
    );
    ctx.closePath();

    ctx.fillStyle = this.status === 'INTRUDER' ? 'rgba(76, 175, 80, 0.4)' : 'rgba(76, 175, 80, 0.2)';
    ctx.fill();
  }

  drawDistanceLine(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.setLineDash([5, 3]);
    ctx.moveTo(this.sensorPosition.x, this.sensorPosition.y);
    ctx.lineTo(this.objectPosition.x, this.objectPosition.y);
    ctx.strokeStyle = '#2196F3';
    ctx.stroke();
    ctx.setLineDash([]);

    const midX = (this.sensorPosition.x + this.objectPosition.x) / 2;
    const midY = (this.sensorPosition.y + this.objectPosition.y) / 2;

    ctx.fillStyle = 'rgba(33, 150, 243, 0.8)';
    ctx.beginPath();
    ctx.roundRect(midX - 40, midY - 10, 80, 20, 5);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.distance.toFixed(0)} cm`, midX, midY);

    const inches = (this.distance / 2.54).toFixed(1);
    ctx.fillStyle = 'rgba(33, 150, 243, 0.6)';
    ctx.beginPath();
    ctx.roundRect(midX - 40, midY + 15, 80, 20, 5);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.fillText(`${inches} in`, midX, midY + 25);
  }

  drawSensor(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#1565C0';
    ctx.fillRect(this.sensorPosition.x - 10, this.sensorPosition.y - 30, 40, 60);

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(this.sensorPosition.x + 5, this.sensorPosition.y - 15, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.sensorPosition.x + 5, this.sensorPosition.y + 15, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('HC-SR04', this.sensorPosition.x + 5, this.sensorPosition.y);

    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#999';
      ctx.fillRect(
        this.sensorPosition.x + 5 - 15 + i * 10,
        this.sensorPosition.y + 30,
        2,
        10
      );
    }

    ctx.beginPath();
    ctx.moveTo(this.sensorPosition.x + 5, this.sensorPosition.y - 15);
    ctx.lineTo(this.sensorPosition.x + 50, this.sensorPosition.y - 50);
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.sensorPosition.x + 5, this.sensorPosition.y + 15);
    ctx.lineTo(this.sensorPosition.x + 50, this.sensorPosition.y + 50);
    ctx.stroke();
  }

  drawObject(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.objectPosition.x, this.objectPosition.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#00BCD4';
    ctx.fill();
  }

  calculateDistanceFromPosition(): void {
    const dx = this.sensorPosition.x - this.objectPosition.x;
    const dy = this.sensorPosition.y - this.objectPosition.y;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);

    this.distance = Math.round((pixelDistance / (this.canvasWidth * 0.8)) * this.maxDistance);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const dx = x - this.objectPosition.x;
    const dy = y - this.objectPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= 10) {
      this.isDragging = true;
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.isPointInCone(x, y)) {
      this.objectPosition = { x, y };
      this.calculateDistanceFromPosition();
      this.drawScene();
    }
  }

  @HostListener('mouseup')
  onMouseUp(): void {
    this.isDragging = false;
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.isDragging = false;
  }

  isPointInCone(x: number, y: number): boolean {
    const dx = this.sensorPosition.x - x;
    const dy = this.sensorPosition.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const maxAngleRad = (this.coneAngle / 2) * (Math.PI / 180);

    return (
      x < this.sensorPosition.x &&
      Math.abs(angle) <= maxAngleRad &&
      distance <= this.canvasWidth * 0.8
    );
  }

  logSensorData(): void {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const logEntry: LogEntry = {
      time: timeString,
      distance: this.distance,
      status: this.status
    };

    this.dataLog.unshift(logEntry);

    if (this.dataLog.length > 12) {
      this.dataLog = this.dataLog.slice(0, 12);
    }
  }

  moveCloser(): void {
    this.distance = Math.max(0, this.distance - 10);
    this.updateObjectPositionFromDistance();
    this.drawScene();
  }

  moveAway(): void {
    this.distance = Math.min(this.maxDistance, this.distance + 10);
    this.updateObjectPositionFromDistance();
    this.drawScene();
  }

  startAutoMove(direction: string): void {
    this.stopAutoMove();

    this.isAutoMoving = true;
    this.autoMoveDirection = direction;

    this.autoMoveInterval = setInterval(() => {
      if (this.autoMoveDirection === 'closer') {
        this.distance = Math.max(0, this.distance - 5);

        if (this.distance <= 0) {
          this.autoMoveDirection = 'away';
        }
      } else {
        this.distance = Math.min(this.maxDistance, this.distance + 5);

        if (this.distance >= this.maxDistance) {
          this.autoMoveDirection = 'closer';
        }
      }

      this.updateObjectPositionFromDistance();
      this.drawScene();
    }, 200);
  }

  stopAutoMove(): void {
    if (this.autoMoveInterval) {
      clearInterval(this.autoMoveInterval);
      this.autoMoveInterval = null;
    }
    this.isAutoMoving = false;
  }

  toggleAutoMove(): void {
    if (this.isAutoMoving) {
      this.stopAutoMove();
    } else {
      this.startAutoMove('away');
    }
  }

  saveLogsLocally(): void {
    const dataToSave = {
      metadata: {
        timestamp: new Date().toISOString(),
        device: 'HC-SR04 Ultrasonic Sensor',
        sensorId: 'SIM-001',
        threshold: this.THRESHOLD
      },
      logs: this.dataLog
    };

    const jsonString = JSON.stringify(dataToSave, null, 2);

    const blob = new Blob([jsonString], { type: 'application/json' });

    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    const a = document.createElement('a');
    a.href = url;
    a.download = `sensor-logs-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  sendData(): void {
    const data: SensorData = {
      distance: this.distance,
      status: this.status,
      timestamp: new Date().toISOString()
    };

    // Simulate
    setTimeout(() => {
      this.serverResponse = {
        success: true,
        message: 'Data received successfully',
        data: data,
        serverTime: new Date().toISOString()
      };
    }, 200);

    /*
    this.http.post<any>('https://localhost:3000/sensor-data', data)
      .subscribe(
        response => {
          this.serverResponse = response;
        },
        error => {
          this.serverResponse = {
            success: false,
            message: 'Error sending data',
            error: error.message
          };
        }
      );
    */
  }
}