package io.github.cyflamant.gestioncoworking.service;

public class SpaceNotFoundException extends RuntimeException {

    public SpaceNotFoundException(Integer id) {
        super("Espace introuvable : " + id);
    }
}
