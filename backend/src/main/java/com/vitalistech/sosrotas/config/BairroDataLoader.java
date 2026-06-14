package com.vitalistech.sosrotas.config;

import com.vitalistech.sosrotas.model.Bairro;
import com.vitalistech.sosrotas.repository.IBairroRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;

@Component
@Order(1)
public class BairroDataLoader
        implements CommandLineRunner {

    private final IBairroRepository repository;

    public BairroDataLoader(
            IBairroRepository repository) {

        this.repository = repository;
    }

    @Override
    public void run(String... args)
            throws Exception {

        if (repository.count() > 0) {
            return;
        }

        BufferedReader reader =
                new BufferedReader(
                        new InputStreamReader(
                                new ClassPathResource(
                                        "bairros.csv"
                                ).getInputStream()
                        )
                );

        String linha;

        reader.readLine();

        while ((linha = reader.readLine()) != null) {

            String[] dados =
                    linha.split(",");

            Integer id =
                    Integer.parseInt(
                            dados[0]
                    );

            String nome =
                    dados[1];

            Bairro bairro =
                    new Bairro();

            bairro.setId(id);
            bairro.setNome(nome);

            repository.save(bairro);
        }

        reader.close();

        System.out.println(
                "Bairros carregados com sucesso."
        );
    }
}