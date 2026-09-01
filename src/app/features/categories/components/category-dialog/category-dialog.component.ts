import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ColorPickerModule } from 'primeng/colorpicker';
import { MessageModule } from 'primeng/message';
import { FinanceService } from '../../../../core/services/finance.service';
import { MovementType } from '../../../../models/finance.models';

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectButtonModule,
    ColorPickerModule,
    MessageModule
  ],
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.scss'
})
export class CategoryDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly financeService = inject(FinanceService);

  @Input() visible = false;
  @Input() forcedType?: MovementType;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() categoryCreated = new EventEmitter<string>();

  readonly typeOptions = [
    { label: 'Receita', value: 'income', icon: 'pi pi-arrow-up' },
    { label: 'Despesa', value: 'expense', icon: 'pi pi-arrow-down' }
  ];

  readonly presetColors = [
    '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
    '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
    '#64748B', '#475569'
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
    type: this.fb.nonNullable.control<MovementType>('expense', Validators.required),
    color: ['#22C55E', Validators.required]
  });

  ngOnChanges(): void {
    if (this.forcedType) this.form.controls.type.setValue(this.forcedType);
  }

  chooseColor(color: string): void {
    this.form.controls.color.setValue(color);
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const name = this.form.controls.name.value.trim();
    const duplicated = this.financeService.categories().some(category =>
      category.name.toLocaleLowerCase() === name.toLocaleLowerCase() &&
      category.type === this.form.controls.type.value
    );

    if (duplicated) {
      this.form.controls.name.setErrors({ duplicated: true });
      return;
    }

    this.financeService.createCategory({ ...this.form.getRawValue(), name }).subscribe(category => {
      this.categoryCreated.emit(category.id);
      this.form.reset({ name: '', type: this.forcedType ?? 'expense', color: '#22C55E' });
      this.close();
    });
  }
}
