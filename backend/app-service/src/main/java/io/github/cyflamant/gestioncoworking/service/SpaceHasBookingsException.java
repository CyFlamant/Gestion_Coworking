package io.github.cyflamant.gestioncoworking.service;

public class SpaceHasBookingsException extends RuntimeException {

    public SpaceHasBookingsException(String spaceName) {
        super("Impossible de supprimer l'espace « " + spaceName + " » : il a des réservations");
    }
}
