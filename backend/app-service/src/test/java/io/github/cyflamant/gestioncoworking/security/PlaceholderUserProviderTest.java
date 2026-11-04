package io.github.cyflamant.gestioncoworking.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;
import org.junit.jupiter.api.Test;

class PlaceholderUserProviderTest {

    @Test
    void returnsConfiguredUserId() {
        // Arrange: prepare the input
        UUID expected = UUID.fromString("00000000-0000-0000-0000-000000000001");
        PlaceholderUserProvider provider = new PlaceholderUserProvider(expected);

        // Act: call the method under test
        UUID actual = provider.getCurrentUserId();

        // Assert: check the result
        assertThat(actual).isEqualTo(expected);
    }
}
