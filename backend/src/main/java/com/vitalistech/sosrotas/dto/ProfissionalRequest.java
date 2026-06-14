package com.vitalistech.sosrotas.dto;

import com.vitalistech.sosrotas.model.enums.FuncaoProfissional;
import com.vitalistech.sosrotas.model.enums.Turno;

public record ProfissionalRequest(
        String nome,
        String contato,
        Boolean ativo,
        FuncaoProfissional funcao,
        Turno turno,
        String cpf,
        String cnpj
) {}
