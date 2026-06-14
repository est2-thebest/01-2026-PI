// Equivale ao interceptor do Axios do projeto React.
// Adiciona o header Authorization: Bearer <token> em todas as requisições
// exceto nas rotas de autenticação (/auth/login e /auth/register).
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

const TOKEN_KEY = 'sosrota_token';

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const ehRotaAuth = req.url.includes('/auth/login') || req.url.includes('/auth/register');
  if (!ehRotaAuth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
  }
  return next(req);
};