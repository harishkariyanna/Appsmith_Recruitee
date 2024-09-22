export default {
  async handleLogin() {
    const email = email_input.text;
    const password = password_input.text;
    
    // Fetch user data from Excel
    const userData = await FetchExcelData.run();
    
    // Find user
    const user = userData.find(u => u.Email === email && u.Password === password);
    
    if (user) {
      // Generate a new session ID
      const sessionId = this.generateSessionId();
      
      // Set user session
      storeValue('currentUser', { ...user, sessionId });
      showAlert('Login successful!', 'success');
      
      // Navigate to the default page after login
      navigateTo('Bangalorejobs', {});
      return true;
    } else {
      showAlert('Invalid credentials', 'error');
      return false;
    }
  },
  
  isAuthenticated() {
    return appsmith.store.currentUser !== undefined;
  },
  
  logout() {
    removeValue('currentUser');
    showAlert('Logged out successfully', 'success');
    navigateTo('LoginPage', {});
    return true;
  },
  
  redirectToLogin() {
    navigateTo('LoginPage', {});
  },
  
  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9);
  },
  
  getCurrentUser() {
    return appsmith.store.currentUser;
  },
  
  async checkSession() {
    if (this.isAuthenticated()) {
      const sessionId = this.getCurrentUser().sessionId;
      const isValid = await this.validateSessionWithBackend(sessionId);
      
      if (!isValid) {
        this.logout();
        showAlert("Your session has expired. Please log in again.", "warning");
        return false;
      }
      return true;
    }
    return false;
  },
  
  async validateSessionWithBackend(sessionId) {
    // Placeholder for actual backend validation
    return true;
  },
  
  startSessionCheck() {
    // Check session every 5 minutes
    return setInterval(() => this.checkSession(), 5 * 60 * 1000);
  },
  
  requireAuth(targetPage) {
    if (!this.isAuthenticated()) {
      this.redirectToLogin();
      return false;
    }
    return true;
  },
  
  // Navigation methods for protected pages
  navigateToBangalorejobs() {
    return this.requireAuth('Bangalorejobs') ? navigateTo('Bangalorejobs', {}) : false;
  },

  navigateToInvitefriends() {
    return this.requireAuth('Invitefriends') ? navigateTo('Invitefriends', {}) : false;
  },

  // Page load handlers
  async handleBangalorejobsLoad() {
    if (this.requireAuth('Bangalorejobs')) {
      this.startSessionCheck();
      return true;
    }
    return false;
  },

  async handleInvitefriendsLoad() {
    if (this.requireAuth('Invitefriends')) {
      this.startSessionCheck();
      return true;
    }
    return false;
  },
}