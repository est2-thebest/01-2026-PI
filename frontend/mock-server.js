const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data
const usuarios = [
  { id: 1, username: 'admin', password: 'admin123', role: 'ADMIN' },
  { id: 2, username: 'user', password: 'user123', role: 'USER' }
];

const ocorrencias = [
  { id: 1, tipo: 'Acidente', gravidade: 'ALTA', status: 'ABERTA', bairroId: 1, dataHoraAbertura: [2026, 6, 4, 10, 30, 0], observacao: 'Acidente na rua principal' },
  { id: 2, tipo: 'Mal súbito', gravidade: 'MEDIA', status: 'DESPACHADA', bairroId: 2, dataHoraAbertura: [2026, 6, 4, 11, 15, 0], dataDespacho: [2026, 6, 4, 11, 20, 0], observacao: 'Paciente com febre alta' }
];

const ambulancias = [
  { id: 1, placa: 'SOC-0001', tipo: 'USA', status: 'DISPONIVEL', bairroId: 1 },
  { id: 2, placa: 'SOC-0002', tipo: 'USB', status: 'DISPONIVEL', bairroId: 2 }
];

const bairros = [
  { id: 1, nome: 'Centro' },
  { id: 2, nome: 'Zona Norte' },
  { id: 3, nome: 'Zona Sul' }
];

const profissionais = [
  { id: 1, nome: 'Dr. João', role: 'Médico', ativo: true },
  { id: 2, nome: 'Enf. Maria', role: 'Enfermeiro', ativo: true },
  { id: 3, nome: 'Motorista Pedro', role: 'Motorista', ativo: true }
];

const equipes = [
  { id: 1, descricao: 'Equipe A', turno: 'MATUTINO', ambulanciaId: 1, profissionaisIds: [1, 2, 3] }
];

// Rotas de Autenticação
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const usuario = usuarios.find(u => u.username === username && u.password === password);
  
  if (usuario) {
    res.json({
      token: `fake-jwt-token-${usuario.id}`,
      username: usuario.username,
      role: usuario.role
    });
  } else {
    res.status(401).json({ message: 'Usuário ou senha incorretos' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  
  if (usuarios.some(u => u.username === username)) {
    return res.status(400).json({ message: 'Usuário já existe' });
  }
  
  const novoUsuario = { 
    id: usuarios.length + 1, 
    username, 
    password, 
    role: 'USER' 
  };
  usuarios.push(novoUsuario);
  
  res.status(201).json({
    token: `fake-jwt-token-${novoUsuario.id}`,
    username: novoUsuario.username,
    role: novoUsuario.role
  });
});

// Rotas de Ocorrências
app.get('/api/ocorrencias', (req, res) => {
  const ocorrenciasComBairro = ocorrencias.map(oc => ({
    ...oc,
    bairro: bairros.find(b => b.id === oc.bairroId)
  }));
  res.json(ocorrenciasComBairro);
});

app.post('/api/ocorrencias', (req, res) => {
  const novaOcorrencia = {
    id: ocorrencias.length + 1,
    ...req.body,
    status: 'ABERTA',
    dataHoraAbertura: [2026, 6, 4, new Date().getHours(), new Date().getMinutes(), 0]
  };
  ocorrencias.push(novaOcorrencia);
  res.status(201).json(novaOcorrencia);
});

app.put('/api/ocorrencias/:id/despachar', (req, res) => {
  const oc = ocorrencias.find(o => o.id == req.params.id);
  if (oc) {
    oc.status = 'DESPACHADA';
    oc.dataDespacho = [2026, 6, 4, new Date().getHours(), new Date().getMinutes(), 0];
    res.json(oc);
  } else {
    res.status(404).json({ message: 'Ocorrência não encontrada' });
  }
});

app.put('/api/ocorrencias/:id/concluir', (req, res) => {
  const oc = ocorrencias.find(o => o.id == req.params.id);
  if (oc) {
    oc.status = 'CONCLUIDA';
    oc.dataHoraFechamento = [2026, 6, 4, new Date().getHours(), new Date().getMinutes(), 0];
    res.json(oc);
  } else {
    res.status(404).json({ message: 'Ocorrência não encontrada' });
  }
});

app.delete('/api/ocorrencias/:id', (req, res) => {
  const idx = ocorrencias.findIndex(o => o.id == req.params.id);
  if (idx >= 0) {
    ocorrencias.splice(idx, 1);
    res.json({ message: 'Ocorrência cancelada' });
  } else {
    res.status(404).json({ message: 'Ocorrência não encontrada' });
  }
});

// Rotas de Ambulâncias
app.get('/api/ambulancias', (req, res) => {
  res.json(ambulancias);
});

app.post('/api/ambulancias', (req, res) => {
  const novaAmbulancia = { id: ambulancias.length + 1, ...req.body };
  ambulancias.push(novaAmbulancia);
  res.status(201).json(novaAmbulancia);
});

app.delete('/api/ambulancias/:id', (req, res) => {
  const idx = ambulancias.findIndex(a => a.id == req.params.id);
  if (idx >= 0) {
    ambulancias.splice(idx, 1);
    res.json({ message: 'Ambulância deletada' });
  } else {
    res.status(404).json({ message: 'Ambulância não encontrada' });
  }
});

// Rotas de Bairros
app.get('/api/bairros', (req, res) => {
  res.json(bairros);
});

// Rotas de Profissionais
app.get('/api/profissionais', (req, res) => {
  res.json(profissionais);
});

app.post('/api/profissionais', (req, res) => {
  const novoProfissional = { id: profissionais.length + 1, ...req.body };
  profissionais.push(novoProfissional);
  res.status(201).json(novoProfissional);
});

app.delete('/api/profissionais/:id', (req, res) => {
  const idx = profissionais.findIndex(p => p.id == req.params.id);
  if (idx >= 0) {
    profissionais.splice(idx, 1);
    res.json({ message: 'Profissional deletado' });
  } else {
    res.status(404).json({ message: 'Profissional não encontrado' });
  }
});

// Rotas de Equipes
app.get('/api/equipes', (req, res) => {
  const equipesComDados = equipes.map(eq => ({
    ...eq,
    ambulancia: ambulancias.find(a => a.id === eq.ambulanciaId),
    profissionais: profissionais.filter(p => eq.profissionaisIds.includes(p.id))
  }));
  res.json(equipesComDados);
});

app.post('/api/equipes', (req, res) => {
  const novaEquipe = { id: equipes.length + 1, ...req.body };
  equipes.push(novaEquipe);
  res.status(201).json(novaEquipe);
});

app.delete('/api/equipes/:id', (req, res) => {
  const idx = equipes.findIndex(e => e.id == req.params.id);
  if (idx >= 0) {
    equipes.splice(idx, 1);
    res.json({ message: 'Equipe deletada' });
  } else {
    res.status(404).json({ message: 'Equipe não encontrada' });
  }
});

// Rotas de Dashboard
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalOcorrencias: ocorrencias.length,
    ocorrenciasAbertas: ocorrencias.filter(o => o.status === 'ABERTA').length,
    ambulanciasDisponiveis: ambulancias.filter(a => a.status === 'DISPONIVEL').length,
    profissionaisAtivos: profissionais.filter(p => p.ativo).length
  });
});

