package com.vitalistech.sosrotas.service;

import com.vitalistech.sosrotas.model.Ambulancia;
import com.vitalistech.sosrotas.model.enums.StatusAmbulancia;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DespachoService {

    public List<Ambulancia> filtrarAmbulanciasDisponiveis(List<Ambulancia> frota) {
        /* [PADRÃO DE PROJETO: ITERATOR]
         * Evidenciado pelo uso da API de Streams (.stream().filter()).
         * Justificativa: Permite percorrer a coleção de ambulâncias de maneira sequencial e transparente para aplicar as regras de triagem e SLAs operacionais.
         */
        return frota.stream()
                .filter(amb -> StatusAmbulancia.DISPONIVEL.equals(amb.getStatus()))
                .collect(Collectors.toList());
    }
}
