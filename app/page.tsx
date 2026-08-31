import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Gallery from '@/components/Gallery';
import Testimonials from '@/components/Testimonials';
import Location from '@/components/Location';
import Footer from '@/components/Footer';

/**
 * The landing page: one scrolling document with anchored sections. A local
 * service business lives or dies on how fast a visitor can find the phone
 * number, so everything is on one page and the number is never more than a
 * scroll away.
 */
export default function Page() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Services />
        <Gallery />
        <Testimonials />
        <Location />
      </main>
      <Footer />
    </>
  );
}
