'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Pricing() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    vin: ''
  });
  const [loading, setLoading] = useState(false);

  // Paddle Configuration
  const CONFIG = {
    clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID
  };

  // Modal styles
  const modalStyles = {
    overlay: {
      display: 'flex',
      position: 'fixed',
      zIndex: 1000,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modal: {
      backgroundColor: 'white',
      width: '90%',
      maxWidth: '500px',
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0 5px 30px rgba(0, 0, 0, 0.15)',
      position: 'relative'
    },
    closeButton: {
      position: 'absolute',
      right: '20px',
      top: '15px',
      fontSize: '24px',
      cursor: 'pointer'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '5px',
      fontSize: '16px'
    },
    submitButton: {
      width: '100%',
      padding: '15px',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    loadingSpinner: {
      border: '4px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '50%',
      borderTop: '4px solid #2563eb',
      width: '30px',
      height: '30px',
      animation: 'spin 1s linear infinite',
      margin: '10px auto'
    }
  };

  // Initialize Paddle
  useEffect(() => {
    let isMounted = true;

    const initializePaddle = () => {
      if (window.Paddle && isMounted) {
        try {
          window.Paddle.Environment.set("production");
          window.Paddle.Setup({
            token: CONFIG.clientToken,
            eventCallback: function (event) {
              if (event.name === "checkout.completed") {
                setShowModal(false);
                alert("Payment successful! You will receive your report shortly.");
              }
            }
          });
        } catch (error) {
          console.error("Paddle initialization error:", error);
        }
      }
    };

    // Load Paddle script if not already loaded
    if (!window.Paddle) {
      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.onload = initializePaddle;
      script.onerror = () => {
        console.error("Failed to load Paddle script");
      };
      document.head.appendChild(script);
    } else {
      initializePaddle();
    }

    return () => {
      isMounted = false;
    };
  }, [CONFIG.clientToken]);

  // Open modal
  const openModal = () => {
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', email: '', vin: '' });
    setLoading(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Send email notification
  const sendMail = async (data) => {
    try {
      const response = await fetch('https://restless-haze-c6a3.mohamedalzafar.workers.dev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.text();
      if (response.ok) {
        // Submitted successfully
      } else {
        // Error occurred
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Open Paddle checkout
  const openPaddleCheckout = (customerName, customerEmail, customerVin) => {
    try {

      window.Paddle.Checkout.open({
        items: [{
          priceId: CONFIG.priceId,
          quantity: 1
        }],
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en",
        },
        customData: {
          "name": customerName,
          "email": customerEmail,
          "vin": customerVin
        }
      });

      setLoading(false);

    } catch (error) {
      console.error("Paddle checkout error:", error.message);
      alert("There was an error opening the checkout. Please try again.");
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = {
      name: formData.name,
      email: formData.email,
      vin: formData.vin
    };

    sendMail(submitData);
    openPaddleCheckout(formData.name, formData.email, formData.vin);
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/car-logo.webp"
                  alt="HistoriVIN"
                  width={40}
                  height={40}
                  className="mr-3"
                />
                <div className="text-2xl font-bold text-blue-600">HistoriVIN</div>
              </Link>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
              <Link href="/pricing" className="text-blue-600 font-semibold">Pricing</Link>
              <Link href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            HistoriVIN Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transparent, affordable pricing for comprehensive vehicle history reports. No hidden fees, no subscriptions - just one fair price per report.
          </p>
        </div>
      </section>

      {/* Main Pricing Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Popular Badge */}
            <div className="bg-blue-600 text-white text-center py-3">
              <span className="font-semibold text-sm uppercase tracking-wide">Most Popular • Trusted by Thousands</span>
            </div>
            
            <div className="p-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Vehicle History Report</h2>
              <p className="text-gray-600 mb-8">Complete vehicle analysis and history check</p>
              
              <div className="mb-8">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-6xl font-bold text-blue-600">$39</span>
                  <span className="text-2xl text-gray-500 ml-2">.99</span>
                </div>
                <p className="text-gray-600">Per vehicle report • One-time payment</p>
              </div>

              <div className="mb-8">
                <button 
                  onClick={openModal}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg inline-block"
                >
                  Get Your Report Now
                </button>
                <p className="text-sm text-gray-500 mt-3">Instant delivery • No recurring charges</p>
              </div>

              {/* Important Notice */}
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 text-left">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Digital Service - No Refunds</h3>
                    <div className="mt-1 text-sm text-red-700">
                      <p>This is a digital service with instant delivery. All sales are final and non-refundable.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What is Included in Every Report
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              For $20, you get a comprehensive vehicle history analysis with data from multiple trusted sources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Accident & Damage History",
                description: "Complete record of reported accidents, collisions, and damage incidents",
                icon: "🚗"
              },
              {
                title: "Title Information",
                description: "Title history, liens, salvage records, and ownership transfers",
                icon: "📋"
              },
              {
                title: "Mileage Verification",
                description: "Odometer readings and mileage rollback detection",
                icon: "📊"
              },
              {
                title: "Safety Recalls",
                description: "Open and resolved safety recalls and manufacturer notices",
                icon: "🛡️"
              },
              {
                title: "Market Value Analysis",
                description: "Current market value, depreciation analysis, and price recommendations",
                icon: "💰"
              },
              {
                title: "Service Records",
                description: "Maintenance history and service intervals (when available)",
                icon: "🔧"
              },
              {
                title: "Flood & Natural Disaster",
                description: "Water damage, hurricane, tornado, and other natural disaster records",
                icon: "🌪️"
              },
              {
                title: "Theft Records",
                description: "Stolen vehicle reports and recovery information",
                icon: "🚨"
              },
              {
                title: "Vehicle Specifications",
                description: "Detailed specs, equipment, features, and manufacturer information",
                icon: "⚙️"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4 text-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Information */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fast & Reliable Delivery
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your comprehensive vehicle history report delivered directly to your email.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Processing</h3>
              <p className="text-gray-600">Your request is processed immediately after payment confirmation</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Email Delivery</h3>
              <p className="text-gray-600">Detailed PDF report sent to your email within 6-12 hours (usually 1-2 hours)</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Private</h3>
              <p className="text-gray-600">All transactions secured with SSL encryption and privacy protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Secure Payment Options</h2>
          <p className="text-xl text-gray-600 mb-12">We accept all major payment methods through our secure payment processor, Paddle.</p>
          
          <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
              <div className="text-center">
                <div className="text-3xl mb-2">💳</div>
                <p className="text-sm text-gray-600">Credit Cards</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">💰</div>
                <p className="text-sm text-gray-600">Debit Cards</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏦</div>
                <p className="text-sm text-gray-600">Bank Transfer</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📱</div>
                <p className="text-sm text-gray-600">Digital Wallets</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            All payments are processed securely by Paddle, our trusted payment partner. Your payment information is encrypted and never stored on our servers.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pricing FAQ</h2>
            <p className="text-xl text-gray-600">Common questions about our pricing and service.</p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Why does HistoriVIN cost $20?",
                answer: "Our pricing reflects the comprehensive nature of our reports and the costs associated with accessing premium automotive databases. We provide detailed analysis and professional report formatting - all for less than the cost of a tank of gas."
              },
              {
                question: "Are there any hidden fees or recurring charges?",
                answer: "No. The $20 price is a one-time payment per report. There are no hidden fees, monthly subscriptions, or recurring charges. You pay once and receive your complete vehicle history report."
              },
              {
                question: "Can I get a refund if I'm not satisfied?",
                answer: "No. HistoriVIN is a digital service with instant delivery. All sales are final and non-refundable. Please ensure you enter the correct VIN before purchasing."
              },
              {
                question: "How does your pricing compare to competitors?",
                answer: "Our $20 price is competitive with other major vehicle history providers. However, we believe our comprehensive data coverage, fast delivery, and detailed reporting provide exceptional value."
              },
              {
                question: "Do you offer discounts for multiple reports?",
                answer: "Currently, each report is priced individually at $20. We may offer promotional pricing from time to time, but each VIN requires a separate report purchase."
              },
              {
                question: "What if the VIN I entered is incorrect?",
                answer: "If you enter an incorrect VIN, we will still generate a report for the VIN provided. Since this is a digital service, we cannot offer refunds for user input errors. Please double-check your VIN before purchasing."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Your Vehicle History Report?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who trust HistoriVIN for their vehicle history needs.
          </p>
          
          <div className="mb-8">
            <button 
              onClick={openModal}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg inline-block"
            >
              Get Started for $20
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="text-center">
              <div className="font-semibold text-white">One-time fee: $20</div>
              <div className="text-blue-100">No recurring charges</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white">Fast delivery: 6-12 hours</div>
              <div className="text-blue-100">Usually within 1-2 hours</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white">Comprehensive data</div>
              <div className="text-blue-100">Multiple trusted sources</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 flex items-center">
              <Image
                src="/car-logo.webp"
                alt="HistoriVIN"
                width={32}
                height={32}
                className="mr-3"
              />
              <div className="text-xl font-bold text-blue-400">HistoriVIN</div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm">
              <Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-blue-400 transition-colors">Terms & Conditions</Link>
              <Link href="/refund" className="hover:text-blue-400 transition-colors">Refund Policy</Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-800 text-center text-gray-400">
            © 2015 CarCheck. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Checkout Modal */}
      {showModal && (
        <div 
          style={modalStyles.overlay}
          onClick={closeModal}
        >
          <div 
            style={modalStyles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <span 
              style={modalStyles.closeButton}
              onClick={closeModal}
            >
              &times;
            </span>
            
            <h3 style={{ marginBottom: '20px', color: '#2563eb' }}>
              Enter Your Details
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={modalStyles.input}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={modalStyles.input}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Vehicle VIN Number
                </label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  required
                  style={modalStyles.input}
                  placeholder="Enter VIN number"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...modalStyles.submitButton,
                  display: loading ? 'none' : 'block'
                }}
              >
                Proceed to Payment
              </button>

              {loading && (
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <div style={modalStyles.loadingSpinner}></div>
                  <p>Loading...</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}