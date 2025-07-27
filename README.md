# SupplyMind - AI-Powered Raw Material Marketplace for Street Vendors

![SupplyMind Logo](./public/logo.jpg)

SupplyMind is a revolutionary B2B marketplace platform that connects street vendors with raw material suppliers across India. Built with cutting-edge AI technology and a focus on empowering the informal economy, SupplyMind offers intelligent recommendations, anonymous trading, and a comprehensive zero-waste ecosystem.

## 🌟 Key Features

### For Street Vendors (Buyers)
- **AI-Powered Recommendations**: Smart algorithms match vendors with the best suppliers based on location, price, and quality
- **Anonymous Trading**: Protect vendor identity while maintaining transaction transparency
- **Bulk Purchasing**: Access wholesale prices through aggregated buying power
- **Real-time Inventory Management**: AI-powered scanning and inventory tracking
- **Surplus Buyback Program**: Zero-waste guarantee with automatic surplus repurchasing

### For Suppliers
- **Direct Market Access**: Connect with thousands of street vendors across India
- **Analytics Dashboard**: Track sales, performance metrics, and market trends
- **Order Management**: Streamlined order processing and fulfillment
- **Profile Management**: Showcase products and build supplier reputation
- **Payment Integration**: Secure payment processing with Razorpay

### AI Features
- **Intelligent Product Matching**: AI-driven recommendations based on vendor needs
- **Price Optimization**: Dynamic pricing suggestions for competitive advantage
- **Demand Forecasting**: Predict market trends and optimize inventory
- **Quality Scoring**: AI-based supplier and product quality assessment

## 🚀 Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Modern React with concurrent features
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, customizable icons

### Backend
- **Next.js API Routes** - Full-stack API development
- **MongoDB** - NoSQL database for scalable data storage
- **Mongoose** - Object modeling for MongoDB
- **JWT Authentication** - Secure user authentication
- **Cloudinary** - Image storage and optimization

### AI & Machine Learning
- **Google Generative AI** - Advanced AI recommendations
- **Custom AI Algorithm** - Intelligent product matching and scoring

### Payment & Infrastructure
- **Razorpay** - Payment gateway integration
- **bcryptjs** - Password hashing and security
- **Nodemailer** - Email notifications and communication

## 📁 Project Structure

```
├── app/                      # Next.js 15 App Router
│   ├── api/                  # API routes
│   │   ├── ai/              # AI recommendation endpoints
│   │   ├── auth/            # Authentication routes
│   │   ├── cart/            # Shopping cart API
│   │   ├── order/           # Order management
│   │   ├── payment/         # Payment processing
│   │   └── rawmaterials/    # Product catalog
│   ├── ai-recommend/         # AI recommendation page
│   ├── cart/                # Shopping cart interface
│   ├── supplier/            # Supplier dashboard
│   └── ...                  # Other pages
├── components/              # Reusable React components
├── lib/                     # Utility libraries
├── models/                  # MongoDB data models
├── public/                  # Static assets
└── scripts/                 # Database seeding scripts
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Cloudinary account
- Razorpay account
- Google AI API key

### Environment Variables
Create a `.env.local` file with the following variables:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key
NEXTAUTH_SECRET=your_nextauth_secret

# AI
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Payment
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Email
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd webhackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Core Features Overview

### AI Recommendation Engine
The heart of SupplyMind is its AI-powered recommendation system that:
- Analyzes vendor purchase history and preferences
- Considers geographic proximity for faster delivery
- Evaluates supplier reliability and quality ratings
- Provides real-time price comparisons
- Suggests alternatives and bulk purchase opportunities

### Anonymous Marketplace
Protecting vendor privacy while maintaining transaction integrity:
- Anonymous buyer profiles
- Encrypted transaction data
- Identity protection protocols
- Secure communication channels

### Zero-Waste Ecosystem
Comprehensive surplus management:
- Automatic surplus detection
- Buyback guarantee program
- Redistribution network
- Waste reduction analytics

## 📊 Database Schema

### Core Models
- **User**: Street vendor profiles and authentication
- **Supplier**: Raw material supplier information
- **RawMaterial**: Product catalog with pricing and availability
- **Order**: Transaction records and order management
- **Cart**: Shopping cart functionality
- **Review**: Product and supplier reviews
- **Surplus**: Surplus inventory management

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Data Encryption**: Sensitive data protection
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API abuse prevention
- **CORS Configuration**: Cross-origin request security

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### AI Recommendations
- `POST /api/ai/recommend` - Get AI-powered product recommendations

### Raw Materials
- `GET /api/rawmaterials/available` - Fetch available products
- `GET /api/rawmaterials/[id]` - Get product details
- `POST /api/rawmaterials/[id]/reviews` - Add product review

### Cart & Orders
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `POST /api/order` - Create new order
- `GET /api/order/history` - Get order history

## 🎨 Design System

### Color Palette
- **Primary Green**: `#347433` - Main brand color
- **Dark Green**: `#2d5f2d` - Hover states and accents
- **Light Green**: `#7dd87e` - Success states and highlights
- **Background**: `#f0f9f0` - Light green backgrounds

