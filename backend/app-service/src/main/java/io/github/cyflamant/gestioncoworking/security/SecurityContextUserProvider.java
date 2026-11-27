package io.github.cyflamant.gestioncoworking.security;

import java.util.UUID;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

// The signed-in user, as set in the security context by PlaceholderAuthenticationFilter (later by the JWT filter)
@Component
public class SecurityContextUserProvider implements CurrentUserProvider {

    @Override
    public UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // Protected endpoints answer 401 before getting here; reaching it means a URL rule is missing
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            throw new IllegalStateException("No signed-in user");
        }
        return UUID.fromString(authentication.getName());
    }

}
