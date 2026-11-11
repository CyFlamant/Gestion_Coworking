package io.github.cyflamant.gestioncoworking.dto;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

public record MeResponse(String id, String role) {

    public static MeResponse from(Authentication authentication) {
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith("ROLE_"))
                .map(authority -> authority.substring("ROLE_".length()))
                .findFirst()
                .orElseThrow();
        return new MeResponse(authentication.getName(), role);
    }

}
