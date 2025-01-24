const assetsConfig = require("./assetsConfig.json");

export default {
  expo: {
    name: "CityWikiApp",
    slug: "CityWikiApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.CityWikiApp",
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "We need your location to show you where you are on the map and find nearby points of interest.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "We need your location to show you where you are on the map and find nearby points of interest.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.anonymous.CityWikiApp",
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      [
        "@rnmapbox/maps",
        {
          RNMapboxMapsVersion: "11.8.0",
          RNMapboxMapsDownloadToken:
            "sk.eyJ1IjoiZGl2b2RpdmVuc29uIiwiYSI6ImNtNXY5MWl6NjAzcnAyaXNnbjRubjAya28ifQ.XWemoR3l3hRrkyT8gsZ6ew",
        },
      ],
      [
        "expo-asset",
        {
          assets: assetsConfig.assets, // Dynamically include assets
        },
      ],
      "expo-font",
    ],
    extra: {
      eas: {
        projectId: "e4a563a7-c296-4f7c-af28-803bc5b3c4ae",
      },
    },
  },
};
