"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Play, Sparkles, Wand2, Download } from "lucide-react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { Compare } from "@/components/ui/compare";
import Image from "next/image";

export default function LandingPage() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section with CTA */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-12">

            {/* Main Headline */}
            <BlurFade delay={0} duration={0.5} inView={true}>
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                  Edit Images with
                  <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Natural Language
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Transform your photos instantly using simple text commands. 
                  No complex tools, no learning curve, just describe what you want and watch it happen.
                </p>
              </div>
            </BlurFade>

            {/* CTA Buttons */}
            <BlurFade delay={0.1} duration={0.8} inView={true}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  Start Creating Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold rounded-xl border-2 hover:bg-muted/50 transition-all duration-300"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </BlurFade>

            {/* Wireframe Preview */}
            <BlurFade delay={0.2} duration={0.5} inView={true}>
              <div className="relative max-w-5xl mx-auto pt-8">
                <MagicCard 
                  className="rounded-2xl shadow-2xl overflow-hidden"
                  gradientSize={300}
                  gradientFrom="#00FF00"
                  gradientTo="#000000"
                  gradientOpacity={0.3}
                >
                  <div className="p-4">
                    <Image 
                      src="/wireframe_1.png" 
                      alt="Uncanny Edits App Preview" 
                      width={1200}
                      height={800}
                      className="w-full h-auto rounded-xl shadow-lg"
                    />
                  </div>
                </MagicCard>
              </div>
            </BlurFade>

          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-20 px-4 lg:px-8 ">
        <div className="max-w-7xl mx-auto">
          <BlurFade delay={0} duration={0.5} inView={true}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to transform your images with AI
              </p>
            </div>
          </BlurFade>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Step 1 */}
            <BlurFade delay={0.1} duration={0.5} inView={true}>
              <MagicCard 
                className="p-8 text-center space-y-4 hover:shadow-lg transition-all duration-300 rounded-xl h-full flex flex-col"
                gradientSize={200}
                gradientFrom="#00FF00"
                gradientTo="#000000"
                gradientOpacity={0.3}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold">Upload Your Image</h3>
                <p className="text-muted-foreground">
                  Drag and drop any image file or click to browse. Supports JPG, PNG, and more formats.
                </p>
              </MagicCard>
            </BlurFade>

            {/* Step 2 */}
            <BlurFade delay={0.2} duration={0.5} inView={true}>
              <MagicCard 
                className="p-8 text-center space-y-4 hover:shadow-lg transition-all duration-300 rounded-xl h-full flex flex-col"
                gradientSize={200}
                gradientFrom="#00FF00"
                gradientTo="#000000"
                gradientOpacity={0.3}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold">Describe Your Edit</h3>
                <p className="text-muted-foreground">
                  Type what you want to change in natural language. Be as specific or creative as you like.
                </p>
              </MagicCard>
            </BlurFade>

            {/* Step 3 */}
            <BlurFade delay={0.3} duration={0.5} inView={true}>
              <MagicCard 
                className="p-8 text-center space-y-4 hover:shadow-lg transition-all duration-300 rounded-xl h-full flex flex-col"
                gradientSize={200}
                gradientFrom="#00FF00"
                gradientTo="#000000"
                gradientOpacity={0.3}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold">Download & Share</h3>
                <p className="text-muted-foreground">
                  Your edited image is ready instantly. Download in high quality or share directly.
                </p>
              </MagicCard>
            </BlurFade>
          </div>

        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <BlurFade delay={0} duration={0.5} inView={true}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                See It In Action
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Real examples of how AI transforms your images with simple text commands
              </p>
            </div>
          </BlurFade>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Use Case 1 */}
            <BlurFade delay={0.1} duration={0.5} inView={true}>
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Background Removal</h3>
                <p className="text-sm text-muted-foreground">
                  Remove unwanted backgrounds instantly
                </p>
                <MagicCard 
                  className="rounded-xl overflow-hidden"
                  gradientSize={200}
                  gradientFrom="#00FF00"
                  gradientTo="#000000"
                  gradientOpacity={0.2}
                >
                  <Compare
                    firstImage="/loading_images/g2.jpeg"
                    secondImage="/loading_images/g6.jpeg"
                    className="w-full h-[300px]"
                    autoplay={false}
                  />
                </MagicCard>
              </div>
            </BlurFade>

            {/* Use Case 2 */}
            <BlurFade delay={0.2} duration={0.5} inView={true}>
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Style Transformation</h3>
                <p className="text-sm text-muted-foreground">
                  Transform photos into artistic styles
                </p>
                <MagicCard 
                  className="rounded-xl overflow-hidden"
                  gradientSize={200}
                  gradientFrom="#00FF00"
                  gradientTo="#000000"
                  gradientOpacity={0.2}
                >
                  <Compare
                    firstImage="/loading_images/g2.jpeg"
                    secondImage="/loading_images/g5.jpeg"
                    className="w-full h-[300px]"
                    autoplay={false}
                  />
                </MagicCard>
              </div>
            </BlurFade>

            {/* Use Case 3 */}
            <BlurFade delay={0.3} duration={0.5} inView={true}>
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Object Enhancement</h3>
                <p className="text-sm text-muted-foreground">
                  Enhance and modify objects precisely
                </p>
                <MagicCard 
                  className="rounded-xl overflow-hidden"
                  gradientSize={200}
                  gradientFrom="#00FF00"
                  gradientTo="#000000"
                  gradientOpacity={0.2}
                >
                  <Compare
                    firstImage="/loading_images/g5.jpeg"
                    secondImage="/loading_images/g6.jpeg"
                    className="w-full h-[300px]"
                    autoplay={false}
                  />
                </MagicCard>
              </div>
            </BlurFade>
          </div>

          {/* Example Commands */}
          <BlurFade delay={0} duration={0.5} inView={true}>
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-semibold mb-8">Try These Commands</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {[
                  "Make the background blurry",
                  "Change the sky to sunset colors",
                  "Add a vintage film effect",
                  "Remove the person in the background",
                  "Make it look like a painting",
                  "Add dramatic lighting"
                ].map((command, index) => (
                  <BlurFade key={index} delay={0.1 + (index * 0.05)} duration={0.4} inView={true}>
                    <MagicCard 
                      className="rounded-lg p-4 text-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                      gradientSize={150}
                      gradientFrom="#00FF00"
                      gradientTo="#000000"
                      gradientOpacity={0.15}
                    >
                      &ldquo;{command}&rdquo;
                    </MagicCard>
                  </BlurFade>
                ))}
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <BlurFade delay={0} duration={0.5} inView={true}>
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Transform Your Images?
            </h2>
          </BlurFade>
          <BlurFade delay={0.1} duration={0.5} inView={true}>
            <p className="text-lg text-muted-foreground">
              Join thousands of creators who are already using AI to bring their vision to life
            </p>
          </BlurFade>
          <BlurFade delay={0.2} duration={0.8} inView={true}>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Wand2 className="w-6 h-6 mr-3" />
              Start Creating Now
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </BlurFade>
        </div>
      </section>
    </div>
  );
}
