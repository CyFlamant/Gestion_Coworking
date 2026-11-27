package io.github.cyflamant.gestioncoworking.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

import io.github.cyflamant.gestioncoworking.entity.Space;
import io.github.cyflamant.gestioncoworking.entity.Space.SpaceType;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.test.context.jdbc.Sql;

// dev-data/demo-spaces.sql, run in the test transaction, so it is rolled back like the other repository tests
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // use MariaDB, no embedded DB
class DemoSpacesScriptTest {

    private static final String SCRIPT = "file:dev-data/demo-spaces.sql"; // from backend/app-service

    // The demo spaces of the front end's mock (frontend/app/src/lib/mock/db.js)
    private static final Set<String> DEMO_NAMES = Set.of("Openspace 1", "Openspace 2", "Openspace 3",
            "Bureau 1", "Bureau 2", "Salle Atelier", "Salle Studio");

    @Autowired
    private SpaceRepository spaceRepository;

    @Test
    @Sql(SCRIPT)
    void scriptAddsTheSevenDemoSpacesOfTheMock() {
        assertThat(demoSpaces())
                .extracting(Space::getName, Space::getType, Space::getHourRate, Space::getHalfDayRate,
                        Space::getDayRate, Space::getMonthRate)
                .containsExactlyInAnyOrder(
                        tuple("Openspace 1", SpaceType.OPENSPACE, rate("4"), rate("14"), rate("25"), rate("250")),
                        tuple("Openspace 2", SpaceType.OPENSPACE, rate("4"), rate("14"), rate("25"), rate("250")),
                        tuple("Openspace 3", SpaceType.OPENSPACE, rate("4"), rate("14"), rate("25"), rate("250")),
                        tuple("Bureau 1", SpaceType.OFFICE, rate("9"), rate("30"), rate("50"), rate("700")),
                        tuple("Bureau 2", SpaceType.OFFICE, rate("9"), rate("30"), rate("50"), rate("700")),
                        tuple("Salle Atelier", SpaceType.ROOM, rate("25"), rate("80"), rate("140"), rate("2000")),
                        tuple("Salle Studio", SpaceType.ROOM, rate("35"), rate("110"), rate("190"), rate("2800")));
    }

    @Test
    @Sql({ SCRIPT, SCRIPT })
    void scriptRunTwiceAddsEachSpaceOnce() {
        assertThat(demoSpaces()).hasSize(7);
    }

    // The database may hold other spaces: only the demo ones are looked at
    private List<Space> demoSpaces() {
        return spaceRepository.findAll().stream()
                .filter(space -> DEMO_NAMES.contains(space.getName()))
                .toList();
    }

    // As read from the DECIMAL columns: two decimals
    private static BigDecimal rate(String value) {
        return new BigDecimal(value).setScale(2);
    }

}
