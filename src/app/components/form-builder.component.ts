import { Component, ChangeDetectorRef, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';
import { ElementCatalogComponent } from '../element-catalog/element-catalog.component';
import { ActionBarComponent } from '../action-bar/action-bar.component';

interface FormElementType {
  type: string;
  label: string;
  icon: string;
  category: string;
  newTag?: boolean;
}

interface FormElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  options?: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  children?: FormElement[]; // Only for grid elements
}

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDeleteDialogComponent, ElementCatalogComponent, ActionBarComponent],
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.css']
})
export class FormBuilderComponent implements OnInit, OnDestroy {
  searchTerm = '';

  availableElements: FormElementType[] = [
    
    // Basic Info
    { type: 'name', label: 'Name', icon: '👤', category: 'Basic Info' },
    { type: 'address', label: 'Address', icon: '📒', category: 'Basic Info' },
    { type: 'phone', label: 'Phone', icon: '📱', category: 'Basic Info' },
    { type: 'email', label: 'Email', icon: '✉️', category: 'Basic Info' },
    { type: 'website', label: 'Website', icon: '🌐', category: 'Basic Info' },
    // Textbox
    { type: 'textbox-single', label: 'Single Line', icon: '📝', category: 'Textbox' },
    { type: 'textbox-multi', label: 'Multi Line', icon: '🗒️', category: 'Textbox' },
    // Number
    { type: 'number', label: 'Number', icon: '123', category: 'Number' },
    { type: 'decimal', label: 'Decimal', icon: '.00', category: 'Number' },
    { type: 'formula', label: 'Formula', icon: 'ƒx', category: 'Number' },
    { type: 'currency', label: 'Currency', icon: '💵', category: 'Number' },
    // Choices
    { type: 'dropdown', label: 'Dropdown', icon: '▾', category: 'Choices' },
    { type: 'radio', label: 'Radio', icon: '⦿', category: 'Choices' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️', category: 'Choices' },
    { type: 'multiple-choice', label: 'Multiple Choice', icon: '≡', category: 'Choices' },
    // Date & Time
    { type: 'date', label: 'Date', icon: '📅', category: 'Date & Time' },
    { type: 'time', label: 'Time', icon: '⏰', category: 'Date & Time' },
    { type: 'date-time', label: 'Date-Time', icon: '🗓️', category: 'Date & Time' },
    { type: 'month-year', label: 'Month-Year', icon: '🗓️', category: 'Date & Time' },
    // Legal & Consent
    { type: 'terms', label: 'Terms and Conditions', icon: '📄', category: 'Legal & Consent' },
    { type: 'signature', label: 'Signature', icon: '✍️', category: 'Legal & Consent' },
    { type: 'decision-box', label: 'Decision Box', icon: '☑️', category: 'Legal & Consent' },
    // Page Elements
    { type: 'section', label: 'Section', icon: '☰', category: 'Page Elements' },
    { type: 'page-break', label: 'Page Break', icon: '⎯⎯', category: 'Page Elements' },
  ];

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

  getElementIcon(type: string): string {
    return this.availableElements.find(e => e.type === type)?.icon || '❓';
  }

  getElementLabel(type: string): string {
    return this.availableElements.find(e => e.type === type)?.label || type;
  }

  formElements: FormElement[] = [];
  draggedElement: any = null;
  isDragging = false;
  activeDropZone: number | null = null;
  activeGridDropZoneId: string | null = null;
  hoveredElementId: string | null = null;
  private globalClickHandler = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    // If click is inside a form-element or action-bar, do nothing
    if (target.closest('.form-element') || target.closest('.action-bar')) {
      // If inside a form-element, set selectedElementId to hoveredElementId
      if (target.closest('.form-element')) {
        const formElementDiv = target.closest('.form-element');
        if (formElementDiv && formElementDiv.hasAttribute('data-element-id')) {
          this.selectedElementId = formElementDiv.getAttribute('data-element-id');
        }
      }
      return;
    }
    this.hoveredElementId = null;
    this.selectedElementId = null;
    this.cdr.detectChanges();
  };

  // Dialog state
  showDeleteDialog = false;
  elementIdToDelete: string | null = null;
  selectedElementId: string | null = null;

  constructor(private cdr: ChangeDetectorRef, private elRef: ElementRef) {}

  ngOnInit() {
    document.addEventListener('mousedown', this.globalClickHandler, true);
  }

  ngOnDestroy() {
    document.removeEventListener('mousedown', this.globalClickHandler, true);
  }

  setSelectedElement(id: string) {
    console.log('setSelectedElement called with:', id);
    this.selectedElementId = id;
  }

  clearSelectedElement() {
    this.selectedElementId = null;
  }

