import React from 'react';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Hero from '../components/Hero';
import PageSections from '../components/PageSections';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="bg-background text-text min-h-screen relative overflow-x-hidden selection:bg-accent/30 selection:text-white">
      <SEO />
      <Header />
      <main id="main-content">
        <Hero />
        <PageSections />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
