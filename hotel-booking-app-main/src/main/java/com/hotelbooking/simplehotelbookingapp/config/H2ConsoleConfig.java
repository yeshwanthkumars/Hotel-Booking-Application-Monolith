package com.hotelbooking.simplehotelbookingapp.config;

import org.h2.server.web.JakartaWebServlet;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Manually registers the H2 web console servlet.
 * Spring Boot 4.x auto-configuration does not always register it automatically,
 * so we register JakartaWebServlet explicitly for dev/local use.
 */
@Configuration
@Profile("!prod")
public class H2ConsoleConfig {

    @Bean
    public ServletRegistrationBean<JakartaWebServlet> h2ConsoleServlet() {
        JakartaWebServlet servlet = new JakartaWebServlet();
        ServletRegistrationBean<JakartaWebServlet> registration =
                new ServletRegistrationBean<>(servlet, "/h2-console/*");
        registration.addInitParameter("webAllowOthers", "false");
        registration.addInitParameter("trace", "false");
        registration.setLoadOnStartup(1);
        registration.setName("H2Console");
        return registration;
    }
}

