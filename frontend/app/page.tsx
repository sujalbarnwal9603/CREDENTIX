'use client'

import { useState } from 'react'
import { PricingCard } from '@/components/pricing-card'
import SignUpForm from '@/components/signup-form'

export default function PricingPage() {
  const [showSignUp, setShowSignUp] = useState(false)

  const freeFeatures = [
    "Basic authentication",
    "User management",
    "Role-based access control",
    "Community support",
    "1,000 monthly active users",
  ]

  const premiumFeatures = [
    "All Free features",
    "Advanced authentication methods",
    "Custom roles & permissions",
    "Priority support",
    "10,000 monthly active users",
    "Audit logs",
  ]

  const premiumPlusFeatures = [
    "All Premium features",
    "Enterprise SSO (SAML/OIDC)",
    "Dedicated account manager",
    "Unlimited monthly active users",
    "Custom integrations",
    "SLA guarantee",
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-white mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Find the perfect authentication solution for your needs, from basic user management to enterprise-grade security.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <PricingCard
          tier="Free"
          price="$0"
          features={freeFeatures}
          buttonText="Get Started"
          onButtonClick={() => setShowSignUp(true)}
        />
        <PricingCard
          tier="Premium"
          price="$49"
          features={premiumFeatures}
          buttonText="Upgrade"
          isComingSoon
        />
        <PricingCard
          tier="Premium+"
          price="$99"
          features={premiumPlusFeatures}
          buttonText="Contact Sales"
          isComingSoon
        />
      </div>

      {showSignUp && (
        <div className="mt-12 w-full max-w-md">
          <SignUpForm />
        </div>
      )}
    </div>
  )
}
