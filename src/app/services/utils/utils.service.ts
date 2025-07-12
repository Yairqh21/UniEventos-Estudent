import { Injectable } from '@angular/core';
import {
  AlertController,
  LoadingController,
  ModalController,
  ToastController,
  ModalOptions
} from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({ providedIn: 'root' })
export class UtilsService {
  private currentLoading: HTMLIonLoadingElement | null = null;

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) { }

  // ========== Loading ==========
  async presentLoading(message: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingCtrl.create({
      message,
      spinner: 'circles',
      translucent: true
    });
    await loading.present();
    return loading;
  }

  async dismissLoading(loading?: HTMLIonLoadingElement): Promise<void> {
    if (loading) {
      await loading.dismiss();
    }
  }

  // ========== Toast ==========
  async toast(
    message: string,
    position: 'top' | 'middle' | 'bottom' = 'bottom',
    duration: number = 3000,
    color?: string
  ) {
    const toast = await this.toastCtrl.create({ message, duration, position, color });
    await toast.present();
  }

  // ========== Confirm Alert ==========
  async showConfirm(
    header: string,
    message?: string,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar'
  ): Promise<boolean> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [
        { text: cancelText, role: 'cancel' },
        { text: confirmText, role: 'confirm' },
      ],
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }

  // ========== Modal ==========
  async presentModal(opts: ModalOptions) {
    const modal = await this.modalCtrl.create(opts);
    await modal.present();
    const { data } = await modal.onWillDismiss();
    return data;
  }

  dismissModal(data?: any) {
    return this.modalCtrl.dismiss(data);
  }

  // ========== Camera ==========
  async takePicture(promptLabelHeader: string) {
    return await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt,
      promptLabelHeader,
      promptLabelPhoto: 'Elegir imagen',
      promptLabelPicture: 'Toma una foto',
    });
  }
}
