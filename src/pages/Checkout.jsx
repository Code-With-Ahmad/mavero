import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaBagShopping } from "react-icons/fa6";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import useAddresses from "../hooks/useAddresses";
import CheckoutSteps from "../components/checkout/CheckoutSteps";
import ShippingStep from "../components/checkout/ShippingStep";
import PaymentStep from "../components/checkout/PaymentStep";
import ReviewStep from "../components/checkout/ReviewStep";
import EmptyState from "../components/common/EmptyState";
import { placeOrder } from "../utils/placeOrder";

export default function Checkout() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const {
    items,
    subtotal,
    discount,
    total,
    appliedCoupon,
    clearCart,
  } = useCart();
  const { addresses: savedAddresses } = useAddresses(user?.uid);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState(null);
  const [payment, setPayment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container-boutique py-14">
        <EmptyState
          icon={<FaBagShopping />}
          title={t("cart.empty")}
          description={t("checkout.emptyCartBody")}
          action={
            <Link to="/shop" className="btn-primary">
              {t("cart.shopNow")}
            </Link>
          }
        />
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const order = await placeOrder({
        user,
        items,
        shipping,
        paymentMethod: payment.method,
        paymentSummary: payment.summary,
        subtotal,
        discount,
        total,
        appliedCoupon,
      });
      await clearCart();
      navigate(`/order-confirmation/${order.id}`, { state: { order } });
    } catch (error) {
      console.error(error);
      toast.error(t("checkout.orderFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-boutique max-w-3xl py-10 sm:py-14">
      <div className="mb-10 text-center">
        <p className="label-uppercase">{t("common.brand")}</p>
        <h1 className="mt-2 text-4xl font-semibold">{t("checkout.title")}</h1>
      </div>

      <CheckoutSteps currentStep={step} />

      {step === 1 && (
        <ShippingStep
          defaultValues={{ fullName: profile?.name || "", phone: profile?.phone || "" }}
          savedAddresses={savedAddresses}
          onNext={(data) => {
            setShipping(data);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <PaymentStep
          onNext={(data) => {
            setPayment(data);
            setStep(3);
          }}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && shipping && payment && (
        <ReviewStep
          shipping={shipping}
          payment={payment}
          items={items}
          subtotal={subtotal}
          discount={discount}
          total={total}
          couponCode={appliedCoupon?.code}
          onBack={() => setStep(2)}
          onPlaceOrder={handlePlaceOrder}
          submitting={submitting}
        />
      )}
    </div>
  );
}
