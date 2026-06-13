// src/app/features/auth/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form: FormGroup;
  carregando = false;
  mensagem: { tipo: 'success' | 'error'; texto: string } | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.carregando = true;
    this.mensagem = null;
    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: () => {
        this.mensagem = { tipo: 'success', texto: 'Login realizado! Redirecionando...' };
        setTimeout(() => this.router.navigate(['/dashboard']), 1200);
      },
      error: (err) => {
        this.carregando = false;
        this.mensagem = { tipo: 'error', texto: err?.error?.message || 'Usuário ou senha incorretos' };
      }
    });
  }

  temErro(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
  erroMsg(campo: string): string {
    const c = this.form.get(campo);
    if (c?.errors?.['required']) return 'Campo obrigatório';
    if (c?.errors?.['minlength']) return `Mínimo ${c.errors['minlength'].requiredLength} caracteres`;
    return '';
  }
}