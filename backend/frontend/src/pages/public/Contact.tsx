import { Mail, Phone, MapPin, MessageCircle, Clock, Send, CheckCircle, AlertCircle, Zap, Shield, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState } from 'react'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  inquiry_type: string
}

const Contact = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiry_type: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        setSubmitMessage(result.message)
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          inquiry_type: ''
        })
      } else {
        setSubmitStatus('error')
        setSubmitMessage(result.message || 'Failed to send message. Please try again.')
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Email Us",
      details: "ai@jethat.in",
      description: "Get in touch for support and inquiries"
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Call Us",
      details: "+91-120 4188947",
      description: "Mon-Fri 9AM-6PM IST"
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Visit Us",
      details: " Noida, Uttar Pradesh - 201304 IN",
      description: "Building the future of AI in India"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Response Time",
      details: "< 24 Hours",
      description: "We respond to all inquiries quickly"
    }
  ]

  return (
    <div className="mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center space-x-2 bg-card rounded-full px-4 py-2 mb-6 shadow-sm border border-border">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-[#e1802be0]">Get In Touch</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
          Let's Build Something <br /> <span className="text-[#e1802be0]">Amazing Together</span>
        </h2>

        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          We're here to help you succeed. Whether you need technical support, want to explore our features, or discuss a custom solution.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-16 '>
        {/* Contact Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-card rounded-xl p-8 mb-16 border border-border shadow-elegant"
        >
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
            Send Us a Message
          </h3>
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800">{submitMessage}</p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{submitMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-2">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#e1802be0] transition-all duration-300"
                placeholder="Your Name"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#e1802be0] transition-all duration-300"
                placeholder="your.email@example.com"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-muted-foreground mb-2">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#e1802be0] transition-all duration-300"
                placeholder="Inquiry Subject"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="inquiry_type" className="block text-sm font-medium text-muted-foreground mb-2">Type of Inquiry</label>
              <select
                id="inquiry_type"
                name="inquiry_type"
                value={formData.inquiry_type}
                onChange={handleInputChange}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#e1802be0] transition-all duration-300"
                disabled={isSubmitting}
              >
                <option value="">Select Type</option>
                <option value="support">Technical Support</option>
                <option value="sales">Sales Inquiry</option>
                <option value="partnership">Partnership Opportunities</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="message" className="block text-sm font-medium text-muted-foreground mb-2">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[#e1802be0] transition-all duration-300"
                placeholder="Tell us how we can help..."
                disabled={isSubmitting}
              ></textarea>
            </div>
            <div className="md:col-span-2 text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#e1802be0] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#d1722a] transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2 mx-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        <div>
          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                className="bg-card rounded-xl p-6 text-center shadow-elegant border border-border hover:shadow-elegant-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="w-8 h-8 mx-auto mb-4 bg-[#e1802be0] rounded-md flex items-center justify-center text-white shadow-md">
                  {info.icon}
                </div>
                <h4 className="font-bold text-sm text-foreground mb-2">{info.title}</h4>
                <p className="text-[12px] font-semibold text-[#e1802be0] mb-2">{info.details}</p>
                <p className="text-[12px] text-muted-foreground">{info.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Additional Features Section */}
          <div className="bg-gray-100 dark:bg-black rounded-2xl p-8 mb-16 border border-border">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Why Choose Us
              </h3>
              <p className="text-muted-foreground">
                Essential features that make us your perfect AI partner
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#e1802be0] rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Lightning Fast</h4>
                  <p className="text-sm text-muted-foreground">Sub-second response times</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#e1802be0] rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Secure & Private</h4>
                  <p className="text-sm text-muted-foreground">Enterprise-grade security</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#e1802be0] rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Expert Support</h4>
                  <p className="text-sm text-muted-foreground">Dedicated team to help you</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center mb-20">
        <h3 className="text-2xl font-bold text-foreground mb-4">
          Ready to Get Started?
        </h3>
        <p className="text-muted-foreground mb-6">
          Join thousands of businesses already using our AI chatbot solutions.
        </p>
        <Link
          to="/pricing"
          className="inline-flex items-center space-x-2 bg-[#e1802be0] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#d1722a] transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl"
        >
          <span>View Pricing</span>
        </Link>
      </div>
    </div>
  )
}

export default Contact;