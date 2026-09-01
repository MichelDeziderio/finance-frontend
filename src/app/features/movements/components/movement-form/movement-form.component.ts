import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FinanceService } from '../../../../core/services/finance.service';
import { MovementType } from '../../../../models/finance.models';
import { CategoryDialogComponent } from '../../../categories/components/category-dialog/category-dialog.component';

@Component({
  selector: 'app-movement-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    TextareaModule,
    ToastModule,
    CategoryDialogComponent
  ],
  providers: [MessageService],
  templateUrl: './movement-form.component.html',
  styleUrl: './movement-form.component.scss'
})
export class MovementFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  readonly financeService = inject(FinanceService);

  readonly movementType = signal<MovementType>('income');
  readonly categoryDialogVisible = signal(false);
  readonly movementId = this.route.snapshot.paramMap.get('id');
  readonly editing = !!this.movementId;

  readonly paymentMethods = [
    'Pix',
    'Cartão de Crédito',
    'Cartão de Débito',
    'Dinheiro',
    'Conta bancária',
    'Boleto'
  ];

  readonly availableCategories = computed(() =>
    this.financeService.categories().filter(category => category.type === this.movementType())
  );

  readonly form = this.fb.nonNullable.group({
    type: this.fb.nonNullable.control<MovementType>('income', Validators.required),
    description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    categoryId: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [new Date(), Validators.required],
    paymentMethod: ['', Validators.required],
    notes: ['', Validators.maxLength(200)]
  });

  constructor() {
    effect(() => {
      const walletId = this.financeService.activeWalletId();
      if (!walletId) return;

      if (this.movementId) {
        this.financeService.getMovementById(this.movementId).subscribe(movement => {
          if (!movement) return;
          this.movementType.set(movement.type);
          this.form.patchValue({
            type: movement.type,
            description: movement.description,
            categoryId: movement.categoryId,
            amount: movement.amount,
            date: new Date(`${movement.date}T12:00:00`),
            paymentMethod: movement.paymentMethod,
            notes: movement.notes ?? ''
          });
        });
      }
    });
  }

  setType(type: MovementType): void {
    this.movementType.set(type);
    this.form.controls.type.setValue(type);

    const selectedCategory = this.financeService.categories().find(
      category => category.id === this.form.controls.categoryId.value
    );

    if (selectedCategory?.type !== type) {
      this.form.controls.categoryId.setValue('');
    }
  }

  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Revise o formulário',
        detail: 'Preencha corretamente os campos obrigatórios.'
      });
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      date: this.toDateString(raw.date),
      notes: raw.notes.trim() || undefined
    };

    const request$ = this.editing && this.movementId
      ? this.financeService.updateMovement(this.movementId, payload)
      : this.financeService.createMovement(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'A sua movimentação foi criada com sucesso.' });
        this.form.reset();
      },
      error: error => this.messageService.add({
        severity: 'error',
        summary: 'Erro ao salvar',
        detail: error?.error?.message ?? 'Não foi possível salvar a movimentação.'
      })
    });
  }

  cancel(): void {
    this.router.navigate(['/movimentacoes/nova']);
  }

  onCategoryCreated(categoryId: string): void {
    this.form.controls.categoryId.setValue(categoryId);
    this.messageService.add({ severity: 'success', summary: 'Categoria criada', detail: 'A categoria já foi selecionada.' });
  }

  private toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
