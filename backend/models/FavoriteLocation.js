import mongoose from 'mongoose';

const favoriteLocationSchema = new mongoose.Schema({
  // Reference to the user who owns this favorite location
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  // Location details
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
    maxlength: [100, 'Location name cannot exceed 100 characters']
  },
  
  city: {
    type: String,
    required: [true, 'City name is required'],
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters']
  },
  
  country: {
    type: String,
    trim: true,
    maxlength: [100, 'Country name cannot exceed 100 characters'],
    default: null
  },
  
  countryCode: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [3, 'Country code cannot exceed 3 characters'],
    default: null
  },
  
  state: {
    type: String,
    trim: true,
    maxlength: [100, 'State name cannot exceed 100 characters'],
    default: null
  },
  
  // Coordinates for precise location
  coordinates: {
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    lon: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  
  // Display order for user's favorites list
  order: {
    type: Number,
    default: 0
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Cache weather data for quick access
  lastWeatherUpdate: {
    type: Date,
    default: null
  },
  
  cachedWeather: {
    temperature: Number,
    description: String,
    icon: String,
    humidity: Number,
    windSpeed: Number,
    pressure: Number,
    uvIndex: Number,
    visibility: Number,
    cloudiness: Number,
    feelsLike: Number,
    lastUpdated: Date
  },
  
  // Additional settings for this location
  settings: {
    showInQuickAccess: {
      type: Boolean,
      default: true
    },
    alertsEnabled: {
      type: Boolean,
      default: false
    },
    preferredUnits: {
      type: String,
      enum: ['metric', 'imperial', 'kelvin', 'inherit'],
      default: 'inherit' // Inherit from user preferences
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
favoriteLocationSchema.index({ userId: 1, order: 1 });
favoriteLocationSchema.index({ userId: 1, isActive: 1 });
favoriteLocationSchema.index({ userId: 1, createdAt: -1 });
favoriteLocationSchema.index({ 'coordinates.lat': 1, 'coordinates.lon': 1 });

// Ensure unique favorite names per user
favoriteLocationSchema.index(
  { userId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

// Virtual for formatted location string
favoriteLocationSchema.virtual('fullLocation').get(function() {
  const parts = [this.city];
  
  if (this.state) {
    parts.push(this.state);
  }
  
  if (this.country) {
    parts.push(this.country);
  }
  
  return parts.join(', ');
});

// Virtual for checking if weather data is fresh (less than 30 minutes old)
favoriteLocationSchema.virtual('isWeatherFresh').get(function() {
  if (!this.lastWeatherUpdate) return false;
  
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  return this.lastWeatherUpdate > thirtyMinutesAgo;
});

// Static method to get user's favorites in order
favoriteLocationSchema.statics.getUserFavorites = function(userId, activeOnly = true) {
  const query = { userId };
  
  if (activeOnly) {
    query.isActive = true;
  }
  
  return this.find(query)
    .sort({ order: 1, createdAt: 1 })
    .populate('userId', 'username email profile.firstName profile.lastName');
};

// Static method to count user's favorites
favoriteLocationSchema.statics.countUserFavorites = function(userId) {
  return this.countDocuments({ userId, isActive: true });
};

// Instance method to update weather cache
favoriteLocationSchema.methods.updateWeatherCache = function(weatherData) {
  this.cachedWeather = {
    temperature: weatherData.current?.temperature,
    description: weatherData.current?.description,
    icon: weatherData.current?.icon,
    humidity: weatherData.current?.humidity,
    windSpeed: weatherData.current?.windSpeed,
    pressure: weatherData.current?.pressure,
    uvIndex: weatherData.current?.uvIndex,
    visibility: weatherData.current?.visibility,
    cloudiness: weatherData.current?.cloudiness,
    feelsLike: weatherData.current?.feelsLike,
    lastUpdated: new Date()
  };
  
  this.lastWeatherUpdate = new Date();
  return this.save();
};

// Instance method to reorder favorites
favoriteLocationSchema.statics.reorderFavorites = async function(userId, favoriteIds) {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Update order for each favorite
      for (let i = 0; i < favoriteIds.length; i++) {
        await this.findOneAndUpdate(
          { _id: favoriteIds[i], userId },
          { order: i },
          { session }
        );
      }
    });
    
    await session.endSession();
    return true;
  } catch (error) {
    await session.endSession();
    throw error;
  }
};

// Pre-save middleware to handle ordering
favoriteLocationSchema.pre('save', async function(next) {
  // If this is a new document and no order is set, set it to be last
  if (this.isNew && this.order === 0) {
    try {
      const maxOrder = await this.constructor.findOne(
        { userId: this.userId, isActive: true },
        { order: 1 }
      ).sort({ order: -1 });
      
      this.order = maxOrder ? maxOrder.order + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Pre-remove middleware to clean up references
favoriteLocationSchema.pre('remove', async function(next) {
  try {
    // Remove any weather alerts associated with this location
    await mongoose.model('WeatherAlert').deleteMany({
      userId: this.userId,
      'location.favoriteId': this._id
    });
    
    next();
  } catch (error) {
    next(error);
  }
});

const FavoriteLocation = mongoose.model('FavoriteLocation', favoriteLocationSchema);

export default FavoriteLocation;

