package com.vitalistech.sosrotas.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class BrowserLauncher implements ApplicationListener<ApplicationReadyEvent> {

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        String url = "http://localhost:8080/swagger";
        String os = System.getProperty("os.name").toLowerCase();

        try {
            if (os.contains("linux")) {
                Runtime.getRuntime().exec(new String[]{"xdg-open", url});
            } else if (os.contains("mac")) {
                Runtime.getRuntime().exec(new String[]{"open", url});
            } else if (os.contains("win")) {
                Runtime.getRuntime().exec(new String[]{"cmd", "/c", "start", url});
            }
        } catch (Exception e) {
            System.out.println("Não foi possível abrir o browser: " + e.getMessage());
        }
    }
}