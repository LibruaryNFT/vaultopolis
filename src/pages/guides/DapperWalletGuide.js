import React from "react";
import { FaWallet } from "react-icons/fa";
import GuideTemplate from "../../components/GuideTemplate";

function DapperWalletGuide() {
  const guideData = {
    title: "NBA Top Shot Account & Dapper Wallet Setup",
    description: "Create your Top Shot account and automatically get a Dapper Wallet - it's that simple!",
    keywords: "nba top shot signup, dapper wallet setup, flow blockchain guide, vaultopolis tutorial, free nft pack, nba moments",
    canonicalUrl: "https://vaultopolis.com/guides/dapper-wallet",
    ogTitle: "NBA Top Shot Account & Dapper Wallet Setup | Flow Blockchain Guides",
    ogDescription: "Learn how to create an NBA Top Shot account and automatically get a Dapper Wallet. Step-by-step guide to getting started with Flow blockchain.",
    icon: FaWallet,
    difficulty: "Beginner",
    estimatedTime: "2-3 minutes",
    lastUpdated: "August 19, 2025",
    prerequisites: (
      <div className="space-y-3">
        <p className="text-center mb-4">
          Before creating your NBA Top Shot account, ensure you meet:
        </p>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-brand-accent font-semibold">1.</span>
            <span className="text-brand-text/60">Age requirement: At least 18 years old</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-brand-accent font-semibold">2.</span>
            <span className="text-brand-text/60">Location requirement: Resident in a participating country/state</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-brand-accent font-semibold">3.</span>
            <span className="text-brand-text/60">Account limit: Limited to 1 account per collector</span>
          </div>
        </div>
      </div>
    ),
    steps: [
      {
        id: 1,
        title: "Visit nbatopshot.com and Click Login",
        content: (
          <div className="space-y-2">
            <p className="text-brand-text/80">
              Start by visiting the official NBA Top Shot website and locate the "Login" button in the top right corner of the page.
            </p>
            
            <div className="bg-brand-secondary p-1 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-1">Requirements:</h4>
              <ul className="text-sm text-brand-text/70 space-y-1">
                <li>• At least 18 years old</li>
                <li>• A <a href="https://support.nbatopshot.com/hc/en-us/articles/4403783954451-Age-and-Location-Requirements" target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline">resident in a participating country/state</a></li>
                <li>• Limited to 1 account per collector</li>
              </ul>
            </div>
            
            <div className="text-center flex flex-col items-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/homepage.png" 
                alt="NBA Top Shot Homepage" 
                className="max-w-xs h-auto rounded-lg border border-brand-border mx-auto"
              />
            </div>
          </div>
        )
      },
      {
        id: 2,
        title: "Click Sign Up from Login Modal",
        content: (
          <div className="space-y-2">
            <p className="text-brand-text/80">
              From the login modal that appears, click the "Sign Up" option to begin creating your account.
            </p>
            
            <div className="text-center flex flex-col items-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/signup.png" 
                alt="NBA Top Shot Signup Page" 
                className="max-w-xs h-auto rounded-lg border border-brand-border mx-auto"
              />
            </div>
          </div>
        )
      },
      {
        id: 3,
        title: "Choose Your Signup Method",
        content: (
          <div className="space-y-2">
            <p className="text-brand-text/80">
              Select how you want to create your account. You have two options:
            </p>
            
            <div className="space-y-2">
              <div className="bg-brand-secondary p-1 rounded border border-brand-border">
                <strong className="text-brand-accent">Social Login (Google or Apple ID):</strong>
                <ul className="text-sm text-brand-text/70 mt-1 space-y-1">
                  <li>• Use existing Google or Apple credentials</li>
                  <li>• If multiple Google accounts, select the one to use</li>
                  <li>• For Apple ID, we recommend sharing your email address</li>
                </ul>
              </div>
              <div className="bg-brand-secondary p-1 rounded border border-brand-border">
                <strong className="text-brand-accent">Email and Password:</strong>
                <ul className="text-sm text-brand-text/70 mt-1 space-y-1">
                  <li>• Create account with email and password</li>
                  <li>• Verify your account through email</li>
                </ul>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 4,
        title: "Complete Your Profile",
        content: (
          <div className="space-y-2">
            <p className="text-brand-text/80">
              Finalize your account setup by completing your profile information and verifying your identity.
            </p>
            
            <ul className="text-sm text-brand-text/70 space-y-1">
              <li>• Set up your profile information</li>
              <li>• Secure your account with mobile phone number</li>
              <li>• Verify your identity with 6-digit code sent to mobile</li>
              <li>• Review and agree to Terms of Use, Privacy Policy, and NBA Privacy Policy</li>
            </ul>
          </div>
        )
      }
    ],
    successMessage: (
      <>
        <strong>That's it!</strong> You've successfully created your account and can now start your collection! 
        Check out the available packs to get your first NBA Top Shot Moments.
      </>
    ),
    faq: [
      {
        question: "How long does it take to create a Top Shot account?",
        answer: "The entire signup process typically takes 2-3 minutes. This includes account creation, profile setup, and identity verification. You'll be able to start collecting immediately after verification."
      },
      {
        question: "Do I need to provide my real name and information?",
        answer: "Yes, NBA Top Shot requires accurate personal information for identity verification and compliance purposes. This helps ensure account security and prevents fraud."
      },
      {
        question: "Can I create multiple Top Shot accounts?",
        answer: "No, NBA Top Shot limits users to one account per collector. This policy helps maintain fair access to drops and prevents market manipulation."
      },
      {
        question: "What if I'm not in a supported country or state?",
        answer: "NBA Top Shot has specific geographic restrictions. If you're not in a supported location, you may need to wait for expansion to your region or consider alternative NFT platforms."
      },
      {
        question: "Is the Dapper Wallet automatically created?",
        answer: "Yes! When you create a Top Shot account, a Dapper Wallet is automatically generated and linked to your account. You don't need to set up a separate wallet."
      },
      {
        question: "What happens if I lose access to my account?",
        answer: "Contact NBA Top Shot support immediately. They can help you recover your account through the verification process. Make sure to keep your login credentials secure."
      },
      {
        question: "Can I change my email or phone number later?",
        answer: "Yes, you can update your contact information in your account settings. However, you'll need to verify any changes through the verification process."
      },
      {
        question: "Are there any fees for creating a Top Shot account?",
        answer: "No, creating a Top Shot account is completely free. You only pay for the Moments you purchase or the packs you open."
      }
    ]
  };

  return <GuideTemplate {...guideData} />;
}

export default DapperWalletGuide; 