  // Step 1: Start dragging from left panel
  onDragStart(event: DragEvent, element: any) {
    console.log('Drag start:', element);
    this.draggedElement = element;
    this.isDragging = true;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('text/plain', JSON.stringify(element));
    }
  }

  // Step 2: Handle drag over the form area
  onFormAreaDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.isDragging || !this.draggedElement) return;
    
    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const y = event.clientY - rect.top;
    
    // Calculate which drop zone to activate
    const dropZoneIndex = this.calculateDropZoneIndex(y, container);
    
    if (this.activeDropZone !== dropZoneIndex) {
      this.activeDropZone = dropZoneIndex;
      this.cdr.detectChanges();
      console.log('Active drop zone:', dropZoneIndex);
    }
  }

  // Step 3: Handle drop on form area
  onFormAreaDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.draggedElement) return;
    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const insertIndex = this.calculateDropZoneIndex(y, container);
    console.log('Dropping element at index:', insertIndex);
    let newElement: FormElement;
    if (this.draggedElement.type === 'grid-1') {
      newElement = {
        id: this.generateId(),
        type: this.draggedElement.type,
        label: this.draggedElement.label,
        x: 0, y: 0, width: 100, height: 60,
        children: []
      };
    } else {
      newElement = {
        id: this.generateId(),
        type: this.draggedElement.type,
        label: this.draggedElement.label,
        placeholder: this.draggedElement.type === 'textbox' ? 'Enter text here' : '',
        options: this.draggedElement.type === 'dropdown' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
        x: 0, y: 0, width: 100, height: 60
      };
    }
    this.formElements.splice(insertIndex, 0, newElement);
    this.resetDragState();
  }

  // Step 4: Handle drag leave
  onFormAreaDragLeave(event: DragEvent) {
    if (!event.relatedTarget || !(event.relatedTarget as Element).closest('.form-elements-container')) {
      this.resetDragState();
    }
  }

  // Helper method to calculate drop zone index
  private calculateDropZoneIndex(mouseY: number, container: HTMLElement): number {
    const elements = container.querySelectorAll('.form-element');
    const dropZones = container.querySelectorAll('.drop-zone');
    
    // If no elements, insert at beginning
    if (elements.length === 0) return 0;
    
    // Find which drop zone the mouse is over
    for (let i = 0; i < dropZones.length; i++) {
      const dropZone = dropZones[i] as HTMLElement;
      const dropZoneRect = dropZone.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const dropZoneY = dropZoneRect.top - containerRect.top;
      const dropZoneHeight = dropZoneRect.height;
      
      if (mouseY >= dropZoneY && mouseY <= dropZoneY + dropZoneHeight) {
        return i;
      }
    }
    
    // If mouse is below all elements, insert at end
    return this.formElements.length;
  }

  // Reset drag state
  private resetDragState() {
    this.draggedElement = null;
    this.isDragging = false;
    this.activeDropZone = null;
    this.cdr.detectChanges();
  }

  // Element reordering (for existing elements)
  onElementDragStart(event: DragEvent, element: FormElement) {
    this.isDragging = true;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', element.id);
    }
  }

  onElementDragEnd(event: DragEvent, element: FormElement) {
    this.isDragging = false;
    this.activeDropZone = null;
  }

  onElementDrop(event: DragEvent, targetElement: FormElement) {
    event.preventDefault();
    const draggedId = event.dataTransfer?.getData('text/plain');
    if (draggedId && draggedId !== targetElement.id) {
      const draggedIndex = this.formElements.findIndex(el => el.id === draggedId);
      const targetIndex = this.formElements.findIndex(el => el.id === targetElement.id);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const draggedElement = this.formElements[draggedIndex];
        this.formElements.splice(draggedIndex, 1);
        this.formElements.splice(targetIndex, 0, draggedElement);
      }
    }
  }

  onElementDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onSettingsClick(element: FormElement) {
    // TODO: Implement settings click logic
    console.log('Settings clicked for', element);
  }

  onDuplicateClick(element: FormElement) {
    // TODO: Implement duplicate logic
    console.log('Duplicate clicked for', element);
  }

  onDeleteMouseDown(event: Event) {
    event.stopPropagation();
  }

  // Show dialog instead of immediate delete
  requestRemoveElement(elementId: string) {
    this.elementIdToDelete = elementId;
    this.showDeleteDialog = true;
    this.cdr.detectChanges();
  }

  showDeleteTestAlert(elementId: string, event: Event) {
    this.requestRemoveElement(elementId);
    event.stopPropagation();
  }

  private removeElementById(elements: FormElement[], id: string): boolean {
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].id === id) {
        elements.splice(i, 1);
        return true;
      }
      if ((elements[i].children ?? []).length > 0) {
        const removed = this.removeElementById(elements[i].children!, id);
        if (removed) return true;
      }
    }
    return false;
  }

  confirmDelete() {
    console.log('confirmDelete called, deleting', this.elementIdToDelete);
    if (this.elementIdToDelete) {
      this.removeElementById(this.formElements, this.elementIdToDelete);
    }
    this.showDeleteDialog = false;
    this.elementIdToDelete = null;
  }

  cancelDelete() {
    console.log('cancelDelete called in form-builder');
    this.showDeleteDialog = false;
    this.elementIdToDelete = null;
  }

  trackByElementId(index: number, element: FormElement): string {
    return element.id;
  }

  private generateId(): string {
    return 'element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  onGridDrop(event: DragEvent, gridElement: FormElement) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.draggedElement || !(gridElement.children) || (gridElement.children ?? []).length > 0) return;
    const newChild: FormElement = {
      id: this.generateId(),
      type: this.draggedElement.type,
      label: this.draggedElement.label,
      placeholder: this.draggedElement.type === 'textbox' ? 'Enter text here' : '',
      options: this.draggedElement.type === 'dropdown' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      x: 0, y: 0, width: 100, height: 60
    };
    gridElement.children!.push(newChild);
    this.resetDragState();
    this.activeGridDropZoneId = null;
    this.cdr.detectChanges();
  }

  onGridDragOver(event: DragEvent, gridElement: FormElement) {
    event.preventDefault();
    event.stopPropagation();
    this.activeGridDropZoneId = gridElement.id;
    this.cdr.detectChanges();
  }
  onGridDragLeave(event: DragEvent, gridElement: FormElement) {
    event.preventDefault();
    event.stopPropagation();
    if (this.activeGridDropZoneId === gridElement.id) {
      this.activeGridDropZoneId = null;
      this.cdr.detectChanges();
    }
  }
} 