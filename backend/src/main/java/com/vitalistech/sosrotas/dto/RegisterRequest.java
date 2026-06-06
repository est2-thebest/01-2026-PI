package com.vitalistech.sosrotas.dto;

import com.vitalistech.sosrotas.model.Enums.*;

public record RegisterRequest(
        String nome,
        String email,
        String password,
        Role role
) {}
