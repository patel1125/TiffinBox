require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuCategory = require('./models/MenuCategory');
const MenuItem = require('./models/MenuItem');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB for seeding...');

    const hashedPassword = await bcrypt.hash('password123', 10);
    let owner = await User.findOne({ email: 'owner@tiffinbox.com' });
    if (!owner) {
      owner = await User.create({
        name: 'Demo Owner',
        email: 'owner@tiffinbox.com',
        password: hashedPassword,
        role: 'restaurantOwner',
      });
      console.log('Created demo owner: owner@tiffinbox.com / password123');
    }

    let admin = await User.findOne({ email: 'admin@tiffinbox.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Demo Admin',
        email: 'admin@tiffinbox.com',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Created demo admin: admin@tiffinbox.com / password123');
    }

    const restaurantsData = [
      {
        restaurantName: 'Gujarati Rasoi',
        description: 'Authentic Gujarati thali and snacks',
        cuisineType: ['Gujarati', 'Vegetarian'],
        address: 'Ahmedabad, Gujarat',
        openingTime: '10:00 AM',
        closingTime: '10:00 PM',
        rating: 4.5,
        menuItems: [
          { itemName: 'Gujarati Thali', description: 'Full thali with rotli, dal, sabzi, rice', price: 220, preparationTime: 20 },
          { itemName: 'Khaman Dhokla', description: 'Steamed spongy gram-flour snack', price: 80, preparationTime: 10 },
        ],
      },
      {
        restaurantName: 'Punjab Da Dhaba',
        description: 'North Indian comfort food',
        cuisineType: ['Punjabi', 'North Indian'],
        address: 'Surat, Gujarat',
        openingTime: '11:00 AM',
        closingTime: '11:00 PM',
        rating: 4.2,
        menuItems: [
          { itemName: 'Paneer Butter Masala', description: 'Rich tomato curry with paneer', price: 220, preparationTime: 20 },
          { itemName: 'Dal Makhani', description: 'Creamy black lentils', price: 180, preparationTime: 25 },
        ],
      },
      {
        restaurantName: 'Udupi Breakfast House', description: 'Classic South Indian breakfast and filter coffee', cuisineType: ['South Indian', 'Vegetarian'], address: 'Bengaluru, Karnataka', openingTime: '7:00 AM', closingTime: '10:00 PM', rating: 4.6,
        menuItems: [
          { itemName: 'Masala Dosa', description: 'Crisp dosa filled with potato masala', price: 110, preparationTime: 12 },
          { itemName: 'Idli Vada Combo', description: 'Steamed idlis and vada with sambar', price: 90, preparationTime: 10 },
        ],
      },
      {
        restaurantName: 'Bengal Bhoj', description: 'Traditional Bengali home-style dishes', cuisineType: ['Bengali', 'Seafood'], address: 'Kolkata, West Bengal', openingTime: '11:00 AM', closingTime: '10:30 PM', rating: 4.4,
        menuItems: [
          { itemName: 'Kosha Mangsho', description: 'Slow-cooked Bengali mutton curry', price: 360, preparationTime: 30 },
          { itemName: 'Shorshe Ilish', description: 'Hilsa fish in mustard gravy', price: 420, preparationTime: 25 },
        ],
      },
      {
        restaurantName: 'Konkan Coast Kitchen', description: 'Coastal Maharashtrian seafood and curries', cuisineType: ['Maharashtrian', 'Seafood'], address: 'Mumbai, Maharashtra', openingTime: '12:00 PM', closingTime: '11:00 PM', rating: 4.5,
        menuItems: [
          { itemName: 'Bombil Fry', description: 'Crisp Bombay duck fry with spices', price: 280, preparationTime: 20 },
          { itemName: 'Konkani Fish Curry', description: 'Coconut-based fish curry with rice', price: 320, preparationTime: 25 },
        ],
      },
      {
        restaurantName: 'Rajasthani Thali Ghar', description: 'Hearty Rajasthani thalis and snacks', cuisineType: ['Rajasthani', 'Vegetarian'], address: 'Jaipur, Rajasthan', openingTime: '11:00 AM', closingTime: '10:00 PM', rating: 4.3,
        menuItems: [
          { itemName: 'Dal Baati Churma', description: 'Baked baati with dal and sweet churma', price: 250, preparationTime: 25 },
          { itemName: 'Gatte Ki Sabzi', description: 'Gram flour dumplings in spiced yogurt curry', price: 190, preparationTime: 20 },
        ],
      },
      {
        restaurantName: 'Nawabi Awadh Kitchen', description: 'Slow-cooked Lucknowi kebabs and biryanis', cuisineType: ['Awadhi', 'North Indian'], address: 'Lucknow, Uttar Pradesh', openingTime: '12:00 PM', closingTime: '11:30 PM', rating: 4.7,
        menuItems: [
          { itemName: 'Galawati Kebab', description: 'Melt-in-the-mouth minced lamb kebabs', price: 340, preparationTime: 20 },
          { itemName: 'Lucknowi Biryani', description: 'Fragrant rice with tender chicken', price: 320, preparationTime: 30 },
        ],
      },
      {
        restaurantName: 'Chettinad Spice Route', description: 'Bold and aromatic Tamil Chettinad cuisine', cuisineType: ['Chettinad', 'South Indian'], address: 'Chennai, Tamil Nadu', openingTime: '11:30 AM', closingTime: '10:30 PM', rating: 4.5,
        menuItems: [
          { itemName: 'Chettinad Chicken', description: 'Chicken curry with roasted spices', price: 300, preparationTime: 25 },
          { itemName: 'Vegetable Kothu Parotta', description: 'Shredded parotta tossed with vegetables', price: 180, preparationTime: 15 },
        ],
      },
      {
        restaurantName: 'Hyderabad Biryani Junction', description: 'Dum biryani, kebabs and Irani chai', cuisineType: ['Hyderabadi', 'Biryani'], address: 'Hyderabad, Telangana', openingTime: '11:00 AM', closingTime: '11:30 PM', rating: 4.6,
        menuItems: [
          { itemName: 'Hyderabadi Chicken Biryani', description: 'Dum-cooked basmati rice and chicken', price: 290, preparationTime: 30 },
          { itemName: 'Mirchi Ka Salan', description: 'Spicy chili curry with sesame and peanut', price: 160, preparationTime: 18 },
        ],
      },
      {
        restaurantName: 'Malabar Tiffin Room', description: 'Kerala favourites with coastal flavours', cuisineType: ['Kerala', 'South Indian'], address: 'Kochi, Kerala', openingTime: '8:00 AM', closingTime: '10:30 PM', rating: 4.6,
        menuItems: [
          { itemName: 'Kerala Parotta and Beef Curry', description: 'Layered parotta with slow-cooked curry', price: 260, preparationTime: 25 },
          { itemName: 'Appam with Vegetable Stew', description: 'Soft appam and coconut vegetable stew', price: 180, preparationTime: 18 },
        ],
      },
      {
        restaurantName: 'Kashmir Valley Cafe', description: 'Wazwan-inspired Kashmiri comfort food', cuisineType: ['Kashmiri', 'North Indian'], address: 'Srinagar, Jammu and Kashmir', openingTime: '11:00 AM', closingTime: '10:00 PM', rating: 4.4,
        menuItems: [
          { itemName: 'Rogan Josh', description: 'Aromatic Kashmiri lamb curry', price: 380, preparationTime: 30 },
          { itemName: 'Dum Aloo Kashmiri', description: 'Baby potatoes in a rich yogurt gravy', price: 220, preparationTime: 20 },
        ],
      },
      {
        restaurantName: 'Amritsari Kulcha Corner', description: 'Fresh stuffed kulchas and Punjabi classics', cuisineType: ['Punjabi', 'Vegetarian'], address: 'Amritsar, Punjab', openingTime: '8:00 AM', closingTime: '10:00 PM', rating: 4.5,
        menuItems: [
          { itemName: 'Amritsari Aloo Kulcha', description: 'Stuffed kulcha with chole and chutney', price: 150, preparationTime: 15 },
          { itemName: 'Chole Bhature', description: 'Spiced chickpeas with fluffy bhature', price: 170, preparationTime: 18 },
        ],
      },
      {
        restaurantName: 'Goan Beach Shack', description: 'Goan curries, grilled fish and coastal bites', cuisineType: ['Goan', 'Seafood'], address: 'Panaji, Goa', openingTime: '12:00 PM', closingTime: '11:00 PM', rating: 4.3,
        menuItems: [
          { itemName: 'Goan Fish Curry Rice', description: 'Tangy coconut fish curry with steamed rice', price: 310, preparationTime: 25 },
          { itemName: 'Prawn Balchao', description: 'Prawns in a fiery Goan pickle-style sauce', price: 360, preparationTime: 22 },
        ],
      },
      {
        restaurantName: 'Bihari Litti Kitchen', description: 'Rustic Bihari comfort food and mithai', cuisineType: ['Bihari', 'Vegetarian'], address: 'Patna, Bihar', openingTime: '10:00 AM', closingTime: '9:30 PM', rating: 4.2,
        menuItems: [
          { itemName: 'Litti Chokha', description: 'Roasted wheat balls with smoky mashed vegetables', price: 140, preparationTime: 20 },
          { itemName: 'Sattu Paratha', description: 'Stuffed flatbread served with pickle', price: 120, preparationTime: 15 },
        ],
      },
      {
        restaurantName: 'Northeast Bamboo Kitchen', description: 'Comfort food from Assam and the Northeast', cuisineType: ['Northeast Indian', 'Asian'], address: 'Guwahati, Assam', openingTime: '11:00 AM', closingTime: '10:00 PM', rating: 4.3,
        menuItems: [
          { itemName: 'Assamese Fish Tenga', description: 'Light tangy fish curry with tomatoes', price: 280, preparationTime: 22 },
          { itemName: 'Bamboo Shoot Pork', description: 'Pork cooked with fermented bamboo shoot', price: 340, preparationTime: 30 },
        ],
      },
      {
        restaurantName: 'Indore Poha and Chaat', description: 'Indore street-food favourites all day', cuisineType: ['Madhya Pradesh', 'Street Food'], address: 'Indore, Madhya Pradesh', openingTime: '7:00 AM', closingTime: '10:00 PM', rating: 4.4,
        menuItems: [
          { itemName: 'Indori Poha Jalebi', description: 'Spiced poha served with crisp jalebi', price: 90, preparationTime: 10 },
          { itemName: 'Bhutte Ka Kees', description: 'Creamy grated corn snack with spices', price: 130, preparationTime: 15 },
        ],
      },
      {
        restaurantName: 'Odisha Pakhala House', description: 'Traditional Odia rice dishes and curries', cuisineType: ['Odia', 'Seafood'], address: 'Bhubaneswar, Odisha', openingTime: '11:00 AM', closingTime: '9:30 PM', rating: 4.2,
        menuItems: [
          { itemName: 'Pakhala Bhata', description: 'Fermented rice with seasonal accompaniments', price: 160, preparationTime: 15 },
          { itemName: 'Macha Besara', description: 'Fish curry with a mustard paste', price: 270, preparationTime: 22 },
        ],
      },
    ];

    for (const r of restaurantsData) {
      let restaurant = await Restaurant.findOne({ restaurantName: r.restaurantName });
      if (!restaurant) {
        restaurant = await Restaurant.create({
          restaurantName: r.restaurantName,
          description: r.description,
          cuisineType: r.cuisineType,
          address: r.address,
          openingTime: r.openingTime,
          closingTime: r.closingTime,
          rating: r.rating,
          ownerId: owner._id,
        });
        console.log(`Created restaurant: ${restaurant.restaurantName}`);

        const category = await MenuCategory.create({
          restaurantId: restaurant._id,
          categoryName: 'Main Course',
        });

        for (const item of r.menuItems) {
          await MenuItem.create({
            restaurantId: restaurant._id,
            categoryId: category._id,
            itemName: item.itemName,
            description: item.description,
            price: item.price,
            isAvailable: true,
            preparationTime: item.preparationTime,
          });
        }
      } else {
        console.log(`Skipped (already exists): ${r.restaurantName}`);
      }
    }

    console.log('Seeding complete! Refresh your frontend to see the restaurants.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
