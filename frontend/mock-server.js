const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Gera próximo ID sem duplicatas mesmo após deleções
function nextId(arr) {
  return arr.length === 0 ? 1 : Math.max(...arr.map(item => item.id)) + 1;
}

// Mock data
const usuarios = [
  { id: 1, username: 'admin', password: 'admin123', role: 'ADMIN' },
  { id: 2, username: 'user', password: 'user123', role: 'USER' }
];

const ocorrencias = [
  { id: 1, tipo: 'Acidente',   gravidade: 'ALTA',  status: 'ABERTA',    bairroId: 5,  dataHoraAbertura: [2026, 6, 9, 8, 15, 0], observacao: 'Colisão entre veículos',
    historico: [{ id: 1, statusAnterior: null, statusNovo: 'ABERTA', dataHora: [2026, 6, 9, 8, 15, 0], observacao: '' }] },
  { id: 2, tipo: 'Mal súbito', gravidade: 'MEDIA', status: 'ABERTA',    bairroId: 16, dataHoraAbertura: [2026, 6, 9, 9, 40, 0], observacao: 'Paciente inconsciente',
    historico: [{ id: 1, statusAnterior: null, statusNovo: 'ABERTA', dataHora: [2026, 6, 9, 9, 40, 0], observacao: '' }] },
  { id: 3, tipo: 'Incêndio',   gravidade: 'ALTA',  status: 'DESPACHADA', bairroId: 13, dataHoraAbertura: [2026, 6, 9, 7, 0, 0], dataDespacho: [2026, 6, 9, 7, 8, 0], observacao: 'Vítimas com queimaduras',
    historico: [
      { id: 1, statusAnterior: null,    statusNovo: 'ABERTA',    dataHora: [2026, 6, 9, 7,  0, 0], observacao: '' },
      { id: 2, statusAnterior: 'ABERTA', statusNovo: 'DESPACHADA', dataHora: [2026, 6, 9, 7, 8, 0], observacao: '' }
    ] }
];

const ambulancias = [
  { id: 1, placa: 'SOC-0001', tipo: 'USA', status: 'DISPONIVEL', bairroId: 2,  possuiHistorico: false },
  { id: 2, placa: 'SOC-0002', tipo: 'USB', status: 'DISPONIVEL', bairroId: 9,  possuiHistorico: false },
  { id: 3, placa: 'SOC-0003', tipo: 'USA', status: 'SEM_EQUIPE', bairroId: 14, possuiHistorico: false }
];

const bairros = [
  { id:  1, nome: 'Jardim América'        },
  { id:  2, nome: 'Centro'                },
  { id:  3, nome: 'Setor Leste'           },
  { id:  4, nome: 'Vila Nova'             },
  { id:  5, nome: 'Alto da Serra'         },
  { id:  6, nome: 'Setor Oeste'           },
  { id:  7, nome: 'Distrito Industrial'   },
  { id:  8, nome: 'Residencial Esperança' },
  { id:  9, nome: 'Recanto Verde'         },
  { id: 10, nome: 'Ecoparque Sul'         },
  { id: 11, nome: 'Nova Alvorada'         },
  { id: 12, nome: 'Setor das Palmeiras'   },
  { id: 13, nome: 'Colina Azul'           },
  { id: 14, nome: 'Bela Vista'            },
  { id: 15, nome: 'Morada do Sol'         },
  { id: 16, nome: 'Setor Central II'      },
  { id: 17, nome: 'Lago Azul'             },
  { id: 18, nome: 'Residencial Florença'  },
  { id: 19, nome: 'Setor Industrial Norte'},
  { id: 20, nome: 'Vale do Cerrado'       }
];

const profissionais = [
  { id: 1, nome: 'Dr. João',        funcao: 'MEDICO',      role: 'MEDICO',      turno: 'MATUTINO', ativo: true },
  { id: 2, nome: 'Enf. Maria',      funcao: 'ENFERMEIRO',  role: 'ENFERMEIRO',  turno: 'MATUTINO', ativo: true },
  { id: 3, nome: 'Motorista Pedro', funcao: 'MOTORISTA',   role: 'MOTORISTA',   turno: 'MATUTINO', ativo: true },
  { id: 4, nome: 'Motorista Ana',   funcao: 'MOTORISTA',   role: 'MOTORISTA',   turno: 'MATUTINO', ativo: true }
];

