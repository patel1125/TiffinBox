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
