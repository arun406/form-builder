import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FormElementType {
  type: string;
  label: string;
  icon: string;
  category: string;
  newTag?: boolean;
}

@Component({
  selector: 'app-element-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './element-catalog.component.html',
  styleUrl: './element-catalog.component.css'
})
export class ElementCatalogComponent {
  @Input() availableElements: FormElementType[] = [];
  @Input() searchTerm = '';
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() dragStart = new EventEmitter<{ event: DragEvent, element: FormElementType }>();

  get filteredElements() {
    if (!this.searchTerm.trim()) return this.availableElements;
    const term = this.searchTerm.trim().toLowerCase();
    return this.availableElements.filter(e =>
      e.label.toLowerCase().includes(term) ||
      e.category.toLowerCase().includes(term)
    );
  }

  getElementsByCategory(category: string) {
    return this.filteredElements.filter(e => e.category === category);
  }

  get uniqueCategories() {
    return this.filteredElements
      .map(e => e.category)
      .filter((category, i, arr) => arr.indexOf(category) === i);
  }

  onDragStart(event: DragEvent, element: FormElementType) {
    this.dragStart.emit({ event, element });
  }
}
