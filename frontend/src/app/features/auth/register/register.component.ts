// src/app/features/auth/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { emailValidator } from '../../../shared/utils/validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  form: FormGroup;
  carregando = false;
  mensagem: { tipo: 'success' | 'error'; texto: string } | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email:    ['', [Validators.required, emailValidator()]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.carregando = true;
    this.http.post(`${environment.apiUrl}/auth/register`, this.form.value).subscribe({
      next: () => {
        this.mensagem = { tipo: 'success', texto: 'Cadastro realizado! Redirecionando para login...' };
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.carregando = false;
        this.mensagem = { tipo: 'error', texto: err?.error?.message || 'Erro ao realizar cadastro' };
      }
    });
  }

  formatarEmail(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limpo = input.value.toLowerCase().replace(/\s/g, '');
    input.value = limpo;
    this.form.get('email')?.setValue(limpo, { emitEvent: false });
  }

  temErro(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
  erroMsg(campo: string): string {
    const c = this.form.get(campo);
    if (c?.errors?.['required'])   return 'Campo obrigatório';
    if (c?.errors?.['minlength'])  return `Mínimo ${c.errors['minlength'].requiredLength} caracteres`;
    if (c?.errors?.['emailInvalido']) return 'E-mail inválido. Ex: nome@dominio.com';
    if (c?.errors?.['pattern'])       return 'Formato inválido';
    return '';
  }
}