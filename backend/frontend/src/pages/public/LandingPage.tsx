import React, { useState, useEffect } from 'react';

import Navbar from './Navbar';
import Hero from './Hero';
import Feature from './Feature';
import Testimonials from './Testimonials';
import Usecase from './Usecase';
import FAQSection from './FAQSection';
import Cta from './Cta';
import Contact from './Contact';
import Footer from './Footer';
import Home from './Home';
import Integration from './integration';
// import Footer from './Footer';
import ScrollProgressBar from '../../components/common/ScrollProgressBar';
import Pricing from './Pricing';


const LandingPage = () => {
  return (<>

    <ScrollProgressBar />
    <div className="relative min-h-screen bg-white dark:bg-gray-950 text-foreground transition-colors duration-500">
      {/* Navigation */}
      <Navbar />
      {/* Hero Section with Animated Chatbot */}
      <section id='#' className="px-4   sm:px-6 lg:px-8 ">
        {/* <Home/>    */}
        <Hero />
      </section>
      {/* Features Section */}
      <section id="features" className=" py-20 bg-gray-50 dark:bg-black">
        <Feature />
      </section>
      <section id="integration" className="">
        <Integration />
      </section>
      {/* Use Cases Section */}
      <section id="use-cases" className="bg-gray-50 dark:bg-black ">
        <Usecase />
      </section>
      {/* FAQ Section */}
      <section id="faq" className=' '>
        <FAQSection />
      </section>
      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50 dark:bg-black   ">
        <Testimonials />
      </section>
      {/* Pricing */}
      <section id="pricing" className="py-20 bg-background">
        <Pricing />
      </section>
      {/* contact */}
      <Contact />
      {/* CTA Section */}
      {/* <Cta /> */}
      {/* Footer */}
      <Footer />
      {/* <Demo/> */}



    </div>
  </>

  );
};

export default LandingPage;