# Weather API Setup Guide

## OpenWeatherMap API Configuration

### Step 1: Get Your Free API Key

1. **Visit OpenWeatherMap**: Go to [https://openweathermap.org/api](https://openweathermap.org/api)

2. **Create an Account**: 
   - Click "Sign Up" if you don't have an account
   - Fill in your details and verify your email

3. **Get API Key**:
   - After logging in, go to "My API Keys" section
   - Copy your default API key (or create a new one)
   - **Note**: It may take up to 2 hours for new API keys to become active

### Step 2: Configure Environment Variables

1. **Backend Configuration**:
   - Navigate to the `backend/` directory
   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   
2. **Update the .env file**:
   ```env
   # Replace 'your_openweather_api_key_here' with your actual API key
   OPENWEATHER_API_KEY=your_actual_api_key_here
   OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
   
   # Other configurations
   PORT=8000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/weather-app
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

### Step 3: Test Your API Connection

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Test the connection**:
   - Open your browser or use a tool like Postman
   - Navigate to: `http://localhost:8000/api/weather/test`
   - You should see a success message if everything is configured correctly

## Available API Endpoints

### Current Weather
- **By City**: `GET /api/weather/current/city/:city`
  - Example: `http://localhost:8000/api/weather/current/city/London`
  
- **By Coordinates**: `GET /api/weather/current/coords?lat=51.5074&lon=-0.1278`

### Weather Forecast (5-day)
- **By City**: `GET /api/weather/forecast/city/:city`
  - Example: `http://localhost:8000/api/weather/forecast/city/London`
  
- **By Coordinates**: `GET /api/weather/forecast/coords?lat=51.5074&lon=-0.1278`

### Utility Endpoints
- **Test Connection**: `GET /api/weather/test`
- **Available Units**: `GET /api/weather/units`
- **API Info**: `GET /api/weather`

## Supported Parameters

### Temperature Units
- `metric` (default) - Celsius, meter/sec wind speed
- `imperial` - Fahrenheit, miles/hour wind speed  
- `kelvin` - Kelvin, meter/sec wind speed

### Example Requests

```bash
# Current weather in London (Celsius)
curl "http://localhost:8000/api/weather/current/city/London?units=metric"

# Current weather in New York (Fahrenheit)
curl "http://localhost:8000/api/weather/current/city/New York?units=imperial"

# Weather by coordinates (San Francisco)
curl "http://localhost:8000/api/weather/current/coords?lat=37.7749&lon=-122.4194&units=metric"

# 5-day forecast for Tokyo
curl "http://localhost:8000/api/weather/forecast/city/Tokyo?units=metric"
```

## API Rate Limits

### Free Tier (OpenWeatherMap)
- **1,000 API calls/day**
- **60 API calls/minute**
- Current weather and 5-day forecast included

### Error Handling

The API handles common errors gracefully:

- **401**: Invalid API key
- **404**: City/location not found
- **429**: Rate limit exceeded
- **500**: Service temporarily unavailable

## Security Notes

- **Never commit your `.env` file** to version control
- Keep your API key private and secure
- Use environment variables for all sensitive configuration
- The `.env` file is already included in `.gitignore`

## Troubleshooting

### API Key Issues
- Ensure your API key is active (can take up to 2 hours for new keys)
- Check that you've copied the key correctly without extra spaces
- Verify you're using the correct OpenWeatherMap API endpoint

### Connection Issues
- Check your internet connection
- Verify the backend server is running on the correct port
- Ensure MongoDB is running (if using local MongoDB)

### CORS Issues
- Make sure `FRONTEND_URL` in `.env` matches your frontend URL
- Check that CORS is properly configured in `server.js`

## Next Steps

After setting up the API:

1. **Test all endpoints** using the examples above
2. **Set up MongoDB** for user preferences and favorites
3. **Build the frontend** to consume these API endpoints
4. **Implement authentication** for personalized features
