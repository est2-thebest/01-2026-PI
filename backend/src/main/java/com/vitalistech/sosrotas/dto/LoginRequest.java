package com.vitalistech.sosrotas.dto;

public record LoginRequest(
        String email,
        String password
) {}