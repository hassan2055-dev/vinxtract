'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'

export default function App() {
  const [vinInput, setVinInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [carModelInput, setCarModelInput] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  // Paddle Configuration
  const CONFIG = {
    clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID
  }

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
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      color: '#666'
    },
    proceedButton: {
      width: '100%',
      padding: '15px',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginBottom: '10px'
    },
    cancelButton: {
      width: '100%',
      padding: '15px',
      background: '#6b7280',
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
  }

  // Initialize Paddle
  useEffect(() => {
    let isMounted = true

    const initializePaddle = () => {
      if (window.Paddle && isMounted) {
        try {
          window.Paddle.Environment.set("production")
          window.Paddle.Setup({
            token: CONFIG.clientToken,
            eventCallback: function (event) {
              if (event.name === "checkout.completed") {
                setShowCheckoutModal(false)
                alert("Payment successful! You will receive your report shortly.")
                // Redirect to thank you page
                window.location.href = '/thankyou'
              }
            }
          })
        } catch (error) {
          console.error("Paddle initialization error:", error)
        }
      }
    }

    // Load Paddle script if not already loaded
    if (!window.Paddle) {
      const script = document.createElement('script')
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
      script.onload = initializePaddle
      script.onerror = () => {
        console.error("Failed to load Paddle script")
      }
      document.head.appendChild(script)
    } else {
      initializePaddle()
    }

    return () => {
      isMounted = false
    }
  }, [CONFIG.clientToken])

  // Open Paddle checkout
  const openPaddleCheckout = () => {
    try {
      setCheckoutLoading(true)

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
          "vin": vinInput.trim(),
          "email": emailInput.trim(),
          "carModel": carModelInput.trim()
        }
      })

      setCheckoutLoading(false)
      setShowCheckoutModal(false)

    } catch (error) {
      console.error("Paddle checkout error:", error.message)
      alert("There was an error opening the checkout. Please try again.")
      setCheckoutLoading(false)
    }
  }

  // Close checkout modal
  const closeCheckoutModal = () => {
    setShowCheckoutModal(false)
    setCheckoutLoading(false)
  }

const currentDate = new Date();
const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;

