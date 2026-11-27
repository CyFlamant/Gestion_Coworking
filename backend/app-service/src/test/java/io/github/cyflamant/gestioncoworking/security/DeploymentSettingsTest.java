package io.github.cyflamant.gestioncoworking.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.github.cyflamant.gestioncoworking.controller.MeController;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

// A deployment changes the allowed origins and the role without rebuilding
// (in production: APP_CORS_ALLOWEDORIGINS and APP_PLACEHOLDERUSERROLE in the environment)
@WebMvcTest(controllers = MeController.class, properties = {
        "app.cors.allowed-origins=" + DeploymentSettingsTest.DEPLOYED_ORIGIN,
        "app.placeholder-user-role=CLIENT" })
@Import(SecurityConfig.class)
class DeploymentSettingsTest {

    static final String DEPLOYED_ORIGIN = "https://coworking.exemple.be";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void preflightFromDeployedOriginSucceeds() throws Exception {
        mockMvc.perform(options("/api/spaces")
                .header(HttpHeaders.ORIGIN, DEPLOYED_ORIGIN)
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, DEPLOYED_ORIGIN));
    }

    @Test
    void preflightFromDevelopmentOriginIsRejectedOnceOriginsAreChanged() throws Exception {
        mockMvc.perform(options("/api/spaces")
                .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isForbidden());
    }

    @Test
    void currentUserHasTheConfiguredRole() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("CLIENT"));
    }

}
