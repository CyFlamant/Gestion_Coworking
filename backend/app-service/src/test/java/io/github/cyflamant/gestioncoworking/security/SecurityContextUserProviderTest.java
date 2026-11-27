package io.github.cyflamant.gestioncoworking.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

class SecurityContextUserProviderTest {

    private final SecurityContextUserProvider provider = new SecurityContextUserProvider();

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void returnsIdOfSignedInUser() {
        // Arrange: a user is signed in, as PlaceholderAuthenticationFilter (later the JWT filter) does
        UUID expected = UUID.fromString("00000000-0000-0000-0000-000000000001");
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(expected.toString(), null, List.of()));

        // Act + Assert
        assertThat(provider.getCurrentUserId()).isEqualTo(expected);
    }

    @Test
    void throwsWhenNoUserIsSignedIn() {
        assertThatThrownBy(provider::getCurrentUserId)
                .isInstanceOf(IllegalStateException.class);
    }

}
