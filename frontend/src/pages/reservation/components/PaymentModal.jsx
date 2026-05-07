import { useState } from "react";
import { Modal, ModalContent, Button } from "@heroui/react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { LockClosedIcon, CreditCardIcon, XMarkIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CardForm({ clientSecret, amountEuros, vehicleName, onPaymentSuccess, onClose, isDark }) {
    const stripe = useStripe();
    const elements = useElements();
    const isLight = !isDark;

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState(null);
    const [isPaying, setIsPaying] = useState(false);
    const [cardError, setCardError] = useState(null);

    const handlePay = async () => {
        if (!stripe || !elements) return;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError("Adresse e-mail invalide");
            return;
        }
        setEmailError(null);
        setIsPaying(true);
        setCardError(null);

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: { email },
            },
            receipt_email: email,
        });

        if (error) {
            setCardError(error.message);
            setIsPaying(false);
        } else if (paymentIntent?.status === "succeeded") {
            onPaymentSuccess(paymentIntent.id);
        } else {
            setCardError("Statut inattendu, veuillez réessayer.");
            setIsPaying(false);
        }
    };

    return (
        <div className="flex flex-col gap-5 p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Paiement sécurisé
                    </p>
                    <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                        {vehicleName}
                    </h2>
                    <p className="text-2xl font-extrabold text-orange-500 mt-0.5">
                        {amountEuros.toFixed(2)} €
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                        ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/10 hover:bg-black/20"}`}
                >
                    <XMarkIcon className={`h-4 w-4 ${isDark ? "text-white/70" : "text-slate-600"}`} />
                </button>
            </div>

            {/* Email */}
            <div>
                <label className={`text-[11px] font-semibold uppercase tracking-wider mb-2 block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Adresse e-mail
                </label>
                <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 transition-all
                    ${emailError
                        ? "border-red-500 bg-red-500/5"
                        : isDark
                            ? "border-white/10 bg-white/5 focus-within:border-orange-400"
                            : "border-slate-200 bg-white shadow-sm focus-within:border-orange-400"
                    }`}
                >
                    <EnvelopeIcon className={`h-4 w-4 shrink-0 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                        placeholder="votre@email.com"
                        className={`flex-1 bg-transparent text-sm focus:outline-none ${isDark ? "text-white placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"}`}
                    />
                </div>
                {emailError && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <span>⚠</span> {emailError}
                    </p>
                )}
            </div>

            {/* Carte Stripe */}
            <div>
                <label className={`text-[11px] font-semibold uppercase tracking-wider mb-2 block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Informations de carte
                </label>
                <div className={`rounded-2xl border px-4 py-4 transition-all
                    ${cardError
                        ? "border-red-500 bg-red-500/5"
                        : isDark
                            ? "border-white/10 bg-white/5"
                            : "border-slate-200 bg-white shadow-sm"
                    }`}
                >
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: "15px",
                                    color: isDark ? "#f1f5f9" : "#1e293b",
                                    fontFamily: "Inter, system-ui, sans-serif",
                                    "::placeholder": { color: isDark ? "#64748b" : "#94a3b8" },
                                    iconColor: "#f97316",
                                },
                                invalid: { color: "#ef4444" },
                            },
                            hidePostalCode: true,
                        }}
                    />
                </div>
                {cardError && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <span>⚠</span> {cardError}
                    </p>
                )}
            </div>

            {/* Carte de test */}
            <div className={`rounded-xl px-3 py-2 text-xs ${isDark ? "bg-white/5 text-slate-400" : "bg-slate-50 text-slate-500"}`}>
                Carte test : <span className="font-mono font-semibold">4242 4242 4242 4242</span> · exp : 12/34 · CVC : 123
            </div>

            {/* Badge Stripe */}
            <div className={`flex items-center justify-center gap-2 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                <LockClosedIcon className="h-3 w-3" />
                Paiement sécurisé par <span className="font-bold">Stripe</span>
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
                <Button
                    variant="flat"
                    onPress={onClose}
                    className={`flex-1 rounded-xl font-semibold ${isDark ? "bg-white/8 text-white/70 hover:bg-white/12" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                    Annuler
                </Button>
                <Button
                    onPress={handlePay}
                    isLoading={isPaying}
                    isDisabled={!stripe || isPaying}
                    startContent={!isPaying && <CreditCardIcon className="h-4 w-4" />}
                    className="flex-1 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 disabled:opacity-40"
                >
                    {isPaying ? "Traitement…" : `Payer ${amountEuros.toFixed(2)} €`}
                </Button>
            </div>
        </div>
    );
}

export function PaymentModal({ isOpen, onOpenChange, clientSecret, amountEuros, vehicleName, onPaymentSuccess, isDark }) {
    const isLight = !isDark;

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="md"
            hideCloseButton
            classNames={{
                base: `${isLight ? "bg-white" : "bg-[#080f28]"} shadow-2xl`,
                wrapper: "items-center",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <div className="rounded-2xl overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-400" />

                        {clientSecret ? (
                            <Elements stripe={stripePromise}>
                                <CardForm
                                    clientSecret={clientSecret}
                                    amountEuros={amountEuros}
                                    vehicleName={vehicleName}
                                    onPaymentSuccess={onPaymentSuccess}
                                    onClose={onClose}
                                    isDark={isDark}
                                />
                            </Elements>
                        ) : (
                            <div className="p-8 text-center">
                                <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-3" />
                                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Préparation du paiement…</p>
                            </div>
                        )}
                    </div>
                )}
            </ModalContent>
        </Modal>
    );
}
