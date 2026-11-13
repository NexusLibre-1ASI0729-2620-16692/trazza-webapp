import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe } from '@ngx-translate/core';
import { Vehicle } from '../../../domain/model/vehicle.entity';

@Component({
  selector: 'app-vehicle-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, TranslatePipe],
  templateUrl: './vehicle-card.component.html',
  styleUrls: ['./vehicle-card.component.css']
})
export class VehicleCardComponent {
  @Input({ required: true }) vehicle!: Vehicle;
  @Output() edit = new EventEmitter<Vehicle>();
  @Output() toggle = new EventEmitter<Vehicle>();
  @Output() remove = new EventEmitter<Vehicle>();
}
