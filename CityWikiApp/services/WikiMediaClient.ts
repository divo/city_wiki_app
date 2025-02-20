interface WikiMediaImage {
  title: string;
  imageinfo: Array<{
    url: string;
    descriptionurl: string;
  }>;
}

interface WikiMediaResponse {
  query: {
    pages: {
      [key: string]: WikiMediaImage;
    };
  };
}

export class WikiMediaClient {
  private static instance: WikiMediaClient;
  private readonly baseUrl = 'https://commons.wikimedia.org/w/api.php';
  private readonly searchRadius = 10; // meters

  private constructor() {}

  static getInstance(): WikiMediaClient {
    if (!WikiMediaClient.instance) {
      WikiMediaClient.instance = new WikiMediaClient();
    }
    return WikiMediaClient.instance;
  }

  async findImageByCoordinates(latitude: number, longitude: number): Promise<string | null> {
    try {
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        generator: 'geosearch',
        ggslimit: '10',
        ggsprimary: 'all',
        ggsnamespace: '6', // File namespace
        ggsradius: this.searchRadius.toString(),
        ggscoord: `${latitude}|${longitude}`,
        prop: 'imageinfo',
        iiprop: 'url',
        iiurlwidth: '800',
        origin: '*'
      });

      const url = `${this.baseUrl}?${params.toString()}`;
      console.log('WikiMedia API query:', url);

      const response = await fetch(url);
      const data: WikiMediaResponse = await response.json();
      console.log('WikiMedia API response:', data);

      if (!data.query?.pages) {
        return null;
      }

      // Get the first image that's not an icon, logo, or map
      const images = Object.values(data.query.pages);
      const validImage = images.find(img => {
        const title = img.title.toLowerCase();
        return !title.includes('icon') && 
               !title.includes('logo') && 
               !title.includes('map') &&
               !title.includes('flag') &&
               img.imageinfo?.[0]?.url;
      });

      return validImage?.imageinfo?.[0]?.url ?? null;
    } catch (error) {
      console.error('Error fetching WikiMedia image:', error);
      return null;
    }
  }
} 