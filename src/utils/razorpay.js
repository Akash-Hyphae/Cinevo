/**
 * Utility helper to load and launch Razorpay Checkout modal
 */

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay checkout script from CDN');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay Payment Modal
 * @param {Object} params
 * @param {Object} params.orderData - returned from /api/payments/create-order
 * @param {Object} params.booking - booking details
 * @param {Object} params.user - logged in user
 * @param {Function} params.onSuccess - callback when user completes payment in Razorpay modal
 * @param {Function} params.onError - callback on payment error or dismissal
 */
export async function openRazorpayCheckout({ orderData, booking, user, onSuccess, onError, onDismiss }) {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded || !window.Razorpay) {
    throw new Error('Razorpay Checkout SDK is not available. Please check your internet connection or ad-blocker.');
  }

  const options = {
    key: orderData.keyId,
    amount: orderData.amount, // amount in paise
    currency: orderData.currency || 'INR',
    name: 'Cinevo Cinema',
    description: `${booking.movie?.title || 'Movie'} Tickets (${booking.seats?.length || 1} seats)`,
    image: booking.movie?.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80',
    order_id: orderData.orderId,
    handler: function (response) {
      // response: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
      if (onSuccess) {
        onSuccess(response);
      }
    },
    prefill: {
      name: user?.name || 'Cinevo Guest',
      email: user?.email || 'guest@cinevo.com',
      contact: user?.phone || '9876543210',
    },
    notes: {
      bookingId: booking._id,
      bookingReference: booking.bookingReference,
      showId: booking.showId,
    },
    theme: {
      color: '#8b5cf6', // Electric violet brand color
      backdrop_color: '#090b10',
    },
    modal: {
      ondismiss: function () {
        if (onDismiss) onDismiss();
      },
      escape: true,
      animation: true,
    },
  };

  const rzp = new window.Razorpay(options);

  rzp.on('payment.failed', function (response) {
    console.error('Razorpay Payment Failed:', response.error);
    if (onError) {
      onError(response.error);
    }
  });

  rzp.open();
  return rzp;
}
