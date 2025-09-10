import axios, { AxiosInstance } from 'axios';

export interface ClickyConfig {
  siteId: string;
  siteKey: string;
  baseUrl?: string;
}

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export class ClickyClient {
  private client: AxiosInstance;
  private siteId: string;
  private siteKey: string;

  constructor(config: ClickyConfig) {
    this.siteId = config.siteId;
    this.siteKey = config.siteKey;

    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.clicky.com/api/stats/4',
      timeout: 30000,
    });
  }

  private validateDateRange(dateRange: DateRange): void {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 31) {
      throw new Error('Date range cannot exceed 31 days as per Clicky API limits');
    }

    if (start > end) {
      throw new Error('Start date must be before or equal to end date');
    }
  }

  async getTotalVisitors(dateRange: DateRange): Promise<any> {
    this.validateDateRange(dateRange);

    const response = await this.client.get('', {
      params: {
        site_id: this.siteId,
        sitekey: this.siteKey,
        type: 'visitors',
        date: `${dateRange.startDate},${dateRange.endDate}`,
        output: 'json'
      }
    });

    return response.data;
  }

  async getDomainVisitors(domain: string, dateRange: DateRange, segments?: string[], limit?: number): Promise<any> {
    this.validateDateRange(dateRange);

    const params: any = {
      site_id: this.siteId,
      sitekey: this.siteKey,
      type: 'segmentation',
      domain: domain,
      segments: segments ? segments.join(',') : 'visitors',
      date: `${dateRange.startDate},${dateRange.endDate}`,
      output: 'json'
    };

    if (limit) {
      params.limit = Math.min(limit, 1000); // API max is 1000
    }

    const response = await this.client.get('', { params });

    return response.data;
  }

  async getTopPages(dateRange: DateRange, limit?: number): Promise<any> {
    this.validateDateRange(dateRange);

    const params: any = {
      site_id: this.siteId,
      sitekey: this.siteKey,
      type: 'pages',
      date: `${dateRange.startDate},${dateRange.endDate}`,
      output: 'json'
    };

    if (limit) {
      params.limit = Math.min(limit, 1000); // API max is 1000
    }

    const response = await this.client.get('', { params });
    return response.data;
  }

  async getTrafficSources(dateRange: DateRange, pageUrl?: string): Promise<any> {
    this.validateDateRange(dateRange);

    let params: any = {
      site_id: this.siteId,
      sitekey: this.siteKey,
      date: `${dateRange.startDate},${dateRange.endDate}`,
      output: 'json'
    };

    if (pageUrl) {
      // Extract path from URL and encode it
      let path: string;
      try {
        const urlObj = new URL(pageUrl);
        path = urlObj.pathname;
      } catch (error) {
        // If URL parsing fails, assume it's already a path
        path = pageUrl.startsWith('/') ? pageUrl : '/' + pageUrl;
      }

      // Use segmentation API for page-specific traffic sources
      params.type = 'segmentation';
      params.href = path; // Axios will handle the URL encoding automatically
      params.segments = 'traffic-sources';
    } else {
      // Use general traffic sources API
      params.type = 'traffic-sources';
    }

    const response = await this.client.get('', { params });

    return response.data;
  }

  async getPageTraffic(url: string, dateRange: DateRange): Promise<any> {
    this.validateDateRange(dateRange);

    // Extract path from URL and encode it
    let path: string;
    try {
      const urlObj = new URL(url);
      path = urlObj.pathname;
    } catch (error) {
      // If URL parsing fails, assume it's already a path
      path = url.startsWith('/') ? url : '/' + url;
    }

    // Use raw path - Axios will handle the URL encoding automatically
    const filterPath = path;

    const response = await this.client.get('', {
      params: {
        site_id: this.siteId,
        sitekey: this.siteKey,
        type: 'pages',
        filter: filterPath,
        date: `${dateRange.startDate},${dateRange.endDate}`,
        output: 'json'
      }
    });

    return response.data;
  }
}