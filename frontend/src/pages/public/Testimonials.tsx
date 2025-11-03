import { Star, TestTubeIcon } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Laxminarsimhan from '../../../public/Laxminarsimhan.jpg'
import Anurag from '../../../public/Anurag.jpeg'
import Ravipraksh from '../../../public/Ravipraksh.jpeg'
import Amit from '../../../public/Amit .jpeg'

const testimonials = [
  {
    name: "Shri Lakshminarasimhan",
    role: "Executive Officer",
    company: "Samskrit Promotion Foundation",
    content: "Seamless multilingual Sanskrit learning platform with enhanced student engagement.",
    avatar: Laxminarsimhan,
    rating: 5,
  },
  {
    name: "Amit Kumar Tiwari",
    role: "CTO",
    company: "OCIO Technology Pvt. Ltd.",
    content: "Streamlined multilingual customer support with improved efficiency and satisfaction.",
    avatar: Amit,
    rating: 5,
  },
  {
    name: "Ravi Prakash",
    role: "CEO",
    company: "Branding Spoon",
    content: "Natural Hindi voice responses made our platform accessible to regional audiences.",
    avatar: Ravipraksh,
    rating: 5,
  },
  {
    name: "Anurag Bishwas",
    role: "CEO",
    company: "Xhadow Media Pvt. Ltd.",
    content: "Tamil and Gujarati support delivered inclusive healthcare communication effortlessly.",
    avatar: Anurag,
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 bg-card rounded-full px-4 py-2 mb-6 shadow-sm border border-border">
          <TestTubeIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-[#e1802be0]">Reviews</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
          Trusted by India's <br />
          <span className='text-[#e1802be0]'>Leading Businesses</span>
        </h2>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          See why top companies rely on JetHat AI to elevate their customer engagement.
        </p>
      </div>

      {/* Swiper Carousel */}
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={24}
        navigation={false}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="pb-8"
      >
        {testimonials.map((testimonial, index) => (
          <SwiperSlide key={index}>
            <div className="bg-card dark:bg-black/80 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-border h-full">
              {/* Rating Stars */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Content */}
              <p className="text-muted-foreground mb-6 italic leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author Info */}
              <div className="flex items-center space-x-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-border"
                />
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-[#e1802be0] font-medium">
                    {testimonial.role}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Testimonials;