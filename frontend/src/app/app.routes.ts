import { Routes } from '@angular/router';
//import { authGuard } from './core/guards/auth.guard';
//import { MainLayoutComponent } from './app.component';

export const routes: Routes = [
  // { path: '', redirectTo: 'login', pathMatch: 'full' },

  // // Rotas públicas
  // { path: 'login',    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  // { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },

  // // Rotas protegidas (precisam de login)
  // {
  //   path: '',
  //   component: MainLayoutComponent,
  //   canActivate: [authGuard],
  //   children: [
  //     { path: 'dashboard',    loadComponent: () => import('./features/auth/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  //     { path: 'ocorrencias',  loadComponent: () => import('./features/auth/ocorrencias/ocorrencias.component').then(m => m.OcorrenciasComponent) },
  //     { path: 'ambulancias',  loadComponent: () => import('./features/auth/ambulancias/ambulancias.component').then(m => m.AmbulanciasComponent) },
  //     { path: 'equipes',      loadComponent: () => import('./features/auth/equipes/equipes.component').then(m => m.EquipesComponent) },
  //     { path: 'profissionais',loadComponent: () => import('./features/auth/profissionais/profissionais.component').then(m => m.ProfissionaisComponent) },
  //     { path: 'despacho',     loadComponent: () => import('./features/auth/despacho/despacho.component').then(m => m.DespachoComponent) },
  //     { path: 'relatorios',   loadComponent: () => import('./features/auth/relatorios/relatorios.component').then(m => m.RelatoriosComponent) },
  //   ]
  // },
  // { path: '**', redirectTo: 'login' }
];