const equipes = [
  { id: 1, descricao: 'Equipe Alpha', turno: 'MATUTINO', ambulanciaId: 1, profissionaisIds: [1, 2, 3], ativo: true, possuiHistorico: false },
  { id: 2, descricao: 'Equipe Beta',  turno: 'MATUTINO', ambulanciaId: 2, profissionaisIds: [4],       ativo: true, possuiHistorico: false }
];

// ──────────────────────────────────────────────────────────
// AUTENTICAÇÃO
// ──────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const usuario = usuarios.find(u => u.username === username && u.password === password);
  if (usuario) {
    res.json({ token: `fake-jwt-token-${usuario.id}`, username: usuario.username, role: usuario.role });
  } else {
    res.status(401).json({ message: 'Usuário ou senha incorretos' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (usuarios.some(u => u.username === username)) {
    return res.status(400).json({ message: 'Usuário já existe' });
  }
  const novoUsuario = { id: usuarios.length + 1, username, password, role: 'USER' };
  usuarios.push(novoUsuario);
  res.status(201).json({ token: `fake-jwt-token-${novoUsuario.id}`, username: novoUsuario.username, role: novoUsuario.role });
});

// ──────────────────────────────────────────────────────────
// OCORRÊNCIAS
// ──────────────────────────────────────────────────────────
function resolverOcorrencia(oc) {
  return { ...oc, bairro: bairros.find(b => b.id === oc.bairroId) || null };
}

app.get('/api/ocorrencias', (req, res) => {
  res.json(ocorrencias.map(resolverOcorrencia));
});

app.get('/api/ocorrencias/:id', (req, res) => {
  const oc = ocorrencias.find(o => o.id == req.params.id);
  if (oc) res.json(resolverOcorrencia(oc));
  else res.status(404).json({ message: 'Ocorrência não encontrada' });
});

app.post('/api/ocorrencias', (req, res) => {
  const agora = [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate(), new Date().getHours(), new Date().getMinutes(), 0];
  const novaOcorrencia = {
    id: nextId(ocorrencias),
    ...req.body,
    status: 'ABERTA',
    dataHoraAbertura: agora,
    historico: [{ id: 1, statusAnterior: null, statusNovo: 'ABERTA', dataHora: agora, observacao: '' }]
  };
  ocorrencias.push(novaOcorrencia);
  res.status(201).json(resolverOcorrencia(novaOcorrencia));
});

// Atualização geral (edição de tipo/gravidade/bairro/observacao)
app.put('/api/ocorrencias/:id', (req, res) => {
  const idx = ocorrencias.findIndex(o => o.id == req.params.id);
  if (idx >= 0) {
    const current = ocorrencias[idx];
    // Preserva status e dataHoraAbertura originais — só tipo/gravidade/bairro/obs podem mudar
    ocorrencias[idx] = {
      ...current,
      tipo:             req.body.tipo       || current.tipo,
      gravidade:        req.body.gravidade  || current.gravidade,
      bairroId:         req.body.bairroId   ?? current.bairroId,
      observacao:       req.body.observacao ?? current.observacao
    };
    res.json(resolverOcorrencia(ocorrencias[idx]));
  } else {
    res.status(404).json({ message: 'Ocorrência não encontrada' });
  }
});

app.put('/api/ocorrencias/:id/despachar', (req, res) => {
  const oc = ocorrencias.find(o => o.id == req.params.id);
  if (oc) {
    const agora = [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate(), new Date().getHours(), new Date().getMinutes(), 0];
    const statusAnterior = oc.status;
    oc.status = 'DESPACHADA';
    oc.dataDespacho = agora;
    if (!oc.historico) oc.historico = [];
    oc.historico.push({ id: oc.historico.length + 1, statusAnterior, statusNovo: 'DESPACHADA', dataHora: agora, observacao: '' });
    if (req.body && req.body.ambulanciaId) {
      oc.ambulanciaId = req.body.ambulanciaId;
      const amb = ambulancias.find(a => a.id === req.body.ambulanciaId);
      if (amb) {
        amb.status = 'EM_ATENDIMENTO';
        amb.possuiHistorico = true;
        const eq = equipes.find(e => e.ambulanciaId === amb.id);
        if (eq) eq.possuiHistorico = true;
      }
    }
    res.json(resolverOcorrencia(oc));
  } else {
    res.status(404).json({ message: 'Ocorrência não encontrada' });
  }
});

// confirmar-saida: DESPACHADA → EM_ATENDIMENTO
app.post('/api/ocorrencias/:id/confirmar-saida', (req, res) => {
  const oc = ocorrencias.find(o => o.id == req.params.id);
  if (oc) {
    const agora = [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate(), new Date().getHours(), new Date().getMinutes(), 0];
    const statusAnterior = oc.status;
    oc.status = 'EM_ATENDIMENTO';
    if (!oc.historico) oc.historico = [];
    oc.historico.push({ id: oc.historico.length + 1, statusAnterior, statusNovo: 'EM_ATENDIMENTO', dataHora: agora, observacao: '' });
    res.json(resolverOcorrencia(oc));
  } else {
    res.status(404).json({ message: 'Ocorrência não encontrada' });
  }
});

// concluir: EM_ATENDIMENTO → CONCLUIDA (aceita POST e PUT)
function concluirOcorrencia(oc) {
  const agora = [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate(), new Date().getHours(), new Date().getMinutes(), 0];
  const statusAnterior = oc.status;
  oc.status = 'CONCLUIDA';
  oc.dataHoraFechamento = agora;
  if (!oc.historico) oc.historico = [];
  oc.historico.push({ id: oc.historico.length + 1, statusAnterior, statusNovo: 'CONCLUIDA', dataHora: agora, observacao: '' });
  // Libera a ambulância e a equipe
  if (oc.ambulanciaId) {
    const amb = ambulancias.find(a => a.id === oc.ambulanciaId);
    if (amb) {
      amb.status = 'DISPONIVEL';
    }
  }
}

app.post('/api/ocorrencias/:id/concluir', (req, res) => {
  const oc = ocorrencias.find(o => o.id == req.params.id);
  if (oc) { concluirOcorrencia(oc); res.json(resolverOcorrencia(oc)); }
  else res.status(404).json({ message: 'Ocorrência não encontrada' });
});
app.put('/api/ocorrencias/:id/concluir', (req, res) => {
  const oc = ocorrencias.find(o => o.id == req.params.id);
  if (oc) { concluirOcorrencia(oc); res.json(resolverOcorrencia(oc)); }
  else res.status(404).json({ message: 'Ocorrência não encontrada' });
});

// cancelar: qualquer status → CANCELADA
app.post('/api/ocorrencias/:id/cancelar', (req, res) => {
  const oc = ocorrencias.find(o => o.id == req.params.id);
  if (oc) {
    const agora = [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate(), new Date().getHours(), new Date().getMinutes(), 0];
    const statusAnterior = oc.status;
    oc.status = 'CANCELADA';
    oc.dataHoraFechamento = agora;
    if (!oc.historico) oc.historico = [];
    oc.historico.push({ id: oc.historico.length + 1, statusAnterior, statusNovo: 'CANCELADA', dataHora: agora, observacao: '' });
    res.json(resolverOcorrencia(oc));
  } else {
    res.status(404).json({ message: 'Ocorrência não encontrada' });
  }
});

app.get('/api/ocorrencias/:id/detalhes', (req, res) => {
  const oc = ocorrencias.find(o => o.id == req.params.id);
  if (!oc) return res.status(404).json({ message: 'Ocorrência não encontrada' });

  let atendimento = null;
  let equipe = null;

  if (oc.ambulanciaId) {
    const amb = ambulancias.find(a => a.id === oc.ambulanciaId);
    if (amb) {
      atendimento = {
        id: oc.id,
        ambulancia: resolverAmbulancia(amb),
        dataHoraDespacho: oc.dataDespacho || null,
        dataHoraChegada: oc.dataHoraFechamento || null,
        distanciaKm: null,
        tempoEstimado: null,
        rota: null
      };
      equipe = equipes.find(e => e.ambulanciaId === amb.id) || null;
      if (equipe) equipe = resolverEquipe(equipe);
    }
  }

  const historico = oc.historico || [];

  res.json({ ocorrencia: resolverOcorrencia(oc), atendimento, equipe, historico });
});

app.get('/api/ocorrencias/:id/historico', (req, res) => {
  res.json([]);
});

app.delete('/api/ocorrencias/:id', (req, res) => {
  const idx = ocorrencias.findIndex(o => o.id == req.params.id);
  if (idx >= 0) {
    ocorrencias.splice(idx, 1);
    res.json({ message: 'Ocorrência excluída' });
  } else {
    res.status(404).json({ message: 'Ocorrência não encontrada' });
  }
});

// ──────────────────────────────────────────────────────────
// AMBULÂNCIAS
// ──────────────────────────────────────────────────────────
function resolverAmbulancia(amb) {
  return { ...amb, bairro: amb.bairro || bairros.find(b => b.id === amb.bairroId) || null };
}

app.get('/api/ambulancias', (req, res) => {
  res.json(ambulancias.map(resolverAmbulancia));
});

app.post('/api/ambulancias', (req, res) => {
  const novaAmbulancia = { id: nextId(ambulancias), ...req.body };
  ambulancias.push(novaAmbulancia);
  res.status(201).json(resolverAmbulancia(novaAmbulancia));
});

app.put('/api/ambulancias/:id', (req, res) => {
  const idx = ambulancias.findIndex(a => a.id == req.params.id);
  if (idx >= 0) {
    ambulancias[idx] = { ...ambulancias[idx], ...req.body, id: ambulancias[idx].id };
    res.json(resolverAmbulancia(ambulancias[idx]));
  } else {
    res.status(404).json({ message: 'Ambulância não encontrada' });
  }
});

app.delete('/api/ambulancias/:id', (req, res) => {
  const idx = ambulancias.findIndex(a => a.id == req.params.id);
  if (idx >= 0) {
    ambulancias.splice(idx, 1);
    res.json({ message: 'Ambulância excluída' });
  } else {
    res.status(404).json({ message: 'Ambulância não encontrada' });
  }
});

// ──────────────────────────────────────────────────────────
// BAIRROS
// ──────────────────────────────────────────────────────────
app.get('/api/bairros', (req, res) => {
  res.json(bairros);
});

// ──────────────────────────────────────────────────────────
// PROFISSIONAIS
// ──────────────────────────────────────────────────────────
app.get('/api/profissionais', (req, res) => {
  res.json(profissionais);
});

app.post('/api/profissionais', (req, res) => {
  const novoProfissional = { id: nextId(profissionais), ...req.body };
  profissionais.push(novoProfissional);
  res.status(201).json(novoProfissional);
});

app.put('/api/profissionais/:id', (req, res) => {
  const idx = profissionais.findIndex(p => p.id == req.params.id);
  if (idx >= 0) {
    profissionais[idx] = { ...profissionais[idx], ...req.body, id: profissionais[idx].id };
    res.json(profissionais[idx]);
  } else {
    res.status(404).json({ message: 'Profissional não encontrado' });
  }
});

app.delete('/api/profissionais/:id', (req, res) => {
  const idx = profissionais.findIndex(p => p.id == req.params.id);
  if (idx >= 0) {
    profissionais.splice(idx, 1);
    res.json({ message: 'Profissional excluído' });
  } else {
    res.status(404).json({ message: 'Profissional não encontrado' });
  }
});

// ──────────────────────────────────────────────────────────
// EQUIPES
// ──────────────────────────────────────────────────────────
function resolverEquipe(eq) {
  const profIds = eq.profissionaisIds || eq.profissionalIds || [];
  return {
    ...eq,
    ambulancia:    ambulancias.find(a => a.id === eq.ambulanciaId) || null,
    profissionais: profissionais.filter(p => profIds.includes(p.id))
  };
}

app.get('/api/equipes', (req, res) => {
  res.json(equipes.map(resolverEquipe));
});

app.post('/api/equipes', (req, res) => {
  const profIds = req.body.profissionalIds || req.body.profissionaisIds || [];
  const novaEquipe = { id: nextId(equipes), ...req.body, profissionaisIds: profIds };
  equipes.push(novaEquipe);
  res.status(201).json(resolverEquipe(novaEquipe));
});

app.put('/api/equipes/:id', (req, res) => {
  const idx = equipes.findIndex(e => e.id == req.params.id);
  if (idx >= 0) {
    const profIds = req.body.profissionalIds || req.body.profissionaisIds || equipes[idx].profissionaisIds || [];
    equipes[idx] = { ...equipes[idx], ...req.body, id: equipes[idx].id, profissionaisIds: profIds };
    res.json(resolverEquipe(equipes[idx]));
  } else {
    res.status(404).json({ message: 'Equipe não encontrada' });
  }
});

app.delete('/api/equipes/:id', (req, res) => {
  const idx = equipes.findIndex(e => e.id == req.params.id);
  if (idx >= 0) {
    equipes.splice(idx, 1);
    res.json({ message: 'Equipe excluída' });
  } else {
    res.status(404).json({ message: 'Equipe não encontrada' });
  }
});

// ──────────────────────────────────────────────────────────
// DASHBOARD
// ──────────────────────────────────────────────────────────
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    ocorrenciasAbertas:       ocorrencias.filter(o => o.status === 'ABERTA').length,
    atendimentosHoje:         ocorrencias.filter(o => o.status === 'CONCLUIDA').length || 5,
    ambulanciasDisponiveis:   ambulancias.filter(a => a.status === 'DISPONIVEL').length,
    ambulanciasTotal:         ambulancias.length,
    equipesAtivas:            equipes.length,
    profissionaisCadastrados: profissionais.length
  });
});

