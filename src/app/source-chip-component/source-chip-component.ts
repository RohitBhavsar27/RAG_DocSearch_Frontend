import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-source-chip-component',
  imports: [],
  templateUrl: './source-chip-component.html',
  styleUrl: './source-chip-component.css'
})
export class SourceChipComponent {
    @Input() label = 'Source';
    @Output() clicked = new EventEmitter<void>();
}
