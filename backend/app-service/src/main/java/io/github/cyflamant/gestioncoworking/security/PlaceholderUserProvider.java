package io.github.cyflamant.gestioncoworking.security;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PlaceholderUserProvider implements CurrentUserProvider {
    private final UUID userId;

    public PlaceholderUserProvider(@Value("${app.placeholder-user-id}") UUID userId) {
        this.userId = userId;
    }

    @Override
    public UUID getCurrentUserId() {
        return userId;
    }

}
