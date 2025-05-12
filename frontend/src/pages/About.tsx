import React from 'react';

function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">About VBP</h1>
        <p className="text-xl text-gray-600">Leading the way in professional excellence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        <div>
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
            alt="Team collaboration"
            className="rounded-lg shadow-lg"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Founded in 2024, VBP has grown from a small startup to a leading provider of professional services. 
            Our commitment to excellence and innovation has helped us build lasting relationships with clients 
            across various industries.
          </p>
          <p className="text-gray-600">
            We believe in the power of technology and human expertise working together to solve complex 
            business challenges and drive meaningful results for our clients.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-3">Our Mission</h3>
          <p className="text-gray-600">
            To empower businesses with innovative solutions that drive growth and success in the digital age.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-3">Our Vision</h3>
          <p className="text-gray-600">
            To be the global leader in delivering transformative business solutions that create lasting value.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-3">Our Values</h3>
          <p className="text-gray-600">
            Integrity, innovation, excellence, and commitment to our clients' success guide everything we do.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;