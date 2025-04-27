import React from 'react';

const FAQPage: React.FC = () => {
  const faqs = [
    {
      question: 'What is Ashabot?',
      answer: 'Ashabot is an AI-powered platform designed to assist users with career guidance, job searching, interview preparation, and skill development.',
    },
    {
      question: 'How does the AI work?',
      answer: 'Our AI analyzes your profile, preferences, and career goals to provide personalized recommendations, insights, and resources.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we prioritize user privacy and data security. All personal information is encrypted and handled according to strict privacy policies.',
    },
    {
      question: 'How can I get started?',
      answer: 'Simply sign up for an account, complete your profile, and start exploring the features. The AI will guide you based on your inputs.',
    },
    {
        question: 'What resources are available?',
        answer: 'We offer resume templates, interview preparation guides, salary negotiation tips, career path guides, and industry insights, among other resources.'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions (FAQs)</h1>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{faq.question}</h2>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage; 