package io.github.cyflamant.gestioncoworking.service;

public class SpaceHasBookingsException extends RuntimeException {

    public SpaceHasBookingsException(Integer id) {
        super("Impossible de supprimer l'espace " + id + " : il a des réservations");
    }
}
