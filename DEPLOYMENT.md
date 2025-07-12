# 🚀 Deployment Checklist

## Pre-deployment

- [ ] MongoDB Atlas cluster setup và test connection
- [ ] Environment variables được cấu hình đúng
- [ ] Code đã được test local hoàn chỉnh
- [ ] All files committed to git

## Vercel Setup

- [ ] Account Vercel được tạo và linked với GitHub
- [ ] Repository pushed lên GitHub
- [ ] Import project từ GitHub vào Vercel

## Environment Variables (Vercel Dashboard)

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
ADMIN_USERNAME=admin  
ADMIN_PASSWORD=your-secure-password
NODE_ENV=production
```

## Post-deployment Testing

- [ ] Homepage loads: `https://your-app.vercel.app`
- [ ] Admin panel works: `https://your-app.vercel.app/admin`
- [ ] Can create teams in admin
- [ ] Voting flow works end-to-end
- [ ] QR codes generate correctly
- [ ] Session tracking prevents reload spam
- [ ] Results page shows real-time updates
- [ ] Socket.IO connections work
- [ ] Rate limiting functions
- [ ] Mobile responsive

## Production Notes

- Vercel có giới hạn 10-second timeout cho serverless functions
- Socket.IO sẽ fallback to HTTP polling nếu WebSocket fail
- MongoDB Atlas M0 (free) có giới hạn 512MB storage
- Rate limiting: 10 votes/minute/IP
- Session cleanup: giữ 1000 sessions gần nhất

## Troubleshooting

### Common Issues:
1. **503 Error**: Check environment variables
2. **Database connection fails**: Verify MongoDB URI và whitelist IPs
3. **Socket.IO không connect**: Normal, sẽ fallback HTTP polling
4. **Admin login fails**: Check ADMIN_USERNAME/PASSWORD

### Debug Commands:
```bash
# Test local
npm start

# Check logs in Vercel
vercel logs your-deployment-url
```

## Performance Optimization

- [ ] Enable gzip compression (automatic trên Vercel)
- [ ] CDN cho static assets (automatic)
- [ ] Database indexes được tạo đúng
- [ ] Rate limiting configured
- [ ] Session cleanup working
