"use client";

import * as React from "react";
import { SharedHeader } from "@/components/shared-header";
import { Footer } from "@/components/ui/code.demo";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SharedHeader />

      <div className="flex-1 overflow-x-hidden">
        {/* Header */}
        <div className="relative w-full min-h-[200px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 w-screen theme-gradient-bg animate-gradient" />
          <div className="absolute inset-0 w-screen" 
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(120, 119, 198, 0.05) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0'
            }}
          />
          <div className="relative w-full max-w-[1200px] mx-auto text-center px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-14 md:pb-16">
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl text-gray-900">Privacy Policy</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p>
                At StudyDrop, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
              <p>
                Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the site.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
              <p>
                We collect information that you provide directly to us when you:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Create an account</li>
                <li>Use our features (Video Learning, Text Humanizer, Flashcards)</li>
                <li>Upload content for processing</li>
                <li>Subscribe to our services</li>
                <li>Contact our support team</li>
              </ul>
              <p>
                This information may include:
              </p>
              <ul className="list-disc pl-6">
                <li>Name and contact information</li>
                <li>Login credentials</li>
                <li>Payment information</li>
                <li>Content you upload (videos, documents, notes)</li>
                <li>Usage data and preferences</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
              <p>
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your transactions</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Develop new products and services</li>
                <li>Monitor and analyze usage patterns</li>
                <li>Protect against, identify, and prevent fraud and other illegal activity</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Data Sharing and Disclosure</h2>
              <p>
                We may share your information with:
              </p>
              <ul className="list-disc pl-6">
                <li>Service providers who perform services on our behalf</li>
                <li>Payment processors for subscription management</li>
                <li>Analytics providers to help us understand how our services are used</li>
                <li>Law enforcement or other third parties when required by law</li>
              </ul>
              <p>
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6">
                <li>Access to your personal data</li>
                <li>Correction of inaccurate data</li>
                <li>Deletion of your data</li>
                <li>Restriction of processing</li>
                <li>Data portability</li>
                <li>Objection to processing</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the information provided below.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
              <p>
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4">
                <a 
                  href="/support" 
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Contact Support
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 