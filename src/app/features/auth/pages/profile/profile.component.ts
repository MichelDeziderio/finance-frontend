import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, PasswordModule, MessageModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly user = this.auth.currentUser;
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  submit(): void {
    if (this.saving()) return;
    this.error.set('');
    this.success.set('');

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.passwordForm.controls.confirmPassword.setErrors({ mismatch: true });
      this.error.set('A confirmação deve ser igual à nova senha.');
      return;
    }
    if (currentPassword === newPassword) {
      this.error.set('A nova senha deve ser diferente da senha atual.');
      return;
    }

    this.saving.set(true);
    this.auth.changePassword({ currentPassword, newPassword }).subscribe({
      next: response => {
        this.saving.set(false);
        this.passwordForm.reset();
        this.success.set(response.message || 'Senha alterada com sucesso.');
      },
      error: response => {
        this.saving.set(false);
        const message = response?.error?.message;
        this.error.set(
          typeof message === 'string'
            ? message
            : Array.isArray(message)
              ? message.join(' ')
              : 'Não foi possível alterar a senha. Tente novamente.'
        );
      },
    });
  }
}
