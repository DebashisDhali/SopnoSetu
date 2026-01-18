try {
    const routes = require('./routes/notificationRoutes');
    console.log('Routes loaded successfully');
    process.exit(0);
} catch (error) {
    console.error('Routes Load Error:', error);
    process.exit(1);
}
