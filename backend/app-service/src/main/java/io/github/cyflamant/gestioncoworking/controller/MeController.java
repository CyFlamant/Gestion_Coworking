package io.github.cyflamant.gestioncoworking.controller;

import io.github.cyflamant.gestioncoworking.dto.MeResponse;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class MeController {

    @GetMapping
    public MeResponse me(Authentication authentication) {
        return MeResponse.from(authentication);
    }

}