app.get('/api/dashboard/ocorrencias-recentes', (req, res) => {
  const recentes = ocorrencias.slice(0, 5).map(oc => ({
    ...oc,
    bairro: bairros.find(b => b.id === oc.bairroId)
  }));
  res.json(recentes);
});

// Rotas de Relatórios
app.get('/api/relatorios/ocorrencias', (req, res) => {
  const ocorrenciasComBairro = ocorrencias.map(oc => ({
    ...oc,
    bairro: bairros.find(b => b.id === oc.bairroId)
  }));
  res.json(ocorrenciasComBairro);
});

app.get('/api/relatorios/por-bairro', (req, res) => {
  const porBairro = bairros.map(b => ({
    bairro: b.nome,
    quantidade: ocorrencias.filter(o => o.bairroId === b.id).length
  }));
  res.json(porBairro);
});

app.get('/api/relatorios/csv', (req, res) => {
  let csv = 'ID,Tipo,Gravidade,Status,Bairro,Data Abertura\n';
  ocorrencias.forEach(oc => {
    const bairro = bairros.find(b => b.id === oc.bairroId)?.nome || 'N/A';
    const data = `${oc.dataHoraAbertura[2]}/${oc.dataHoraAbertura[1]}/${oc.dataHoraAbertura[0]} ${oc.dataHoraAbertura[3]}:${oc.dataHoraAbertura[4]}`;
    csv += `${oc.id},${oc.tipo},${oc.gravidade},${oc.status},${bairro},${data}\n`;
  });
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`\n✅ Mock Server rodando em http://localhost:${PORT}`);
  console.log(`\n📋 Endpoints disponíveis:`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   POST   /api/auth/register`);
  console.log(`   GET    /api/ocorrencias`);
  console.log(`   POST   /api/ocorrencias`);
  console.log(`   GET    /api/ambulancias`);
  console.log(`   GET    /api/profissionais`);
  console.log(`   GET    /api/equipes`);
  console.log(`   GET    /api/bairros`);
  console.log(`   GET    /api/dashboard/stats`);
  console.log(`   GET    /api/relatorios/ocorrencias\n`);
});
