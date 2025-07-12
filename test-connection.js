require('dotenv').config();
const mongoose = require('mongoose');

// Test MongoDB Atlas connection
async function testConnection() {
    try {
        console.log('🔌 Đang test kết nối MongoDB Atlas...');
        console.log('Connection string:', process.env.MONGODB_URI?.replace(/:[^@]+@/, ':****@'));
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Kết nối MongoDB Atlas thành công!');
        
        // Test create a simple document
        const testSchema = new mongoose.Schema({ test: String });
        const TestModel = mongoose.model('Test', testSchema);
        
        const testDoc = new TestModel({ test: 'Hệ thống voting hoạt động!' });
        await testDoc.save();
        console.log('✅ Test ghi dữ liệu thành công!');
        
        await TestModel.deleteOne({ _id: testDoc._id });
        console.log('✅ Test xóa dữ liệu thành công!');
        
        console.log('🎉 MongoDB Atlas sẵn sàng sử dụng!');
        
    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB Atlas:');
        console.error('Error:', error.message);
        
        if (error.message.includes('authentication failed')) {
            console.log('\n💡 Giải pháp:');
            console.log('1. Kiểm tra username/password trong connection string');
            console.log('2. Đảm bảo user có quyền readWrite trên database');
            console.log('3. Kiểm tra IP whitelist trong MongoDB Atlas');
        }
        
        if (error.message.includes('ENOTFOUND')) {
            console.log('\n💡 Giải pháp:');
            console.log('1. Kiểm tra cluster URL trong connection string');
            console.log('2. Đảm bảo cluster đang hoạt động');
            console.log('3. Kiểm tra kết nối internet');
        }
        
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Đã ngắt kết nối');
    }
}

if (require.main === module) {
    testConnection();
}
