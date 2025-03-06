"use client";

import * as React from "react";
import { SharedHeader } from "@/components/shared-header";
import { Footer } from "@/components/ui/code.demo";

export default function TermsOfServicePage() {
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
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl text-gray-900">Terms of Service</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
              <p>
                These Terms of Service constitute a legally binding agreement made between you and StudyDrop, concerning your access to and use of our website and services.
              </p>
              <p>
                By accessing or using StudyDrop, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Intellectual Property Rights</h2>
              <p>
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights.
              </p>
              <p>
                The Content and Marks are provided on the Site "AS IS" for your information and personal use only. Except as expressly provided in these Terms of Service, no part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">User Representations</h2>
              <p>
                By using the Service, you represent and warrant that:
              </p>
              <ul className="list-disc pl-6">
                <li>All registration information you submit will be true, accurate, current, and complete</li>
                <li>You will maintain the accuracy of such information and promptly update such registration information as necessary</li>
                <li>You have the legal capacity and you agree to comply with these Terms of Service</li>
                <li>You are not a minor in the jurisdiction in which you reside, or if a minor, you have received parental permission to use the Site</li>
                <li>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise</li>
                <li>You will not use the Site for any illegal or unauthorized purpose</li>
                <li>Your use of the Service will not violate any applicable law or regulation</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">User Registration</h2>
              <p>
                You may be required to register with the Site. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Products and Subscriptions</h2>
              <p>
                We make every effort to display as accurately as possible the features, specifications, and details of our products and services. However, we do not guarantee that the features, specifications, and details are accurate, complete, reliable, current, or error-free.
              </p>
              <p>
                We reserve the right to correct any errors, inaccuracies, or omissions, and to change or update information at any time without prior notice.
              </p>
              <p>
                Subscription services are billed in advance on a recurring basis according to your chosen plan. You can cancel your subscription at any time through your account settings or by contacting our customer support team.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Prohibited Activities</h2>
              <p>
                You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
              </p>
              <p>
                As a user of the Site, you agree not to:
              </p>
              <ul className="list-disc pl-6">
                <li>Systematically retrieve data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory</li>
                <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information</li>
                <li>Circumvent, disable, or otherwise interfere with security-related features of the Site</li>
                <li>Use any information obtained from the Site in order to harass, abuse, or harm another person</li>
                <li>Make improper use of our support services or submit false reports of abuse or misconduct</li>
                <li>Use the Site in a manner inconsistent with any applicable laws or regulations</li>
                <li>Upload or transmit viruses, Trojan horses, or other material that interferes with any party's uninterrupted use and enjoyment of the Site</li>
                <li>Attempt to bypass any measures of the Site designed to prevent or restrict access</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">User-Generated Content</h2>
              <p>
                The Site may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Site, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions").
              </p>
              <p>
                Any Contribution you transmit to the Site will be treated as non-confidential and non-proprietary. When you create or make available any Contributions, you thereby represent and warrant that:
              </p>
              <ul className="list-disc pl-6">
                <li>The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party</li>
                <li>You are the creator and owner of or have the necessary licenses, rights, consents, releases, and permissions to use and to authorize us, the Site, and other users of the Site to use your Contributions in any manner contemplated by the Site and these Terms of Service</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
              <p>
                In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the service, even if we have been advised of the possibility of such damages.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of your use of the Site, your breach of these Terms of Service, or your violation of any law or the rights of a third party.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms from time to time at our sole discretion. Therefore, you should review these pages periodically. When we change the Terms in a material manner, we will notify you that material changes have been made to the Terms. Your continued use of the Website or our service after any such change constitutes your acceptance of the new Terms of Service.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
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