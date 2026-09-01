import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FinanceService } from '../../../../core/services/finance.service';
import { Wallet } from '../../../../models/finance.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ColorPickerModule,
    TooltipModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './wallets.component.html',
  styleUrl: './wallets.component.scss',
})
export class WalletsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  readonly financeService = inject(FinanceService);
  readonly router = inject(Router);

  showWalletDialog = false;
  selectedWalletId: string | null = null;

  readonly walletTypes = [
    { label: 'Pessoal', value: 'personal', icon: 'pi pi-user' },
    { label: 'Empresarial', value: 'business', icon: 'pi pi-building' }
  ];

  readonly defaultColors = [
    '#22c55e', '#3b82f6', '#a855f7', '#f97316',
    '#ef4444', '#06b6d4', '#eab308', '#ec4899'
  ];

  readonly walletForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
    type: this.fb.nonNullable.control<Wallet['type']>('personal', Validators.required),
    color: ['#22c55e', Validators.required]
  });

  openNewWallet(): void {
    this.selectedWalletId = null;
    this.walletForm.reset({ name: '', type: 'personal', color: '#22c55e' });
    this.showWalletDialog = true;
  }

  closeWalletDialog(): void {
    this.showWalletDialog = false;
    this.selectedWalletId = null;
    this.walletForm.reset({ name: '', type: 'personal', color: '#22c55e' });
  }

  selectColor(color: string): void {
    this.walletForm.controls.color.setValue(color);
  }

  saveWallet(): void {
    if (this.walletForm.invalid) {
      this.walletForm.markAllAsTouched();
      return;
    }

    const payload = this.walletForm.getRawValue();
    const request$ = this.selectedWalletId
      ? this.financeService.updateWallet(this.selectedWalletId, payload)
      : this.financeService.createWallet(payload);

    request$.subscribe({
      next: wallet => {
        this.financeService.setActiveWallet(wallet.id);
        this.messageService.add({
          severity: 'success',
          summary: this.selectedWalletId ? 'Carteira atualizada' : 'Carteira criada',
          detail: 'Os dados foram salvos com sucesso.'
        });
        this.closeWalletDialog();
      },
      error: error => this.showError(error, 'Não foi possível salvar a carteira.')
    });
  }

  selectWallet(wallet: Wallet): void {
    this.financeService.setActiveWallet(wallet.id);
    this.router.navigate(['/movimentacoes/nova']);
  }

  getWalletIcon(type: Wallet['type']): string {
    return type === 'personal' ? 'pi pi-user' : 'pi pi-building';
  }

  getWalletType(type: Wallet['type']): string {
    return type === 'personal' ? 'Pessoal' : 'Empresarial';
  }

  editWallet(wallet: Wallet): void {
    this.selectedWalletId = wallet.id;
    this.walletForm.patchValue(wallet);
    this.showWalletDialog = true;
  }

  deleteWallet(wallet: Wallet): void {
    this.financeService.deleteWallet(wallet.id).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'Carteira excluída', detail: 'Carteira e seus dados foram removidos.' }),
      error: error => this.showError(error, 'Não foi possível excluir a carteira.')
    });
  }

  private showError(error: any, fallback: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? fallback });
  }
}
