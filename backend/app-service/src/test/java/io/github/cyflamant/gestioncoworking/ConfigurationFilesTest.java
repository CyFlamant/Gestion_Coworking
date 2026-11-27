package io.github.cyflamant.gestioncoworking;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.util.Properties;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.support.PropertiesLoaderUtils;

// What each environment gets: application.properties for every one, application-dev.properties for development only
class ConfigurationFilesTest {

    @Test
    void sharedSettingsHaveNoDatabaseConnection() throws IOException {
        assertThat(load("application.properties"))
                .doesNotContainKeys("spring.datasource.url", "spring.datasource.username", "spring.datasource.password");
    }

    @Test
    void sharedSettingsDoNotLogSqlAndRunAsGuest() throws IOException {
        Properties shared = load("application.properties");
        assertThat(shared).doesNotContainKey("spring.jpa.show-sql");
        assertThat(shared).containsEntry("app.placeholder-user-role", "");
    }

    @Test
    void developmentIsTheDefaultProfile() throws IOException {
        assertThat(load("application.properties")).containsEntry("spring.profiles.default", "dev");
    }

    @Test
    void developmentProfileUsesLocalDatabaseLogsSqlAndRunsAsAdmin() throws IOException {
        assertThat(load("application-dev.properties"))
                .containsEntry("spring.datasource.url", "jdbc:mysql://localhost:3306/gestion_coworking")
                .containsEntry("spring.datasource.username", "root")
                .containsEntry("spring.jpa.show-sql", "true")
                .containsEntry("app.placeholder-user-role", "ADMIN");
    }

    private static Properties load(String file) throws IOException {
        return PropertiesLoaderUtils.loadProperties(new ClassPathResource(file));
    }

}
