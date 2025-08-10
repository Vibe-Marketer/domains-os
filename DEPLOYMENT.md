# Deploying Domain OS to Railway

## Quick Deploy

1. **Create Railway Account**: Go to [railway.app](https://railway.app) and sign up

2. **Connect GitHub**: Link your GitHub account to Railway

3. **Push Code to GitHub**: 
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

4. **Deploy on Railway**:
   - Click "New Project" on Railway dashboard
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect and deploy

## Environment Variables

Set these in Railway dashboard under Variables:

### Database (Required)
```
DATABASE_URL=your_neon_or_railway_postgres_url
```

### API Keys (Required for functionality)
```
GODADDY_API_KEY=your_godaddy_api_key
GODADDY_API_SECRET=your_godaddy_api_secret
NAMECHEAP_API_KEY=your_namecheap_api_key
NAMECHEAP_USERNAME=your_namecheap_username
DYNADOT_API_TOKEN=your_dynadot_api_token
```

### PostgreSQL Setup
```
PGHOST=your_db_host
PGPORT=5432
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGDATABASE=your_db_name
```

## Static IP Address

**Railway provides static IP addresses for all deployments!** This solves the IP whitelisting issue.

After deployment:
1. Check your app logs to see the static IP address
2. Add that IP to your registrar API whitelists:
   - Dynadot: Account → API Settings → IP Whitelist
   - Namecheap: Profile → Tools → Namecheap API Access → Whitelisted IPs
   - GoDaddy: No IP whitelisting needed

## Custom Domain (Optional)

1. Go to Railway project settings
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate will be automatically provisioned

## Database Migration

After deployment, run:
```bash
npm run db:push
```

This will create all necessary tables in your production database.

## Cost

Railway offers:
- **Free tier**: $0/month with usage limits
- **Pro plan**: $20/month with generous limits
- **Pay-as-you-go**: Only pay for what you use

Much cheaper and more reliable than dealing with IP changes!

## Support

If you need help:
1. Check Railway logs in the dashboard
2. Monitor the health check at `/api/health`
3. Railway has excellent documentation and support