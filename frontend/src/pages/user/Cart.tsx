import React, { useState } from 'react';
import {
  TrashIcon,
  ShoppingCartIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  CreditCardIcon,
  CheckCircleIcon,
  LockClosedIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useCart } from '../../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import QuantitySelector from '../../components/ui/QuantitySelector';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { orderAPI, paymentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/* ─── Razorpay type stub (loaded via CDN script) ─────────────────────── */
declare global {
  interface Window {
    Razorpay: any;
  }
}

/** Load the Razorpay checkout.js script once */
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, itemCount, total } = useCart();
  const { user } = useAuth();
  const [loading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online' | null>(null);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [paidOrderId, setPaidOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) removeFromCart(productId);
    else updateQuantity(productId, newQuantity);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) clearCart();
  };

  /* ── COD Flow ─────────────────────────────────────────────────────── */
  const processCOD = async () => {
    setOrderStatus('processing');
    try {
      const orderData = {
        items: items.map(i => ({
          product: typeof i.product === 'string' ? i.product : (i.product as any)?._id,
          quantity: i.quantity,
          price: i.price,
          name: i.name,
          brand: i.brand,
        })),
        totalAmount: total * 1.1,
        paymentMethod: 'cash',
        shippingAddress: {
          street: 'Default Address',
          city: 'Salem',
          state: 'Tamil Nadu',
          zipCode: '636006',
          country: 'India',
        },
      };

      await orderAPI.createOrder(orderData);
      setOrderStatus('success');
      setTimeout(() => { clearCart(); navigate('/orders'); }, 3500);
    } catch (error) {
      console.error('COD order error:', error);
      setOrderStatus('idle');
      alert('Failed to place order. Please try again.');
    }
  };

  /* ── Razorpay Online Flow ─────────────────────────────────────────── */
  const processOnlinePayment = async () => {
    setOrderStatus('processing');

    // 1. Load Razorpay SDK
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert('Failed to load payment gateway. Please check your internet connection and try again.');
      setOrderStatus('idle');
      return;
    }

    // 2. Create Razorpay order on backend
    let razorpayData: any;
    try {
      const cartItems = items.map(i => ({
        product: typeof i.product === 'string' ? i.product : (i.product as any)?._id,
        quantity: i.quantity,
      }));
      const res = await paymentAPI.createRazorpayOrder(cartItems);
      razorpayData = (res.data as any).data;
    } catch (err: any) {
      console.error('Create Razorpay order error:', err);
      setOrderStatus('idle');
      alert(err?.response?.data?.message || 'Could not initiate payment. Please try again.');
      return;
    }

    // 3. Open Razorpay checkout popup
    const options = {
      key: razorpayData.keyId,
      amount: razorpayData.amount,
      currency: razorpayData.currency,
      name: 'Krishna Trades',
      description: `Order of ${itemCount} item${itemCount === 1 ? '' : 's'}`,
      image: '/hero-banner.png',
      order_id: razorpayData.razorpayOrderId,
      prefill: {
        name: user?.name || user?.shopName || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },
      theme: {
        color: '#2b4bf2',
        hide_topbar: false,
      },
      modal: {
        ondismiss: () => {
          setOrderStatus('idle');
        },
      },
      handler: async (response: any) => {
        // 4. Verify payment on backend and place order
        try {
          const cartItems = items.map(i => ({
            product: typeof i.product === 'string' ? i.product : (i.product as any)?._id,
            quantity: i.quantity,
            price: i.price,
          }));

          const verifyRes = await paymentAPI.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            items: cartItems,
            shippingAddress: {
              street: 'Default Address',
              city: 'Salem',
              state: 'Tamil Nadu',
              zipCode: '636006',
              country: 'India',
            },
          });

          const placedOrder = (verifyRes.data as any).data?.order;
          setPaidOrderId(placedOrder?.orderNumber || null);
          setOrderStatus('success');
          setTimeout(() => { clearCart(); navigate('/orders'); }, 3500);

        } catch (err: any) {
          console.error('Payment verify error:', err);
          setOrderStatus('idle');
          alert(err?.response?.data?.message || 'Payment was received but order confirmation failed. Please contact support with your payment ID: ' + response.razorpay_payment_id);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      setOrderStatus('idle');
      alert(`Payment failed: ${response.error.description}`);
    });
    // If modal dismissed, idle state is set by ondismiss above
    setOrderStatus('idle'); // Reset while popup is open (it handles its own UI)
    rzp.open();
  };

  /* ── Master payment dispatcher ────────────────────────────────────── */
  const processPayment = () => {
    if (paymentMethod === 'cod') return processCOD();
    if (paymentMethod === 'online') return processOnlinePayment();
  };

  /* ── Render guards ────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (orderStatus === 'success') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100 ring-8 ring-emerald-50">
          <CheckCircleIcon className="w-16 h-16 text-emerald-600" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight text-center font-display">
          Order Successful!
        </h1>
        {paidOrderId && (
          <p className="text-xs font-mono bg-gray-100 text-gray-600 px-3 py-1 rounded-full mb-3">
            Order #{paidOrderId}
          </p>
        )}
        <p className="text-lg text-gray-500 mb-8 max-w-sm text-center">
          {paymentMethod === 'cod'
            ? `Amount to collect on delivery: ₹${(total * 1.1).toFixed(2)}`
            : '✅ Payment received & confirmed by Razorpay.'}
        </p>
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-200">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
          Redirecting to your orders…
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-8 border-white shadow-xl">
          <ShoppingCartIcon className="h-12 w-12 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Looks like you haven't added any products yet. Discover our wholesale catalog!
        </p>
        <Link to="/products">
          <Button size="lg" className="px-8 rounded-xl shadow-lg shadow-primary-500/30 font-bold">
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  /* ── Main cart view ────────────────────────────────────────────────── */
  return (
    <div className="pb-16">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 font-display tracking-tight">
            Shopping Cart
          </h1>
          <p className="mt-1 text-gray-500 font-medium">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} ready for checkout
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── Cart Items ──────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-1 mb-2">
            <h2 className="text-base font-bold text-gray-700">Your Items</h2>
            <button
              onClick={handleClearCart}
              className="text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <TrashIcon className="w-4 h-4" /> Clear All
            </button>
          </div>

          {items.map((item, index) => {
            const inStock = item.stock && item.stock >= item.quantity;
            return (
              <div
                key={item.product as string}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Thumb */}
                  <div className="w-full sm:w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <span className="text-3xl font-black text-gray-300 font-display">
                      {item.brand?.charAt(0) || 'K'}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">{item.brand}</p>
                        <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
                        <span className={`inline-flex items-center gap-1 mt-1.5 text-xs font-bold ${inStock ? 'text-emerald-600' : 'text-red-500'}`}>
                          {inStock ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <ShieldCheckIcon className="w-3.5 h-3.5" />}
                          {inStock ? 'In Stock' : 'Insufficient Stock'}
                        </span>
                      </div>
                      <p className="text-lg font-black text-gray-900 shrink-0">₹{item.price.toFixed(2)}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                      <div className="bg-gray-50 p-1.5 rounded-xl border border-gray-200/60">
                        <QuantitySelector
                          quantity={item.quantity}
                          onQuantityChange={(qty) => handleQuantityChange(item.product as string, qty)}
                          minQuantity={item.minOrderQuantity || 1}
                          maxQuantity={item.stock || 99}
                          disabled={!inStock}
                          size="md"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Subtotal</p>
                          <p className="text-base font-bold text-indigo-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.product as string)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Order Summary ───────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Price Details</h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price ({itemCount} item{itemCount > 1 ? 's' : ''})</span>
                <span className="font-semibold text-gray-900">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Charges</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (10%)</span>
                <span className="font-semibold text-gray-900">₹{(total * 0.1).toFixed(2)}</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-4 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-black text-primary-600">₹{(total * 1.1).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowPaymentModal(true)}
              size="lg"
              className="w-full rounded-xl shadow-xl shadow-primary-500/20 font-bold text-base py-4 transition-transform active:scale-[0.98]"
              disabled={items.some(item => !item.stock || item.stock < item.quantity)}
            >
              Proceed to Pay
            </Button>

            <div className="mt-5 flex items-start gap-3 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <LockClosedIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-emerald-800 leading-relaxed">
                Safe & secure payments powered by <strong>Razorpay</strong>. 100% authentic wholesale products.
              </p>
            </div>

            {/* Razorpay badge */}
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
              <span className="font-semibold">Powered by</span>
              <span className="font-black text-[#3395FF]">Razorpay</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment Method Modal ──────────────────────────────────────── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300">

            {orderStatus === 'processing' ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-gray-100 border-t-primary-600 rounded-full animate-spin mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Order…</h3>
                <p className="text-gray-500 text-sm">Please do not close or refresh this window.</p>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Select Payment Method</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Amount: <strong className="text-primary-600">₹{(total * 1.1).toFixed(2)}</strong></p>
                  </div>
                  <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6 space-y-3">
                  {/* Online Option */}
                  <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-100' : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <div className="ml-4 flex items-center justify-between w-full">
                      <div>
                        <span className="block text-sm font-bold text-gray-900">UPI / Cards / Net Banking</span>
                        <span className="block text-xs text-gray-500 font-medium mt-0.5">Instant payment via Razorpay</span>
                        {/* Razorpay payment icons */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-bold">UPI</span>
                          <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-700 rounded font-bold">Debit</span>
                          <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-bold">Credit</span>
                          <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded font-bold">NetBank</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <CreditCardIcon className={`w-8 h-8 ${paymentMethod === 'online' ? 'text-primary-600' : 'text-gray-400'}`} />
                        {paymentMethod === 'online' && (
                          <span className="text-[9px] font-black text-[#3395FF]">Razorpay</span>
                        )}
                      </div>
                    </div>
                  </label>

                  {/* COD Option */}
                  <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-100' : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <div className="ml-4 flex items-center justify-between w-full">
                      <div>
                        <span className="block text-sm font-bold text-gray-900">Cash on Delivery</span>
                        <span className="block text-xs text-gray-500 font-medium mt-0.5">Pay when you receive the order</span>
                      </div>
                      <BanknotesIcon className={`w-8 h-8 ${paymentMethod === 'cod' ? 'text-primary-600' : 'text-gray-400'}`} />
                    </div>
                  </label>

                  {/* Security note */}
                  {paymentMethod === 'online' && (
                    <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <LockClosedIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 font-medium">
                        You'll be securely redirected to Razorpay to complete the payment. Your financial details are never shared with us.
                      </p>
                    </div>
                  )}

                  <div className="pt-3">
                    <Button
                      onClick={processPayment}
                      disabled={!paymentMethod || placingOrder}
                      className="w-full text-base py-4 rounded-xl shadow-lg font-bold"
                    >
                      {paymentMethod === 'online'
                        ? `Pay ₹${(total * 1.1).toFixed(2)} via Razorpay`
                        : paymentMethod === 'cod'
                        ? `Confirm COD Order ₹${(total * 1.1).toFixed(2)}`
                        : `Pay ₹${(total * 1.1).toFixed(2)}`}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  function handleRemoveItem(productId: string) {
    removeFromCart(productId);
  }
};

export default Cart;
