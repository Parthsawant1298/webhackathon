# SupplyMind - Raw Materials Marketplace

A comprehensive B2B marketplace for raw materials connecting suppliers and vendors.

## 🚀 Features

- **User Authentication**: Secure login/register for vendors and suppliers
- **Product Management**: Add, edit, and manage raw materials
- **Shopping Cart**: Add items to cart with quantity management
- **Order Processing**: Complete order workflow with payment integration
- **Review System**: Rate and review products
- **Analytics Dashboard**: Supplier analytics and insights
- **Responsive Design**: Mobile-first approach with modern UI

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: Custom JWT-based auth with cookies
- **Payments**: Razorpay integration
- **File Upload**: Cloudinary
- **Styling**: Tailwind CSS with Framer Motion
- **Database**: MongoDB with Mongoose ODM

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB database
- Cloudinary account (for image uploads)
- Razorpay account (for payments)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd webhackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/supplymind
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-here
   NEXTAUTH_SECRET=your-nextauth-secret-here
   NEXTAUTH_URL=http://localhost:3000
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Razorpay Configuration
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-secret
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   
   # Application Configuration
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

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
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Recent Updates

- **v1.0.0**: Initial release with core features
- **v1.1.0**: Added review system and analytics
- **v1.2.0**: Performance optimizations and security improvements
