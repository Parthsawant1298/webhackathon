import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import WhyChooseUs from '@/components/Whychoose';
import Pricing from '@/components/Pricing';
import Lowerfooter from '@/components/Lowerfooter';
import Partner from '@/components/Partner';
import NewArrivals from '@/components/NewArrivals';
import TopRawMaterials from '@/components/TopRawMaterials';
import Gallery from '@/components/Gallary';
import Services from '@/components/Services';
import Testimonials from '@/components/Testimonial';
export default function page(){
  return(
    <main>
      <Header />
      <Hero />
      <Stats />
      <NewArrivals />
      <TopRawMaterials />
      <WhyChooseUs />
       <Services />
       <Partner />
        <Pricing />
       <Lowerfooter />
      <Testimonials/>
      <Gallery/>
      <Footer />
    </main>
  );
}
      