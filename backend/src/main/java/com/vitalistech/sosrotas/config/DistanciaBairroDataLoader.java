package com.vitalistech.sosrotas.config;

import com.vitalistech.sosrotas.model.Bairro;
import com.vitalistech.sosrotas.model.DistanciaBairro;
import com.vitalistech.sosrotas.repository.IBairroRepository;
import com.vitalistech.sosrotas.repository.IDistanciaBairroRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@Order(2) // roda depois do BairroDataLoader (order 1 implícito)
public class DistanciaBairroDataLoader implements CommandLineRunner {

    private static final double[][] ARESTAS = {
        {9,16,6.4},{15,19,8.3},{17,7,1.2},{3,5,12.2},{12,4,14.0},
        {13,7,9.2},{13,6,19.2},{5,9,13.2},{16,3,3.4},{8,10,12.8},
        {20,1,14.4},{14,3,18.1},{2,18,1.9},{6,11,15.7},{1,17,14.5},
        {3,4,19.2},{14,19,18.9},{15,18,18.5},{20,2,14.7},{15,20,12.7},
        {17,15,7.9},{4,12,6.4},{5,15,8.6},{6,2,13.4},{14,15,9.4},
        {9,3,18.7},{18,7,1.7},{13,7,17.5},{18,9,9.0},{15,11,18.3},
        {3,4,3.0},{7,2,13.9},{20,4,7.7},{5,16,14.3},{13,4,12.8},
        {1,16,13.4},{14,3,14.3},{2,6,16.7},{11,8,16.6},{11,10,4.6},
        {4,1,7.0},{11,7,14.4},{13,5,6.2},{9,20,2.7},{13,15,8.3},
        {17,13,16.3},{10,14,7.9},{8,1,17.9},{9,2,19.3},{16,17,18.4},
        {6,14,9.0},{2,19,5.1},{6,5,1.3},{2,1,1.4},{20,19,3.7},
        {20,2,6.5},{4,8,13.1},{4,19,3.8},{16,11,2.8},{13,16,7.8}
    };

    private final IDistanciaBairroRepository distanciaRepository;
    private final IBairroRepository bairroRepository;

    public DistanciaBairroDataLoader(IDistanciaBairroRepository distanciaRepository,
                                     IBairroRepository bairroRepository) {
        this.distanciaRepository = distanciaRepository;
        this.bairroRepository = bairroRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (distanciaRepository.count() > 0) return;

        // Monta grafo bidirecional
        Map<Integer, List<double[]>> adj = new HashMap<>();
        for (double[] e : ARESTAS) {
            int a = (int) e[0], b = (int) e[1];
            double d = e[2];
            adj.computeIfAbsent(a, k -> new ArrayList<>()).add(new double[]{b, d});
            adj.computeIfAbsent(b, k -> new ArrayList<>()).add(new double[]{a, d});
        }

        // Dijkstra para cada origem (1-20) e armazena distâncias mínimas
        List<DistanciaBairro> registros = new ArrayList<>();
        for (int origem = 1; origem <= 20; origem++) {
            double[] dist = dijkstra(adj, origem);
            Bairro bairroOrigem = bairroRepository.findById(origem).orElse(null);
            if (bairroOrigem == null) continue;

            for (int destino = 1; destino <= 20; destino++) {
                if (destino == origem) continue;
                double km = dist[destino];
                if (km == Double.MAX_VALUE) continue;

                Bairro bairroDestino = bairroRepository.findById(destino).orElse(null);
                if (bairroDestino == null) continue;

                // 30 km/h → 1 km = 2 min; mínimo 1 minuto
                int minutos = Math.max(1, (int) Math.round(km * 2.0));

                DistanciaBairro db = new DistanciaBairro();
                db.setBairroOrigem(bairroOrigem);
                db.setBairroDestino(bairroDestino);
                db.setTempoEstimadoMinutos(minutos);
                registros.add(db);
            }
        }

        distanciaRepository.saveAll(registros);
        System.out.println("Distancias entre bairros calculadas e carregadas: " + registros.size() + " pares.");
    }

    private double[] dijkstra(Map<Integer, List<double[]>> adj, int origem) {
        double[] dist = new double[21];
        Arrays.fill(dist, Double.MAX_VALUE);
        dist[origem] = 0;

        PriorityQueue<double[]> pq = new PriorityQueue<>(Comparator.comparingDouble(x -> x[0]));
        pq.offer(new double[]{0, origem});

        while (!pq.isEmpty()) {
            double[] curr = pq.poll();
            double d = curr[0];
            int u = (int) curr[1];
            if (d > dist[u]) continue;
            for (double[] viz : adj.getOrDefault(u, List.of())) {
                int v = (int) viz[0];
                double nd = d + viz[1];
                if (nd < dist[v]) {
                    dist[v] = nd;
                    pq.offer(new double[]{nd, v});
                }
            }
        }
        return dist;
    }
}