"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Contect from "./_components/Contect";
import useEmblaCarousel from "embla-carousel-react";
import { FaGithub } from "react-icons/fa";

const slides = [
  {
    title: "Master Interviews with Real-time AI Coaching",
    desc: "Live body language, speech, and emotion analysis with instant feedback.",
  },
  {
    title: "Practice Across 15+ Domains",
    desc: "Technical, behavioral, HR, and case studies with adaptive difficulty.",
  },
];

export default function LandingPage() {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "start" });

  useEffect(() => {
    if (!embla) return;
    const id = setInterval(() => embla.scrollNext(), 3500);
    return () => clearInterval(id);
  }, [embla]);

  const [users, setUsers] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let u = 0,
      s = 0,
      c = 0;
    const id = setInterval(() => {
      u = Math.min(25000, u + 500);
      s = Math.min(1200000, s + 30000);
      c = Math.min(23, c + 1);
      setUsers(u);
      setSessions(s);
      setScore(c);
    }, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      {/* Header */}
      <header className="w-full py-6 bg-gray-900 text-white shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-6">
          <h1 className="text-3xl font-bold">Devgent AI</h1>
          <nav className="flex flex-col sm:flex-row items-center mt-4 md:mt-0 gap-4">
            <a href="#features">Features</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#contact">Contact</a>
            <a href="/interview-prep" className="nav-link">
              Interview Prep </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="#"
            >
              <FaGithub className="w-8 h-8" />
            </a>
          </nav>
        </div>
      </header>

      {/* Hero / Carousel Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-gray-700">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--gradient-from))_0%,transparent_50%),radial-gradient(ellipse_at_bottom_left,hsl(var(--gradient-to))_0%,transparent_50%)] opacity-20" />
        <div className="container py-16 md:py-24 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {slides.map((s, i) => (
                  <div key={i} className="min-w-0 shrink-0 basis-full pr-6">
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-4xl md:text-5xl font-bold leading-tight text-white"
                    >
                      {s.title}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="mt-4 text-lg text-gray-200"
                    >
                      {s.desc}
                    </motion.p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => embla?.scrollPrev()}>
                Prev
              </Button>
              <Button size="sm" variant="outline" onClick={() => embla?.scrollNext()}>
                Next
              </Button>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
                  Start Interview
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="h-12 px-6">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* <div className="mt-8 grid grid-cols-3 gap-6 text-center text-white">
              <Stat label="Active Users" value={users.toLocaleString()} suffix="+" />
              <Stat label="Sessions" value={Math.floor(sessions / 1000).toLocaleString()} suffix="k+" />
              <Stat label="Avg. Score↑" value={score.toString()} suffix="%" />
            </div> */}
          </div>

          {/* Live AI Analysis Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="aspect-video rounded-xl border bg-card shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20" />
              <div className="p-6">
                <h3 className="font-semibold text-white">Live AI Analysis</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Metric label="Posture" value="92%" color="text-emerald-500" />
                  <Metric label="Eye Contact" value="87%" color="text-blue-500" />
                  <Metric label="Clarity" value="90%" color="text-indigo-500" />
                  <Metric label="Confidence" value="88%" color="text-purple-500" />
                </div>
                <div className="mt-6 h-40 rounded-lg bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 border" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-100 px-6 md:px-0">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Features</h2>
          <div className="flex flex-wrap justify-center mt-8 gap-6">
            <FeatureCard title="AI Mock Interviews" desc="Experience realistic interview scenarios with our advanced AI." />
            <FeatureCard title="Instant Feedback" desc="Get instant, personalized feedback to improve your performance." />
            <FeatureCard title="Comprehensive Reports" desc="Receive detailed reports highlighting your strengths and weaknesses." />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 bg-white px-6 md:px-0">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">What Our Users Say</h2>
          <div className="flex flex-wrap justify-center mt-8 gap-6">
            <Testimonial text='"The AI mock interviews were incredibly helpful. I felt much more confident going into my real interview."' name="- Alex Johnson" />
            <Testimonial text='"The feedback was spot on and helped me improve my answers. Highly recommend this service!"' name="- Sarah Williams" />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 bg-gray-100 px-6 md:px-0">
        <Contect />
      </section>

      {/* Footer */}
      <footer className="py-8 bg-black text-white text-center">
        <p>© 2024 Devgent AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Components
function Stat({ label, value, suffix }) {
  const out = useMemo(() => `${value}${suffix ?? ""}`, [value, suffix]);
  return (
    <div>
      <div className="text-2xl font-bold">{out}</div>
      <div className="text-xs text-gray-300">{label}</div>
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-red-9000/20 px-3 py-2">
      <span className="text-black-200">{label}</span>
      <span className={"font-semibold " + color}>{value}</span>
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="w-full md:w-1/3 bg-blue-100 rounded-lg p-6 shadow-md">
      <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-700">{desc}</p>
    </div>
  );
}

function Testimonial({ text, name }) {
  return (
    <div className="w-full md:w-1/2 bg-white rounded-lg p-6 shadow-md">
      <p className="text-gray-600">{text}</p>
      <h4 className="mt-4 text-lg font-semibold text-blue-600">{name}</h4>
    </div>
  );
}
