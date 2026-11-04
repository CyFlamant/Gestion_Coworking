package io.github.cyflamant.gestioncoworking.security;

import java.util.UUID;

public interface CurrentUserProvider {
    UUID getCurrentUserId();
}
