import { EventEmitter, Output, Component, Input } from '@angular/core';


@Component({
  selector: 'info-modal',
  template: `

<div class="modal-overlay" *ngIf="show">
  <div class="modal-content">

    <!-- Botón de cerrar -->
    <ion-button class="close-button" fill="clear" size="small" (click)="handleClose()">
      <ion-icon name="close"></ion-icon>
    </ion-button>

    <!-- Mensaje de éxito -->
    <div *ngIf="!isLoading" class="info-section">
      <ion-icon [name]="icon" class="info-icon"></ion-icon>
      <h2 class="info-title">{{ title }}</h2>
      <p class="info-subtitle">{{ subtitle }}</p>
      <p *ngIf="additionalInfo" class="info-code"><strong>{{ additionalInfo }}</strong></p>
    </div>

    <!-- Spinner de carga -->
    <div *ngIf="isLoading" class="spinner-section">
      <ion-spinner name="crescent"></ion-spinner>
      <p>Registrando...</p>
    </div>

  </div>
</div>


  `,
  styleUrl: './InfoModal.component.scss'
})
export class InfoModalComponent {
  @Input() icon: string;
  @Input() title: string;
  @Input() subtitle: string;
  @Input() additionalInfo: string;
  @Input() isLoading: boolean = false;
  @Input() show: boolean = false;

  @Output() close = new EventEmitter<void>();

  handleClose(): void {
    this.close.emit();
  }


}
