package com.example.backend.service;

import com.example.backend.dto.CreatePaymentIntentResponse;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class StripePaymentService {

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    public CreatePaymentIntentResponse createPaymentIntent(BigDecimal amountEuros, String currency) throws StripeException {
        Stripe.apiKey = stripeSecretKey;

        long amountCents = amountEuros.multiply(BigDecimal.valueOf(100)).longValue();
        String cur = (currency != null && !currency.isBlank()) ? currency.toLowerCase() : "eur";

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency(cur)
                .addPaymentMethodType("card")
                .build();

        PaymentIntent intent = PaymentIntent.create(params);
        return new CreatePaymentIntentResponse(intent.getClientSecret(), intent.getId(), amountCents);
    }

    public boolean isPaymentSucceeded(String paymentIntentId) throws StripeException {
        Stripe.apiKey = stripeSecretKey;
        PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
        return "succeeded".equals(intent.getStatus());
    }
}
