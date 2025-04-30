import React from 'react';
export function TestimonialCarousel() {
  const testimonials = [{
    id: 1,
    text: 'Beesides has transformed how I discover and catalog music. The community here is incredible!',
    author: 'David Chen',
    role: 'Music Producer'
  }, {
    id: 2,
    text: 'Finally, a platform that understands both casual listeners and audiophiles alike.',
    author: 'Maria Garcia',
    role: 'Playlist Curator'
  }];
  return <div className="bg-gray-50 p-8 rounded-2xl">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-8">What Our Community Says</h2>
        <div className="space-y-8">
          {testimonials.map(testimonial => <div key={testimonial.id}>
              <p className="text-lg mb-4">"{testimonial.text}"</p>
              <div>
                <p className="font-bold">{testimonial.author}</p>
                <p className="text-sm opacity-70">{testimonial.role}</p>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
}