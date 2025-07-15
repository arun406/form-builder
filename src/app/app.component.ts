import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FormBuilderComponent } from './components/form-builder.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [HeaderComponent, FormBuilderComponent],
  standalone: true
})
export class AppComponent {
  title = 'form-builder-app';
}
