import { catchAsyncError } from "../middlewares/catchAsyncErrors";

export const location = catchAsyncError(async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    // Use OpenCage API to get location details
    const apiKey = process.env.OPENCAGE_API_KEY;
    // const opencage = require("opencage-api-client");
    const data = await opencage.geocode({
      q: `${latitude}, ${longitude}`,
      key: apiKey,
    });

    if (data.status.code === 200 && data.results.length > 0) {
      const place = data.results[0];
      const locationData = {
        latitude,
        longitude,
        city: place.components.city,
        state: place.components.state,
        pincode: place.components.postcode,
        address: place.formatted,
      };

      // Save location data to MongoDB
      const newLocation = new Location(locationData);
      await newLocation.save();

      res.json(locationData);
    } else {
      res.status(500).json({ error: "Unable to fetch location details" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});