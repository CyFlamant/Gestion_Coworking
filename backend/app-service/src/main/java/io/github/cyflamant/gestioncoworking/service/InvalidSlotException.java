package io.github.cyflamant.gestioncoworking.service;

public class InvalidSlotException extends RuntimeException {

    public InvalidSlotException() {
        super("La fin doit être après le début");
    }
}
