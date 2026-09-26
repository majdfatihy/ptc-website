// API Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000/api';

class APIClient {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    async request(endpoint, method = 'GET', data = null) {
        const url = `${API_URL}${endpoint}`;
        const options = {
            method,
            headers: this.getHeaders(),
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Request failed');
            }
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async register(name, email, password, country) {
        return this.request('/auth/register', 'POST', { name, email, password, country });
    }

    async login(email, password) {
        return this.request('/auth/login', 'POST', { email, password });
    }

    // User endpoints
    async getProfile() {
        return this.request('/users/profile');
    }

    async updateProfile(data) {
        return this.request('/users/profile', 'PUT', data);
    }

    async getReferrals() {
        return this.request('/users/referrals');
    }

    // Tasks endpoints
    async getTasks() {
        return this.request('/tasks');
    }

    async completeTask(taskId) {
        return this.request(`/tasks/${taskId}/complete`, 'POST');
    }

    async createTask(taskData) {
        return this.request('/tasks', 'POST', taskData);
    }

    // Earnings endpoints
    async getEarnings() {
        return this.request('/earnings');
    }

    // Withdrawal endpoints
    async requestWithdrawal(data) {
        return this.request('/withdrawals', 'POST', data);
    }

    async getWithdrawals() {
        return this.request('/withdrawals');
    }

    // Admin endpoints
    async getDashboardStats() {
        return this.request('/admin/dashboard');
    }

    async getAllUsers() {
        return this.request('/admin/users');
    }

    async getAllWithdrawals() {
        return this.request('/admin/withdrawals');
    }

    async approveWithdrawal(withdrawalId) {
        return this.request(`/admin/withdrawals/${withdrawalId}/approve`, 'PUT');
    }
}

const api = new APIClient();

// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('ar-EG').format(new Date(date));
}

function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/index.html';
}