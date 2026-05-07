package com.example.backend.controller;

import com.example.backend.dto.CreatePaymentIntentRequest;
import com.example.backend.dto.CreatePaymentIntentResponse;
import com.example.backend.service.StripePaymentService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final StripePaymentService stripePaymentService;

    @PostMapping("/create-intent")
    public ResponseEntity<?> createIntent(@RequestBody CreatePaymentIntentRequest request) {
        try {
            CreatePaymentIntentResponse response = stripePaymentService.createPaymentIntent(
                    request.getAmount(),
                    request.getCurrency()
            );
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body("Erreur Stripe : " + e.getMessage());
        }
    }
}
