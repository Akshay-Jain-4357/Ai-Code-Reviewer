"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ArrowLeft, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      id: "free",
      name: "Developer Starter",
      desc: "For individual developers scanning personal projects.",
      priceMonthly: 0,
      priceYearly: 0,
      limit: "10 reviews / month",
      features: [
        "10 automated scans per month",
        "Fast Review mode (PR Summaries)",
        "Standard processing queue",
        "Email support",
        "GitHub integration single user"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      id: "pro",
      name: "Pro Team Pack",
      desc: "For growing engineering squads requiring deep diagnostics.",
      priceMonthly: 49,
      priceYearly: 39,
      limit: "Unlimited reviews",
      features: [
        "Unlimited code reviews",
        "Deep Audit mode (File-by-file analysis)",
        "Advanced Security threats scans",
        "Custom repository review rules",
        "Analytics & token dashboard metrics",
        "Priority processing queue",
        "Slack & webhooks integration alerts"
      ],
      cta: "Upgrade to Pro",
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise Core",
      desc: "For scaling departments requiring audit trails and SSO.",
      priceMonthly: 199,
      priceYearly: 159,
      limit: "Unlimited + Self-Hosted Option",
      features: [
        "Everything in Pro Team Pack",
        "SSO & SAML Authentication locks",
        "Self-hosted Docker runners options",
        "Custom LLM API routes & models fallback",
        "Audit logs exporter (CSV / API)",
        "Dedicated Support SLA contract",
        "Developer education webinars"
      ],
      cta: "Contact Enterprise",
      popular: false
    }
  ];

  const handleCheckout = (planId: string) => {
    alert(`Upgrading to ${planId} plan. Mock Stripe session loading... Redirecting...`);
    window.location.href = "/dashboard";
  };

  return (
    <div className="relative min-h-screen bg-[#050507] text-white selection:bg-blue-600/35 overflow-hidden py-16 px-4">
      {/* Background Orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_10%,rgba(37,99,235,0.08),rgba(255,255,255,0))]" />

      <div className="max-w-6xl mx-auto space-y-12 relative">
        
        {/* Back control */}
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="inline-flex items-center space-x-2 text-xs text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded bg-blue-600 flex items-center justify-center">
              <ShieldCheck className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-bold text-xs tracking-tight">Reviewer.AI</span>
          </div>
        </div>

        {/* Header Title */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Transparent, Scale-Ready Pricing</h1>
          <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
            Upgrade your team's code standards today. Save developer review cycles and merge pull requests with high security confidence.
          </p>

          {/* Monthly / Yearly Selector Toggle */}
          <div className="flex items-center justify-center pt-4">
            <div className="bg-white/5 border border-white/10 p-1 rounded-xl flex items-center space-x-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span>Yearly</span>
                <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.2 rounded-full font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-12 items-stretch">
          {plans.map((p) => {
            const price = billingCycle === "monthly" ? p.priceMonthly : p.priceYearly;
            return (
              <div 
                key={p.id}
                className={`glass-card rounded-2xl p-8 flex flex-col justify-between border relative transition-all ${
                  p.popular 
                    ? "border-2 border-blue-500 shadow-2xl shadow-blue-500/10 scale-102 z-10" 
                    : "border-white/10"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3.5 right-6 bg-blue-500 text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className={`font-bold text-xs uppercase ${p.popular ? "text-blue-400" : "text-gray-400"}`}>{p.name}</h3>
                  <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">{p.desc}</p>
                  
                  {/* Cost info */}
                  <div className="my-6">
                    <span className="text-4xl font-extrabold text-white">${price}</span>
                    {price > 0 && <span className="text-xs text-gray-500 font-medium">/mo</span>}
                    <div className="text-[10px] text-blue-500 font-semibold mt-1 font-mono">{p.limit}</div>
                  </div>

                  {/* Checklist features */}
                  <div className="border-t border-white/5 pt-6 space-y-3.5">
                    {p.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start space-x-2 text-xs text-gray-300">
                        <Check className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <span className="leading-normal">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={() => handleCheckout(p.id)}
                    className={`w-full py-3 rounded-xl font-semibold text-xs transition-all active:scale-98 flex items-center justify-center space-x-2 ${
                      p.popular
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                        : "bg-white/10 hover:bg-white/15 text-white"
                    }`}
                  >
                    <span>{p.cta}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Freq asked questions quick grid */}
        <div className="pt-16 border-t border-white/5 max-w-4xl mx-auto space-y-6">
          <h2 className="text-center font-bold text-lg text-gray-200">Frequently Asked Questions</h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-xs">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
              <h4 className="font-bold text-gray-200 flex items-center">
                <HelpCircle className="h-4 w-4 text-blue-500 mr-2 shrink-0" />
                Is customer source code saved by the LLM?
              </h4>
              <p className="text-gray-400 leading-relaxed">
                No. We maintain an enterprise privacy protocol. Diff data is streamed statelessly to the LLM and deleted immediately post-review. We do not train models on your code.
              </p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
              <h4 className="font-bold text-gray-200 flex items-center">
                <HelpCircle className="h-4 w-4 text-blue-500 mr-2 shrink-0" />
                Can we self-host the review runners?
              </h4>
              <p className="text-gray-400 leading-relaxed">
                Yes, our Enterprise Core plan supports hosting docker-based audit agents inside your private VPC (AWS/GCP), keeping all code processing fully localized.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
