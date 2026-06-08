package com.vitalistech.sosrotas.dto;

import com.vitalistech.sosrotas.model.enums.*;

public record RegisterRequest(
        String nome,
        String email,
        String password,
        Role role
) {}
