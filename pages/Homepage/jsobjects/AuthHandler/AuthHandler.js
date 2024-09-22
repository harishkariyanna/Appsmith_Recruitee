export default {
  async handleLogin() {
    try {
      console.log('Login attempt started');
      
      // Get input values
      const email = email_input.text;
      const password = password_input.text;
      console.log('Email:', email, 'Password:', password);
      
      if (!email || !password) {
        showAlert('Please enter both email and password', 'warning');
        return false;
      }
      
      // Fetch user data from Excel
      console.log('Fetching user data...');
      const userData = await FetchExcelData.run();
      const empData = await FetchSecondData.run();
      console.log('User data fetched', { userData, empData });
      
      // Find user in both datasets
      const user = userData.find(u => u.Email === email && u.Password === password);
      const emp = empData.find(e => e.Email === email && e.Password === password);
      console.log('User found:', { user, emp });
      
      if (user || emp) {
        // Generate a new session ID
        const sessionId = this.generateSessionId();
        console.log('Session ID generated:', sessionId);
        
        // Set user session (prioritize user data if found in both)
        const authenticatedUser = user || emp;
        storeValue('currentUser', { ...authenticatedUser, sessionId });
        console.log('User session stored:', authenticatedUser);
        
        showAlert('Login successful!', 'success');
        
        // Navigate to the default page after login
        console.log('Navigating to Findjobs page...');
        navigateTo('Findjobs', {});
        return true;
      } else {
        showAlert('Invalid credentials', 'error');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      showAlert('An error occurred during login. Please try again.', 'error');
      return false;
    }
  },

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9);
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

  requireAuth(targetPage) {
    if (!this.isAuthenticated()) {
      navigateTo('LoginPage', {});
      return false;
    }
    return true;
  },

  // Navigation methods for protected pages
  navigateToFindjobs() {
    if (this.requireAuth('Findjobs')) {
      navigateTo('Findjobs', {});
    }
  },

  // Page load handlers
  handleFindjobsLoad() {
    if (this.requireAuth('Findjobs')) {
      console.log('Findjobs page loaded');
      return true;
    }
    return false;
  }
}