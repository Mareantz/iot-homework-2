import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorTableComponent } from './sensor-table.component';

describe('SensorTableComponent', () => {
  let component: SensorTableComponent;
  let fixture: ComponentFixture<SensorTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensorTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
