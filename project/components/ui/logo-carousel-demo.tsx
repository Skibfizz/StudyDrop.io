"use client";

import React, { type SVGProps, useEffect, useState } from "react";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { LogoCarousel } from "@/components/ui/logo-carousel";
import Image from "next/image";

type Logo = {
  name: string;
  id: number;
  img: (props: SVGProps<SVGSVGElement>) => JSX.Element | JSX.Element;
};

// Custom component to load SVG files with consistent sizing
function SvgImage({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) {
  return (
    <div className="flex items-center justify-center w-full h-full" {...props}>
      <div className="relative w-[140px] h-[70px] flex items-center justify-center">
        <Image 
          src={src} 
          alt={alt} 
          fill
          className="object-contain" 
          priority
          sizes="140px"
        />
      </div>
    </div>
  );
}

// University SVG components using the SVG files from the svgs folder
function HarvardLogo(props: SVGProps<SVGSVGElement>) {
  return <SvgImage src="/svgs/Harvard_University_coat_of_arms.svg" alt="Harvard University" />;
}

function YaleLogo(props: SVGProps<SVGSVGElement>) {
  return <SvgImage src="/svgs/Yale_University_logo.svg" alt="Yale University" />;
}

function StanfordLogo(props: SVGProps<SVGSVGElement>) {
  return <SvgImage src="/svgs/Stanford_wordmark_(2012).svg" alt="Stanford University" />;
}

function BerkeleyLogo(props: SVGProps<SVGSVGElement>) {
  return <SvgImage src="/svgs/University_of_California,_Berkeley_logo.svg" alt="UC Berkeley" />;
}

function UCLALogo(props: SVGProps<SVGSVGElement>) {
  return <SvgImage src="/svgs/University_of_California,_Los_Angeles_logo.svg" alt="UCLA" />;
}

function PrincetonLogo(props: SVGProps<SVGSVGElement>) {
  return <SvgImage src="/svgs/Princeton_text_logo.svg" alt="Princeton University" />;
}

// Define the logos array with the university SVGs
const allLogos: Logo[] = [
  {
    name: "Harvard University",
    id: 1,
    img: HarvardLogo,
  },
  {
    name: "Yale University",
    id: 2,
    img: YaleLogo,
  },
  {
    name: "Stanford University",
    id: 3,
    img: StanfordLogo,
  },
  {
    name: "UC Berkeley",
    id: 4,
    img: BerkeleyLogo,
  },
  {
    name: "UCLA",
    id: 5,
    img: UCLALogo,
  },
  {
    name: "Princeton University",
    id: 6,
    img: PrincetonLogo,
  },
];

export function LogoCarouselDemo() {
  // Generate a random key to force re-rendering with new random order
  const [randomKey, setRandomKey] = useState<string>("");
  
  useEffect(() => {
    // Generate a random key on component mount
    setRandomKey(`random-${Math.random().toString(36).substring(2, 9)}`);
  }, []);

  return (
    <div className="space-y-8 py-24">
      <div className="mx-auto flex w-full max-w-screen-lg flex-col items-center space-y-8">
        <div className="text-center">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black pb-3">
            The secret weapon of top-performing university students
          </h3>
        </div>

        <LogoCarousel key={randomKey} columnCount={3} logos={allLogos} /> 
      </div>
    </div>
  );
}
