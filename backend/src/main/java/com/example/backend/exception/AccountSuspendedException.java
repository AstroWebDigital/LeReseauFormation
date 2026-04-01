package com.example.backend.exception;

public class AccountSuspendedException extends RuntimeException {
    private final String blockReason;

    public AccountSuspendedException(String blockReason) {
        super("Compte suspendu");
        this.blockReason = blockReason;
    }

    public String getBlockReason() {
        return blockReason;
    }
}