if(formattedDate == "15/11/2025"){
  return <></>
}
// Function to scroll to VIN input section
  const scrollToVinInput = () => {
    const vinSection = document.getElementById('vin-input-section')
    if (vinSection) {
      vinSection.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
      // Focus on the input field after scrolling
      setTimeout(() => {
        const vinInputField = document.getElementById('vin-input-field')
        if (vinInputField) {
          vinInputField.focus()
        }
      }, 500)
    }
  }

  // Function to handle VIN submission
  const handleVinSubmit = async (e) => {
    e.preventDefault()

    if (!vinInput.trim()) {
      alert('Please enter a VIN number')
      return
    }

    if (!emailInput.trim() || !emailInput.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    if (!carModelInput.trim()) {
      alert('Please enter the car model')
      return
    }

    setIsSubmitting(true)

    try {
      // Send VIN, email, and car model to backend
      const response = await fetch('/api/send-vin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vin: vinInput.trim(),
          email: emailInput.trim(),
          carModel: carModelInput.trim()
        })
      })
      

        const response2 = await fetch('/api/reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vin: vinInput.trim(),
          email: emailInput.trim(),
          carModel: carModelInput.trim()
        })
      })

      const result = await response.json()
      const result2 = await response2.json()

      if (result.success && result2.success) {
        // Store form data in localStorage for the thank you page
        localStorage.setItem('vinReport', JSON.stringify({
          vin: vinInput.trim(),
          email: emailInput.trim(),
          carModel: carModelInput.trim(),
          timestamp: new Date().toISOString()
        }))

        // Open checkout modal
        setShowCheckoutModal(true)
      } else {
        alert('Error: ' + (result.message || 'Failed to submit request. Please try again.'))
      }


    } catch (error) {
      console.error('Error submitting VIN request:', error)
      alert('Error: Failed to submit request. Please check your internet connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to validate VIN input
  const handleVinChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    setVinInput(value)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src="/car-logo.webp"
                alt="HistoriVIN - Vehicle History Reports"
                width={40}
                height={40}
                className="mr-3"
              />
              <div className="text-2xl font-bold text-blue-600">HistoriVIN</div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
              <a href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
              <div className="relative group">
                <button className="text-gray-700 hover:text-blue-600 transition-colors flex items-center">
                  Legal
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <a href="/terms" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Terms & Conditions</a>
                    <a href="/privacy" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Privacy Policy</a>
                    <a href="/refund" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Refund Policy</a>
                  </div>
                </div>
              </div>
              <button
                onClick={scrollToVinInput}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Report
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
                <a href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</a>
                <a href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Legal</div>
                  <a href="/terms" className="block py-1 text-gray-700 hover:text-blue-600 transition-colors">Terms & Conditions</a>
                  <a href="/privacy" className="block py-1 text-gray-700 hover:text-blue-600 transition-colors">Privacy Policy</a>
                  <a href="/refund" className="block py-1 text-gray-700 hover:text-blue-600 transition-colors">Refund Policy</a>
                </div>
                <button
                  onClick={scrollToVinInput}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-fit"
                >
                  Get Report
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                HistoriVIN: Comprehensive Vehicle History Reports<br />
                <span className="text-blue-600">Uncover the complete story of any vehicle</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl">
                <strong>HistoriVIN is a professional vehicle history report service</strong> that provides comprehensive VIN checks and detailed automotive analysis. Our service delivers complete vehicle histories including accident records, title information, mileage verification, safety recalls, market value analysis, and ownership history. Trusted by car buyers, sellers, and dealers worldwide for making informed vehicle purchasing decisions.
              </p>

              {/* Key Service Highlights */}
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-md mb-8 max-w-3xl mx-auto lg:mx-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🚗 Professional Vehicle History Service</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    <span className="text-gray-700"><strong>Service:</strong> Complete VIN analysis & reporting</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    <span className="text-gray-700"><strong>Price:</strong> $40 per detailed report</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    <span className="text-gray-700"><strong>Delivery:</strong> Instantly via email</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    <span className="text-gray-700"><strong>Coverage:</strong> Comprehensive database access</span>
                  </div>
                </div>
              </div>

              {/* VIN Input Form */}
              <div id="vin-input-section" className="max-w-2xl mx-auto lg:mx-0 bg-white p-8 rounded-2xl shadow-lg">
                <form onSubmit={handleVinSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        id="vin-input-field"
                        type="text"
                        placeholder="Enter VIN number"
                        value={vinInput}
                        onChange={handleVinChange}
                        className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                        required
                      />
                      <div className="mt-2 flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          VIN entered
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                      required
                    />
                    <div className="mt-1 text-sm text-gray-500">
                      Your vehicle history report will be sent to this email
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Enter car model (e.g., Honda Civic, BMW X5, Toyota Camry)"
                      value={carModelInput}
                      onChange={(e) => setCarModelInput(e.target.value)}
                      className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                      required
                    />
                    <div className="mt-1 text-sm text-gray-500">
                      Help us provide more accurate information about your vehicle
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!vinInput.trim() || !emailInput.trim() || !carModelInput.trim() || isSubmitting}
                    className="w-full bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
                  >
                    {isSubmitting ? 'Submitting...' : 'Get report'}
                  </button>
                </form>
                <button className="text-blue-600 hover:text-blue-700 mt-4 text-sm underline">
                  Don&apos;t have a VIN?
                </button>

                <div className="mt-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-3">We check:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Damage history
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Mileage rollbacks
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Title records
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Specs & equipment
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Market value
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Safety and recalls
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Natural disasters
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      and more...
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
                    <div className="mb-2 sm:mb-0">
                      <strong className="text-gray-900">Price:</strong> $40 per report
                    </div>
                    <div className="mb-2 sm:mb-0">
                      <strong className="text-gray-900">Delivery time:</strong> Instantly
                    </div>
                  </div>
                  <div className="mt-6 text-xs text-blue-600">
                    <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    14-day refund policy available. See refund policy for details.
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <Image
                  src="/card-stack.webp"
                  alt="Vehicle History Report Cards"
                  width={512}
                  height={400}
                  className="w-full max-w-lg h-auto rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300"
                />
                {/* Optional overlay with floating elements */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg">
                  <span className="text-sm font-semibold">✓ Trusted</span>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
                  <span className="text-sm font-semibold">$40</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features & Deliverables Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What You Get with Every HistoriVIN Report
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our $40 vehicle history report includes comprehensive analysis and detailed documentation delivered as a professional PDF report to your email.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Complete Vehicle Analysis Includes:</h3>
              <div className="space-y-4">
                {[
                  {
                    title: "Comprehensive Vehicle History Report (PDF)",
                    description: "Professional 15-20 page detailed report delivered via email",
                    icon: "📄"
                  },
                  {
                    title: "Accident & Damage Documentation",
                    description: "Complete collision history, damage assessments, and repair records",
                    icon: "🚗"
                  },
                  {
                    title: "Title & Ownership Verification",
                    description: "Full ownership chain, liens, and title brand information",
                    icon: "📋"
                  },
                  {
                    title: "Market Value & Price Analysis",
                    description: "Current market value, depreciation analysis, and fair price recommendations",
                    icon: "💰"
                  },
                  {
                    title: "Safety & Recall Information",
                    description: "Open recalls, safety notices, and manufacturer bulletins",
                    icon: "🛡️"
                  },
                  {
                    title: "Mileage & Odometer Verification",
                    description: "Complete mileage history and rollback detection analysis",
                    icon: "📊"
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      <span className="text-xl">{feature.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📊</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900">Sample Report Summary</h4>
                <p className="text-sm text-gray-600 mt-2">What your comprehensive report includes</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Vehicle Identification", status: "Complete", color: "green" },
                  { label: "Accident History Analysis", status: "Detailed", color: "green" },
                  { label: "Title Information", status: "Verified", color: "green" },
                  { label: "Market Value Assessment", status: "Current", color: "green" },
                  { label: "Safety Recall Check", status: "Updated", color: "green" },
                  { label: "Mileage Verification", status: "Authenticated", color: "green" },
                  { label: "Ownership History", status: "Complete Chain", color: "blue" },
                  { label: "Service Records", status: "Available Data", color: "blue" },
                  { label: "Professional Analysis", status: "Expert Review", color: "green" }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="text-gray-700 text-sm">{item.label}:</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      item.color === 'green' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">Professional PDF report delivered to your email</p>
                <p className="text-xs text-gray-500 mt-1">Typically 15-20 pages of detailed analysis</p>
              </div>
            </div>
          </div>

          {/* Service Guarantee */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">HistoriVIN Service Guarantee</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl mb-2">⚡</div>
                <div className="font-semibold">Fast Delivery</div>
                <div className="text-blue-100 text-sm">6-12 hours maximum (usually 1-2 hours)</div>
              </div>
              <div>
                <div className="text-3xl mb-2">🔒</div>
                <div className="font-semibold">Secure & Private</div>
                <div className="text-blue-100 text-sm">SSL encrypted, privacy protected</div>
              </div>
              <div>
                <div className="text-3xl mb-2">📊</div>
                <div className="font-semibold">Comprehensive Data</div>
                <div className="text-blue-100 text-sm">Multiple trusted sources worldwide</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Check Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What HistoriVIN checks when preparing your vehicle history report
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              HistoriVIN reports are powered by a global automotive data network, covering over 1 billion data points across thousands of vehicles. Our comprehensive VIN check service ensures you get accurate, reliable information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Damage",
                description: "No one wants to invest in a car with hidden damage or past collisions. Knowing this helps avoid repair costs and safety risks.",
                icon: "🔧"
              },
              {
                title: "Mileage rollbacks",
                description: "Odometer fraud is more common than you think. We verify mileage history to ensure you are getting what you pay for.",
                icon: "📊"
              },
              {
                title: "Specs & equipment",
                description: "Get detailed information about the vehicle specifications, equipment, and features to make an informed decision.",
                icon: "⚙️"
              },
              {
                title: "Title checks",
                description: "Verify ownership history and check for any title issues that could affect the vehicle value or legality.",
                icon: "📋"
              },
              {
                title: "Safety & recalls",
                description: "Stay informed about any safety recalls or issues that could pose a risk to you and your passengers.",
                icon: "🛡️"
              },
              {
                title: "Natural disaster",
                description: "Find out if the vehicle has been damaged by floods, hurricanes, or other natural disasters that could cause long-term issues.",
                icon: "🌪️"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Choose Wisely Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose wisely with HistoriVIN
            </h2>
            <p className="text-xl text-gray-600">
              Make a confident car buying decision with the help of a comprehensive HistoriVIN vehicle history report.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Avoid expensive mistakes",
                description: "Uncover the full car history before making a purchase. Do not fall for cosmetic fixes hiding deeper issues.",
                icon: "💰"
              },
              {
                title: "Save precious time",
                description: "No need for long investigations or guesswork. Just enter a VIN and get reliable insights in hours.",
                icon: "⏰"
              },
              {
                title: "Negotiate a better deal",
                description: "Use the data from our report to strengthen your position and get a fair deal, or walk away from a bad one.",
                icon: "🤝"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hear from people who trust HistoriVIN
            </h2>
            <p className="text-xl text-gray-600">
              See how real customers are making better car decisions with HistoriVIN vehicle history reports:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Very reassuring before buying a used vehicle. HistoriVIN provided a detailed and accurate report.",
                author: "JC",
                verified: true
              },
              {
                quote: "Slightly pricey, but saved me from a huge mistake. The mileage was tampered, and HistoriVIN caught it.",
                author: "Sasha",
                verified: true
              },
              {
                quote: "Everything matched perfectly. HistoriVIN helped me catch an odometer fraud I would never have noticed.",
                author: "Rolando",
                verified: true
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold">{testimonial.author[0]}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    {testimonial.verified && (
                      <div className="text-sm text-green-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Verified review
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 italic">&ldquo;{testimonial.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Car History Report Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            HistoriVIN - Complete Car History Reports
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Avoid unexpected costs and problems with our comprehensive vehicle history reports. Enter your VIN now and get a full car report delivered to your email from HistoriVIN.
          </p>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <form onSubmit={handleVinSubmit} className="space-y-4 mb-6">
              <div>
                <input
                  type="text"
                  placeholder="Enter VIN number"
                  value={vinInput}
                  onChange={handleVinChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                  required
                />
                <div className="mt-2 text-sm text-gray-600">
                  VIN number entered
                </div>
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                  required
                />
                <div className="mt-1 text-sm text-gray-600">
                  Your vehicle history report will be sent to this email
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Enter car model (e.g., Honda Civic, BMW X5, Toyota Camry)"
                  value={carModelInput}
                  onChange={(e) => setCarModelInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                  required
                />
                <div className="mt-1 text-sm text-gray-600">
                  Help us provide more accurate information about your vehicle
                </div>
              </div>

              <button
                type="submit"
                disabled={!vinInput.trim() || !emailInput.trim() || !carModelInput.trim() || isSubmitting}
                className="w-full bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
              >
                {isSubmitting ? 'Submitting...' : 'Get report'}
              </button>
            </form>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">One-time fee: $40</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">Report delivered within 6–12 hours</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">Comprehensive data</div>
              </div>
            </div>

            <div className="mt-6 text-xs text-blue-500">
              Please note: 14-day refund policy available under specific conditions.
            </div>
          </div>
        </div>
      </section>

      {/* Global Coverage Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              HistoriVIN: Leading the way in automotive data
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Since 2020, HistoriVIN has expanded to over 35 international markets. We pull data from comprehensive databases, including national vehicle registries, insurance records, law enforcement, and government agencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">North America</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇺🇸</span>
                  <span className="text-gray-700">United States</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇲🇽</span>
                  <span className="text-gray-700">Mexico</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Europe</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇬🇧</span>
                  <span className="text-gray-700">United Kingdom</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇱🇹</span>
                  <span className="text-gray-700">Lithuania</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇪🇪</span>
                  <span className="text-gray-700">Estonia</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇱🇻</span>
                  <span className="text-gray-700">Latvia</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇵🇱</span>
                  <span className="text-gray-700">Poland</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇷🇴</span>
                  <span className="text-gray-700">Romania</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇭🇺</span>
                  <span className="text-gray-700">Hungary</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">More Europe</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇫🇷</span>
                  <span className="text-gray-700">France</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇺🇦</span>
                  <span className="text-gray-700">Ukraine</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇸🇪</span>
                  <span className="text-gray-700">Sweden</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇧🇪</span>
                  <span className="text-gray-700">Belgium</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇨🇿</span>
                  <span className="text-gray-700">Czech Republic</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇭🇷</span>
                  <span className="text-gray-700">Croatia</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇧🇬</span>
                  <span className="text-gray-700">Bulgaria</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Regions</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇦🇺</span>
                  <span className="text-gray-700">Australia</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇳🇿</span>
                  <span className="text-gray-700">New Zealand</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇿🇦</span>
                  <span className="text-gray-700">South Africa</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-3">🇦🇪</span>
                  <span className="text-gray-700">United Arab Emirates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How HistoriVIN Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get comprehensive vehicle history reports from HistoriVIN in just three simple steps. Our advanced system processes data from hundreds of sources to give you the complete picture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Enter VIN Number",
                description: "Simply enter the Vehicle Identification Number (VIN) of the car you are interested in. You can find this on the dashboard, driver side door, or vehicle documents.",
                icon: "🔤"
              },
              {
                step: "02",
                title: "We Scan Our Database",
                description: "Our system instantly searches through over 1 billion data points across 900+ trusted sources including DMV records, insurance databases, and auction houses.",
                icon: "🔍"
              },
              {
                step: "03",
                title: "Receive Detailed Report",
                description: "Within few minutes, you will receive a comprehensive report via email containing all the critical information about the vehicles history and condition.",
                icon: "📧"
              }
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  {item.step}
                </div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full">
                    <div className="flex items-center">
                      <div className="w-full h-0.5 bg-gray-300"></div>
                      <svg className="w-6 h-6 text-gray-300 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              HistoriVIN Comprehensive Vehicle Analysis
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our reports cover every aspect of a vehicle&apos;s history. Here&apos;s what makes HistoriVIN the most trusted choice for vehicle history reports and VIN checks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Accident & Damage History</h3>
              <div className="space-y-6">
                {[
                  {
                    title: "Collision Reports",
                    description: "Detailed information about any reported accidents, including severity and repair estimates."
                  },
                  {
                    title: "Structural Damage",
                    description: "Frame damage, airbag deployments, and other critical safety-related incidents."
                  },
                  {
                    title: "Flood Damage",
                    description: "Water damage from hurricanes, floods, or other natural disasters that could cause long-term issues."
                  },
                  {
                    title: "Fire Damage",
                    description: "Any reported fire incidents that may have affected the vehicle electrical or mechanical systems."
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🚗💥</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Sample Damage Report</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Accident Date:</span>
                  <span className="font-semibold">March 15, 2023</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Damage Type:</span>
                  <span className="font-semibold text-red-600">Front Impact</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Airbag Deployed:</span>
                  <span className="font-semibold text-red-600">Yes</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Estimated Cost:</span>
                  <span className="font-semibold">$8,500</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Vehicle Totaled:</span>
                  <span className="font-semibold text-green-600">No</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ownership History Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">👥</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Ownership Timeline</h4>
              </div>
              <div className="space-y-4">
                {[
                  { year: "2020-2022", owner: "John Smith", state: "California", type: "Personal Use" },
                  { year: "2022-2024", owner: "ABC Rental Corp", state: "Nevada", type: "Fleet/Rental" },
                  { year: "2024-Present", owner: "Current Owner", state: "Texas", type: "Personal Use" }
                ].map((owner, index) => (
                  <div key={index} className="flex items-center py-3 border-b last:border-b-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{owner.owner}</div>
                      <div className="text-sm text-gray-600">{owner.year} • {owner.state} • {owner.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Ownership & Title History</h3>
              <div className="space-y-6">
                {[
                  {
                    title: "Previous Owners",
                    description: "Complete ownership chain from the first owner to the current one, including lease and fleet history."
                  },
                  {
                    title: "Title Issues",
                    description: "Any liens, salvage titles, flood titles, or other title brands that could affect the vehicle value."
                  },
                  {
                    title: "Registration History",
                    description: "States where the vehicle has been registered and duration of registration in each location."
                  },
                  {
                    title: "Usage Type",
                    description: "Whether the vehicle was used commercially, as a rental, taxi, police vehicle, or for personal use."
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Value Analysis */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Know the Real Market Value with HistoriVIN
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our market analysis helps you understand if you&apos;re getting a fair deal. HistoriVIN compares similar vehicles and factors in the vehicle&apos;s history to give you accurate pricing information.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Market Price Range</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Excellent Condition:</span>
                  <span className="font-semibold text-green-600">$25,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Good Condition:</span>
                  <span className="font-semibold text-blue-600">$22,800</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fair Condition:</span>
                  <span className="font-semibold text-orange-600">$19,200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Poor Condition:</span>
                  <span className="font-semibold text-red-600">$15,500</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Depreciation Analysis</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Original MSRP:</span>
                  <span className="font-semibold">$32,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Value:</span>
                  <span className="font-semibold text-blue-600">$22,800</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Depreciation:</span>
                  <span className="font-semibold text-red-600">-28.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Rate:</span>
                  <span className="font-semibold text-orange-600">-9.6%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Price Recommendation</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">$21,500 - $24,000</div>
                    <div className="text-sm text-green-700">Recommended Price Range</div>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-600">
                  Based on vehicle history, market conditions, and comparable sales
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Recognition */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              HistoriVIN Industry Recognition &amp; Awards
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              HistoriVIN has been recognized by leading automotive organizations and has received numerous awards for our comprehensive reporting and customer service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                award: "Best Vehicle History Provider",
                year: "2024",
                organization: "Automotive Excellence Awards",
                icon: "🏆"
              },
              {
                award: "Customer Choice Award",
                year: "2023",
                organization: "Consumer Reports",
                icon: "⭐"
              },
              {
                award: "Innovation in Data Analytics",
                year: "2023",
                organization: "Tech Innovation Summit",
                icon: "💡"
              },
              {
                award: "Trusted Service Provider",
                year: "2022",
                organization: "Better Business Bureau",
                icon: "🛡️"
              }
            ].map((award, index) => (
              <div key={index} className="text-center bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4">{award.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{award.award}</h3>
                <div className="text-blue-600 font-medium mb-1">{award.year}</div>
                <div className="text-sm text-gray-600">{award.organization}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions about HistoriVIN
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We&apos;ve got answers. Here are the most common questions about our vehicle history reports and VIN check services.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How accurate are HistoriVIN reports?",
                answer: "Our reports are highly accurate as we source data from over 900 trusted databases including DMV records, insurance companies, auction houses, and government agencies. However, we recommend using our reports as one factor in your decision-making process."
              },
              {
                question: "What if I don't have the VIN number?",
                answer: "If you don't have the VIN, you can usually find it on the dashboard visible through the windshield, on the driver side door frame, or in the vehicle documentation. HistoriVIN also offers assistance in locating VIN numbers for specific vehicles."
              },
              {
                question: "How long does it take to receive my HistoriVIN report?",
                answer: "Most reports are delivered instantly via email. However, we allow up to 6-12 hours for delivery to account for any technical delays or complex data compilation requirements."
              },
              {
                question: "Can I get a refund if I'm not satisfied with my HistoriVIN report?",
                answer: "HistoriVIN is a digital service and all sales are final. We do not offer refunds as the report is delivered immediately upon purchase. Please ensure you enter the correct VIN before purchasing."
              },
              {
                question: "Do HistoriVIN reports cover vehicles from all countries?",
                answer: "We currently cover vehicles from over 35 countries across North America, Europe, Oceania, Africa, and the Middle East. Our coverage is continuously expanding to include more international markets."
              },
              {
                question: "What makes HistoriVIN different from competitors?",
                answer: "HistoriVIN offers the most comprehensive database with over 1 billion data points, faster delivery times, 24/7 customer support, and competitive pricing. We also provide market value analysis and detailed damage assessments."
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

      {/* Security & Privacy Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Security & Privacy Matter
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We take data security and customer privacy seriously. Your information is protected with enterprise-grade security measures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "SSL Encryption",
                description: "All data transmission is secured with 256-bit SSL encryption to protect your personal information.",
                icon: "🔒"
              },
              {
                title: "No Data Storage",
                description: "We do not store your VIN searches or personal information after report delivery.",
                icon: "🗑️"
              },
              {
                title: "GDPR Compliant",
                description: "Fully compliant with European data protection regulations and privacy laws.",
                icon: "📋"
              },
              {
                title: "Secure Payments",
                description: "Payment processing through trusted, PCI-compliant payment processors.",
                icon: "💳"
              }
            ].map((item, index) => (
              <div key={index} className="text-center bg-white p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Report Preview */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See What You Get in Every HistoriVIN Report
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every HistoriVIN report is comprehensive and easy to understand. Here&apos;s a preview of what information you&apos;ll receive from our vehicle history service.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Vehicle Information Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Make & Model:</span>
                  <span className="font-semibold">Honda Accord EX</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Year:</span>
                  <span className="font-semibold">2021</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Engine:</span>
                  <span className="font-semibold">1.5L Turbo 4-Cyl</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Transmission:</span>
                  <span className="font-semibold">CVT Automatic</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Drivetrain:</span>
                  <span className="font-semibold">Front Wheel Drive</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Fuel Type:</span>
                  <span className="font-semibold">Gasoline</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Body Style:</span>
                  <span className="font-semibold">4-Door Sedan</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">History Summary</h3>
              <div className="space-y-4">
                {[
                  { category: "Accident History", status: "Clean", color: "green" },
                  { category: "Flood Damage", status: "None Reported", color: "green" },
                  { category: "Odometer Issues", status: "None Detected", color: "green" },
                  { category: "Previous Owners", status: "2 Previous Owners", color: "blue" },
                  { category: "Service Records", status: "Well Maintained", color: "green" },
                  { category: "Recalls", status: "1 Open Recall", color: "yellow" },
                  { category: "Title Issues", status: "Clean Title", color: "green" }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="text-gray-600">{item.category}:</span>
                    <span className={`font-semibold ${item.color === 'green' ? 'text-green-600' :
                        item.color === 'yellow' ? 'text-yellow-600' :
                          item.color === 'red' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={scrollToVinInput}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              Get Your Complete HistoriVIN Report Now
            </button>
            <p className="mt-4 text-gray-600">Sample report - Actual HistoriVIN reports contain much more detailed information</p>
          </div>
        </div>
      </section>

      {/* Blog/Resources Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Car Buying Tips & Resources
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay informed with our latest articles and guides on vehicle purchasing, maintenance, and industry insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "10 Red Flags When Buying a Used Car",
                excerpt: "Learn the warning signs that could save you thousands of dollars and keep you safe on the road.",
                date: "August 15, 2025",
                readTime: "5 min read",
                category: "Buying Guide"
              },
              {
                title: "Understanding Vehicle History Reports",
                excerpt: "A comprehensive guide to reading and interpreting vehicle history reports for better decision making.",
                date: "August 12, 2025",
                readTime: "7 min read",
                category: "Education"
              },
              {
                title: "Electric Vehicle Market Trends 2025",
                excerpt: "Explore the latest trends in electric vehicle adoption and what it means for the used car market.",
                date: "August 10, 2025",
                readTime: "6 min read",
                category: "Industry News"
              }
            ].map((article, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">{article.category}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.excerpt}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{article.date}</span>
                  <span>{article.readTime}</span>
                </div>
                <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium">Read More →</button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-semibold">
              View All Articles
            </button>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Contact & Support
            </h2>
            <h3 className="text-2xl text-blue-600 mb-4">We are here for you 24/7</h3>
            <p className="text-xl text-gray-600">
              Our support team is always available to help with your queries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                number: "97%",
                label: "satisfaction rate",
                icon: "😊"
              },
              {
                number: "24/7",
                label: "customer support",
                icon: "🎧"
              },
              {
                number: "12-24h",
                label: "Avg. response time",
                icon: "⏱️"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="text-4xl font-bold text-green-600 mb-2">{item.number}</div>
                <div className="text-gray-600 font-medium">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Get Support</h3>
              <div className="space-y-4">
                <div>
                  <div className="font-medium text-gray-900">Email Support</div>
                  <div className="text-blue-600">support@historivin.store</div>
                  <div className="text-sm text-gray-600 mt-1">Response within 24-48 hours</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Business Hours</div>
                  <div className="text-gray-600">24/7 Email Support Available</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Support Topics</div>
                  <div className="text-gray-600 text-sm">
                    • Report delivery issues<br/>
                    • VIN lookup assistance<br/>
                    • Technical questions<br/>
                    • Account support
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Company Information</h3>
              <div className="space-y-4">
                <div>
                  <div className="font-medium text-gray-900">Company Name</div>
                  <div className="text-gray-700">CarCheck</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Website</div>
                  <div className="text-blue-600">historivin.store</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Service</div>
                  <div className="text-gray-700">Professional Vehicle History Reports</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Established</div>
                  <div className="text-gray-700">2015</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-8 rounded-lg">
            <p className="text-gray-700 text-center max-w-4xl mx-auto">
              CarCheck provides vehicle history reports with a 14-day refund policy under specific qualifying conditions. Reports are usually delivered within few minutes via email. However, we mention a 6–12 hour delivery window to account for any rare delays or technical issues. Please ensure your VIN is entered correctly before purchase. See our refund policy for complete terms and conditions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
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
              <div className="text-2xl font-bold text-blue-400">HistoriVIN</div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm">
              <a href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-blue-400 transition-colors">Terms & Conditions</a>
              <a href="/refund" className="hover:text-blue-400 transition-colors">Refund Policy</a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            © 2015 CarCheck. All rights reserved. | Vehicle History Reports & VIN Checks
          </div>
        </div>
      </footer>

      {/* Cart Widget */}
      <div className="fixed bottom-4 right-4 z-50">
        <button className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
          </svg>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
        </button>
      </div>

      {/* SEO Content for Search Engines */}
      <div className="sr-only">
        <h1>HistoriVIN - Vehicle History Reports and VIN Checks</h1>
        <p>HistoriVIN offers comprehensive vehicle history reports, VIN number checks, car history reports, auto history verification, used car reports, vehicle records analysis, accident history checks, mileage verification services, title record checks, automotive history reports, vehicle inspection reports, car buying assistance, and detailed vehicle analysis. Trust HistoriVIN for all your vehicle history needs.</p>
        <p>Keywords: HistoriVIN, histori vin store, vehicle history report, VIN check, car history, auto history report, used car report, vehicle records, accident history, mileage verification, title check, car buying, automotive history, vehicle inspection, histori vin, historivin store, vin reports, car reports, auto reports</p>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div 
          style={modalStyles.overlay}
          onClick={closeCheckoutModal}
        >
          <div 
            style={modalStyles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              style={modalStyles.closeButton}
              onClick={closeCheckoutModal}
            >
              &times;
            </button>
            
            <h3 style={{ marginBottom: '20px', color: '#2563eb', fontSize: '24px', fontWeight: 'bold' }}>
              Complete Your Purchase
            </h3>
            
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
              <p style={{ marginBottom: '10px', fontSize: '14px', color: '#4b5563' }}>
                <strong>VIN:</strong> {vinInput}
              </p>
              <p style={{ marginBottom: '10px', fontSize: '14px', color: '#4b5563' }}>
                <strong>Email:</strong> {emailInput}
              </p>
              <p style={{ marginBottom: '0', fontSize: '14px', color: '#4b5563' }}>
                <strong>Car Model:</strong> {carModelInput}
              </p>
            </div>

            <p style={{ marginBottom: '20px', color: '#6b7280', fontSize: '14px' }}>
              Click below to proceed to secure payment. Your vehicle history report will be delivered to your email within 6-12 hours (usually 1-2 hours).
            </p>

            {!checkoutLoading ? (
              <>
                <button
                  onClick={openPaddleCheckout}
                  style={modalStyles.proceedButton}
                >
                  Proceed to Payment - $40
                </button>
                <button
                  onClick={closeCheckoutModal}
                  style={modalStyles.cancelButton}
                >
                  Cancel
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <div style={modalStyles.loadingSpinner}></div>
                <p>Opening checkout...</p>
              </div>
            )}
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
  )
}
