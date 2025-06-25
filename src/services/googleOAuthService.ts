// Google OAuth2 Service for Google Sheets API
export interface OAuthConfig {
  clientId: string;
  scope: string[];
  redirectUri: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export class GoogleOAuthService {
  private config: OAuthConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || '',
      scope: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
      ],
      redirectUri: `${window.location.origin}/oauth/callback`
    };

    // Load stored tokens
    this.loadStoredTokens();
  }

  private loadStoredTokens() {
    const storedToken = localStorage.getItem('google_access_token');
    const storedRefresh = localStorage.getItem('google_refresh_token');
    const storedExpiry = localStorage.getItem('google_token_expiry');

    if (storedToken && storedExpiry) {
      this.accessToken = storedToken;
      this.refreshToken = storedRefresh;
      this.tokenExpiry = parseInt(storedExpiry, 10);
    }
  }

  private saveTokens(tokenResponse: TokenResponse) {
    this.accessToken = tokenResponse.access_token;
    this.tokenExpiry = Date.now() + (tokenResponse.expires_in * 1000);

    if (tokenResponse.refresh_token) {
      this.refreshToken = tokenResponse.refresh_token;
      localStorage.setItem('google_refresh_token', tokenResponse.refresh_token);
    }

    localStorage.setItem('google_access_token', tokenResponse.access_token);
    localStorage.setItem('google_token_expiry', this.tokenExpiry.toString());
  }

  public isConfigured(): boolean {
    return !!this.config.clientId;
  }

  public isAuthenticated(): boolean {
    return !!(this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry);
  }

  public getAuthUrl(): string {
    if (!this.isConfigured()) {
      throw new Error('OAuth2クライアントIDが設定されていません');
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scope.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: 'google_sheets_auth'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  public async handleAuthCallback(code: string): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error('OAuth2クライアントIDが設定されていません');
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET || '',
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OAuth token exchange failed:', errorData);
        return false;
      }

      const tokenResponse: TokenResponse = await response.json();
      this.saveTokens(tokenResponse);
      return true;
    } catch (error) {
      console.error('OAuth callback handling failed:', error);
      return false;
    }
  }

  public async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken || !this.isConfigured()) {
      return false;
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET || '',
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        console.error('Token refresh failed');
        this.logout();
        return false;
      }

      const tokenResponse: TokenResponse = await response.json();
      this.saveTokens(tokenResponse);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return false;
    }
  }

  public async getValidAccessToken(): Promise<string | null> {
    if (!this.accessToken) {
      return null;
    }

    // Check if token is expired
    if (this.tokenExpiry && Date.now() >= this.tokenExpiry - 60000) { // Refresh 1 minute before expiry
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        return null;
      }
    }

    return this.accessToken;
  }

  public logout() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_token_expiry');
  }

  public startAuthFlow() {
    if (!this.isConfigured()) {
      throw new Error('OAuth2設定が不完全です。VITE_GOOGLE_OAUTH_CLIENT_IDを設定してください。');
    }

    const authUrl = this.getAuthUrl();
    window.location.href = authUrl;
  }
}

export const googleOAuthService = new GoogleOAuthService();