import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FinanceService } from '../../../../core/services/finance.service';
import { CategoryDialogComponent } from '../../components/category-dialog/category-dialog.component';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [ButtonModule, TableModule, TagModule, ToastModule, CategoryDialogComponent],
  providers: [MessageService],
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss'
})
export class CategoriesListComponent {
  readonly financeService = inject(FinanceService);
  private readonly messageService = inject(MessageService);
  readonly categoryDialogVisible = signal(false);

  remove(id: string): void {
    const category = this.financeService.categories().find(item => item.id === id);
    if (category?.isDefault) {
      this.messageService.add({ severity: 'warn', summary: 'Categoria padrão', detail: 'Categorias padrão não podem ser excluídas.' });
      return;
    }

    this.financeService.deleteCategory(id).subscribe(success => {
      this.messageService.add({
        severity: success ? 'success' : 'warn',
        summary: success ? 'Categoria removida' : 'Categoria não removida',
        detail: success
          ? 'A categoria foi excluída com sucesso.'
          : 'A categoria pode estar em uso ou ser uma categoria padrão.'
      });
    });
  }

  created(): void {
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Categoria criada com sucesso.' });
  }
}
