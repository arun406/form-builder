import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-bar.component.html',
  styleUrl: './action-bar.component.css'
})
export class ActionBarComponent {
  @Output() settings = new EventEmitter<void>();
  @Output() duplicate = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() deleteMouseDown = new EventEmitter<MouseEvent>();
  @Input() elementId: string | null = null;
  @Input() selected: boolean = false;
  @Input() isDragging: boolean = false;

  deleteClicked(event: MouseEvent) {
    this.delete.emit();
    event.stopPropagation();
  }
}
