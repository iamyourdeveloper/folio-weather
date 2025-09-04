import mongoose from 'mongoose';

const weatherAlertSchema = new mongoose.Schema({
  // Reference to the user who owns this alert
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  // Alert identification and status
  name: {
    type: String,
    required: [true, 'Alert name is required'],
    trim: true,
    maxlength: [100, 'Alert name cannot exceed 100 characters']
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Location for the alert
  location: {
    type: {
      type: String,
      enum: ['city', 'coordinates', 'favorite'],
      required: [true, 'Location type is required']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City name cannot exceed 100 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country name cannot exceed 100 characters']
    },
    coordinates: {
      lat: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      lon: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    },
    favoriteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FavoriteLocation'
    }
  },
  
  // Alert conditions
  conditions: {
    // Weather type alerts
    weatherTypes: [{
      type: String,
      enum: [
        'thunderstorm',
        'drizzle',
        'rain',
        'snow',
        'mist',
        'smoke',
        'haze',
        'dust',
        'fog',
        'sand',
        'ash',
        'squall',
        'tornado',
        'clear',
        'clouds'
      ]
    }],
    
    // Temperature alerts
    temperature: {
      min: {
        value: Number,
        enabled: {
          type: Boolean,
          default: false
        }
      },
      max: {
        value: Number,
        enabled: {
          type: Boolean,
          default: false
        }
      },
      units: {
        type: String,
        enum: ['metric', 'imperial', 'kelvin'],
        default: 'metric'
      }
    },
    
    // Wind alerts
    wind: {
      speed: {
        min: {
          value: Number,
          enabled: {
            type: Boolean,
            default: false
          }
        },
        max: {
          value: Number,
          enabled: {
            type: Boolean,
            default: false
          }
        }
      },
      units: {
        type: String,
        enum: ['metric', 'imperial'],
        default: 'metric'
      }
    },
    
    // Humidity alerts
    humidity: {
      min: {
        value: {
          type: Number,
          min: [0, 'Humidity cannot be less than 0%'],
          max: [100, 'Humidity cannot exceed 100%']
        },
        enabled: {
          type: Boolean,
          default: false
        }
      },
      max: {
        value: {
          type: Number,
          min: [0, 'Humidity cannot be less than 0%'],
          max: [100, 'Humidity cannot exceed 100%']
        },
        enabled: {
          type: Boolean,
          default: false
        }
      }
    },
    
    // Pressure alerts
    pressure: {
      min: {
        value: Number,
        enabled: {
          type: Boolean,
          default: false
        }
      },
      max: {
        value: Number,
        enabled: {
          type: Boolean,
          default: false
        }
      }
    },
    
    // UV Index alerts
    uvIndex: {
      min: {
        value: {
          type: Number,
          min: [0, 'UV Index cannot be less than 0'],
          max: [11, 'UV Index cannot exceed 11']
        },
        enabled: {
          type: Boolean,
          default: false
        }
      },
      max: {
        value: {
          type: Number,
          min: [0, 'UV Index cannot be less than 0'],
          max: [11, 'UV Index cannot exceed 11']
        },
        enabled: {
          type: Boolean,
          default: false
        }
      }
    }
  },
  
  // Notification settings
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    methods: [{
      type: String,
      enum: ['email', 'push', 'sms'],
      default: 'email'
    }],
    frequency: {
      type: String,
      enum: ['immediate', 'hourly', 'daily'],
      default: 'immediate'
    },
    quietHours: {
      enabled: {
        type: Boolean,
        default: false
      },
      start: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'],
        default: '22:00'
      },
      end: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'],
        default: '07:00'
      }
    }
  },
  
  // Alert history and statistics
  statistics: {
    totalTriggers: {
      type: Number,
      default: 0
    },
    lastTriggered: {
      type: Date,
      default: null
    },
    lastChecked: {
      type: Date,
      default: null
    }
  },
  
  // Schedule settings
  schedule: {
    enabled: {
      type: Boolean,
      default: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    },
    daysOfWeek: [{
      type: Number,
      min: [0, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'],
      max: [6, 'Day of week must be between 0 (Sunday) and 6 (Saturday)']
    }],
    timeRange: {
      start: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'],
        default: '00:00'
      },
      end: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'],
        default: '23:59'
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
weatherAlertSchema.index({ userId: 1, isActive: 1 });
weatherAlertSchema.index({ userId: 1, 'statistics.lastChecked': 1 });
weatherAlertSchema.index({ isActive: 1, 'schedule.enabled': 1 });
weatherAlertSchema.index({ 'location.favoriteId': 1 });

// Virtual for checking if alert is currently active based on schedule
weatherAlertSchema.virtual('isCurrentlyActive').get(function() {
  if (!this.isActive || !this.schedule.enabled) return false;
  
  const now = new Date();
  
  // Check date range
  if (this.schedule.startDate && now < this.schedule.startDate) return false;
  if (this.schedule.endDate && now > this.schedule.endDate) return false;
  
  // Check day of week
  if (this.schedule.daysOfWeek && this.schedule.daysOfWeek.length > 0) {
    const currentDay = now.getDay();
    if (!this.schedule.daysOfWeek.includes(currentDay)) return false;
  }
  
  // Check time range
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  if (this.schedule.timeRange.start && currentTime < this.schedule.timeRange.start) return false;
  if (this.schedule.timeRange.end && currentTime > this.schedule.timeRange.end) return false;
  
  return true;
});

// Virtual for formatted location string
weatherAlertSchema.virtual('locationString').get(function() {
  switch (this.location.type) {
    case 'city':
      return this.location.country 
        ? `${this.location.city}, ${this.location.country}`
        : this.location.city;
    case 'coordinates':
      return `${this.location.coordinates.lat}, ${this.location.coordinates.lon}`;
    case 'favorite':
      return 'Favorite Location';
    default:
      return 'Unknown Location';
  }
});

// Static method to get active alerts for a user
weatherAlertSchema.statics.getUserActiveAlerts = function(userId) {
  return this.find({
    userId,
    isActive: true,
    'schedule.enabled': true
  }).populate('location.favoriteId', 'name city country');
};

// Static method to get alerts that need checking
weatherAlertSchema.statics.getAlertsToCheck = function(maxAge = 15) {
  const cutoffTime = new Date(Date.now() - maxAge * 60 * 1000); // maxAge minutes ago
  
  return this.find({
    isActive: true,
    'schedule.enabled': true,
    $or: [
      { 'statistics.lastChecked': { $exists: false } },
      { 'statistics.lastChecked': null },
      { 'statistics.lastChecked': { $lt: cutoffTime } }
    ]
  }).populate('userId', 'email profile.firstName preferences.notifications')
    .populate('location.favoriteId', 'name city country coordinates');
};

// Instance method to check if alert conditions are met
weatherAlertSchema.methods.checkConditions = function(weatherData) {
  const { current } = weatherData;
  if (!current) return false;
  
  const conditions = this.conditions;
  let conditionsMet = [];
  
  // Check weather types
  if (conditions.weatherTypes && conditions.weatherTypes.length > 0) {
    if (conditions.weatherTypes.includes(current.main.toLowerCase())) {
      conditionsMet.push(`Weather condition: ${current.main}`);
    }
  }
  
  // Check temperature conditions
  if (conditions.temperature.min.enabled && current.temperature < conditions.temperature.min.value) {
    conditionsMet.push(`Temperature below ${conditions.temperature.min.value}°`);
  }
  if (conditions.temperature.max.enabled && current.temperature > conditions.temperature.max.value) {
    conditionsMet.push(`Temperature above ${conditions.temperature.max.value}°`);
  }
  
  // Check wind conditions
  if (conditions.wind.speed.min.enabled && current.windSpeed < conditions.wind.speed.min.value) {
    conditionsMet.push(`Wind speed below ${conditions.wind.speed.min.value}`);
  }
  if (conditions.wind.speed.max.enabled && current.windSpeed > conditions.wind.speed.max.value) {
    conditionsMet.push(`Wind speed above ${conditions.wind.speed.max.value}`);
  }
  
  // Check humidity conditions
  if (conditions.humidity.min.enabled && current.humidity < conditions.humidity.min.value) {
    conditionsMet.push(`Humidity below ${conditions.humidity.min.value}%`);
  }
  if (conditions.humidity.max.enabled && current.humidity > conditions.humidity.max.value) {
    conditionsMet.push(`Humidity above ${conditions.humidity.max.value}%`);
  }
  
  // Check pressure conditions
  if (conditions.pressure.min.enabled && current.pressure < conditions.pressure.min.value) {
    conditionsMet.push(`Pressure below ${conditions.pressure.min.value}`);
  }
  if (conditions.pressure.max.enabled && current.pressure > conditions.pressure.max.value) {
    conditionsMet.push(`Pressure above ${conditions.pressure.max.value}`);
  }
  
  // Check UV index conditions
  if (current.uvIndex) {
    if (conditions.uvIndex.min.enabled && current.uvIndex < conditions.uvIndex.min.value) {
      conditionsMet.push(`UV Index below ${conditions.uvIndex.min.value}`);
    }
    if (conditions.uvIndex.max.enabled && current.uvIndex > conditions.uvIndex.max.value) {
      conditionsMet.push(`UV Index above ${conditions.uvIndex.max.value}`);
    }
  }
  
  return conditionsMet.length > 0 ? conditionsMet : false;
};

// Instance method to trigger alert
weatherAlertSchema.methods.trigger = async function(conditionsMet, weatherData) {
  this.statistics.totalTriggers += 1;
  this.statistics.lastTriggered = new Date();
  this.statistics.lastChecked = new Date();
  
  await this.save();
  
  // Here you would implement the actual notification sending
  // For now, just return the alert data
  return {
    alert: this,
    conditions: conditionsMet,
    weather: weatherData,
    triggeredAt: new Date()
  };
};

// Instance method to update last checked time
weatherAlertSchema.methods.updateLastChecked = function() {
  this.statistics.lastChecked = new Date();
  return this.save({ validateBeforeSave: false });
};

const WeatherAlert = mongoose.model('WeatherAlert', weatherAlertSchema);

export default WeatherAlert;

