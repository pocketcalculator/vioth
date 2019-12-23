exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://vioth-test-dbuser:Gs38*f9d8&4LVi5J@ds357708.mlab.com:57708/pocketcalculator-vioth-test'
/*
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/vioth'
*/
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://vioth-dbuser:8Rb4ZVBDbnq5@ds261838.mlab.com:61838/pocketcalculator-vioth'
exports.PORT = process.env.PORT || 8080
exports.JWT_SECRET = process.env.JWT_SECRET || 'stereo2go'
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d'