### Typography
- **Primary Font**: System fonts with Poppins fallback
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliant color contrasts

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
- Configure production environment variables
- Set up MongoDB Atlas for production database
- Configure Cloudinary for image hosting
- Set up Razorpay for payment processing

## 📈 Analytics & Monitoring

- **User Analytics**: Track vendor engagement and purchasing patterns
- **Supplier Metrics**: Monitor supplier performance and satisfaction
- **AI Performance**: Measure recommendation accuracy and user adoption
- **Business Intelligence**: Market trends and demand forecasting

## 📁 Project Structure

```
webhackathon/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── supplier/          # Supplier dashboard
│   └── ...                # Other pages
├── components/            # Reusable React components
├── lib/                   # Utility libraries
├── models/                # Mongoose models
├── middleware.js          # Next.js middleware
└── public/               # Static assets
```

## 🔐 Authentication

The application uses a custom JWT-based authentication system:

- **Vendors**: Regular users who can browse and purchase materials
- **Suppliers**: Business users who can list and manage materials

### User Types:
- **Vendors**: Access to browse, cart, and purchase
- **Suppliers**: Access to dashboard, analytics, and material management

## 🛒 Core Features

### For Vendors:
- Browse raw materials by category
- Add items to cart
- Complete checkout process
- View order history
- Rate and review products

### For Suppliers:
- Add/edit raw materials
- View analytics dashboard
- Manage orders
- Upload product images
- Track sales performance

## 🚨 Security Features

- HTTP-only cookies for session management
- Input validation and sanitization
- CSRF protection
- Rate limiting on API routes
- Secure password hashing with bcrypt
- Environment variable protection

## �� Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 🐛 Common Issues & Solutions

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in environment variables
- Verify network connectivity

### Image Upload Issues
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper file formats

### Payment Issues
- Verify Razorpay credentials
- Check webhook configurations
- Ensure proper SSL in production

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Product Endpoints
- `GET /api/rawmaterials/available` - Get all available materials
- `GET /api/rawmaterials/[id]` - Get specific material
- `POST /api/rawmaterials` - Add new material (supplier only)

### Cart Endpoints
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart` - Update cart item
- `DELETE /api/cart` - Remove item from cart

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

- **Website**: [SupplyMind Platform](http://localhost:3000)
- **Email**: support@supplymind.com
- **Documentation**: [API Documentation](http://localhost:3000/api-docs)

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core marketplace functionality
- ✅ AI recommendation engine
- ✅ User authentication system
- ✅ Payment integration

### Phase 2 (Upcoming)
- 📱 Mobile application
- 🌐 Multi-language support
- 📊 Advanced analytics dashboard
- 🚚 Logistics integration

### Phase 3 (Future)
- 🤖 Computer vision for inventory scanning
- 🌍 International expansion
- 🏦 Financial services integration
- 📈 Predictive analytics

## 🧪 Testing & Development

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 🐛 Common Issues & Solutions

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in environment variables
- Verify network connectivity

### AI Recommendation Issues
- Verify Google AI API key
- Check API rate limits
- Ensure proper data formatting

### Image Upload Issues
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper file formats

### Payment Issues
- Verify Razorpay credentials
- Check webhook configurations
- Ensure proper SSL in production

## 🚀 Performance Optimizations

- **Image Optimization**: Next.js Image component with Cloudinary
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: Server-side caching with MongoDB indexing
- **Lazy Loading**: Component-level lazy loading
- **Compression**: Gzip compression for static assets

---

**Built with ❤️ for India's street vendors** - Empowering the informal economy through technology.