app.get('/api/dashboard/ocorrencias-recentes', (req, res) => {
  res.json(ocorrencias.slice(0, 5).map(resolverOcorrencia));
});

// ──────────────────────────────────────────────────────────
// RELATÓRIOS
// ──────────────────────────────────────────────────────────
app.get('/api/relatorios/ocorrencias', (req, res) => {
  res.json(ocorrencias.map(resolverOcorrencia));
});

app.get('/api/relatorios/por-bairro', (req, res) => {
  res.json(bairros.map(b => ({
    bairro:     b.nome,
    quantidade: ocorrencias.filter(o => o.bairroId === b.id).length
  })));
});

app.get('/api/relatorios/csv', (req, res) => {
  let csv = 'ID,Tipo,Gravidade,Status,Bairro,Data Abertura\n';
  ocorrencias.forEach(oc => {
    const bairro = bairros.find(b => b.id === oc.bairroId)?.nome || 'N/A';
    const d = oc.dataHoraAbertura;
    const data = Array.isArray(d) ? `${d[2]}/${d[1]}/${d[0]} ${d[3]}:${d[4]}` : d;
    csv += `${oc.id},${oc.tipo},${oc.gravidade},${oc.status},${bairro},${data}\n`;
  });
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});

// ──────────────────────────────────────────────────────────
// START
// ──────────────────────────────────────────────────────────
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`\n✅ Mock Server rodando em http://localhost:${PORT}`);
  console.log(`\n📋 Endpoints disponíveis:`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   POST   /api/auth/register`);
  console.log(`   GET/POST/PUT/DELETE  /api/ocorrencias`);
  console.log(`   GET/POST/PUT/DELETE  /api/ambulancias`);
  console.log(`   GET/POST/PUT/DELETE  /api/profissionais`);
  console.log(`   GET/POST/PUT/DELETE  /api/equipes`);
  console.log(`   GET    /api/bairros`);
  console.log(`   GET    /api/dashboard/stats`);
  console.log(`   GET    /api/relatorios/ocorrencias\n`);
});