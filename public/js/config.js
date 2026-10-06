// Browser-safe API configuration with offline/localStorage fallback.
// This lets the PTC site work even before the backend is running.
const API_URL = window.API_URL || 'http://localhost:5000/api';

const STORAGE_KEYS = {
  authToken: 'authToken',
  users: 'ptc_users',
  tasks: 'ptc_tasks',
  earnings: 'ptc_earnings',
  withdrawals: 'ptc_withdrawals',
  sessionUser: 'ptc_session_user'
};

function safeJSONParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function seedMockData() {
  const defaultUsers = [
    {
      _id: 'user_admin_1',
      name: 'Admin',
      email: 'admin@ptcearn.com',
      password: 'admin123',
      country: 'Saudi Arabia',
      balance: 1250,
      totalEarned: 1250,
      tasksCompleted: 14,
      referralCode: 'PTCADMIN',
      role: 'admin',
      paymentMethod: 'paypal',
      phone: '+966500000000',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'user_demo_1',
      name: 'Ahmed Ali',
      email: 'ahmed@example.com',
      password: 'demo123',
      country: 'Egypt',
      balance: 85.5,
      totalEarned: 250,
      tasksCompleted: 8,
      referralCode: 'PTCAHMED',
      role: 'user',
      paymentMethod: 'bank',
      phone: '+966555123456',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ];

  const existingUsers = safeJSONParse(localStorage.getItem(STORAGE_KEYS.users), null);
  if (!existingUsers || existingUsers.length === 0) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(defaultUsers));
  }

  const defaultTasks = [
    { _id: 'task_1', title: 'شاهد إعلان عن منتج إلكتروني', description: 'شاهد إعلان مدته دقيقة واحدة', type: 'ad_view', reward: 0.5, duration: '1 دقيقة', link: 'https://example.com' },
    { _id: 'task_2', title: 'أكمل استبيان عن تفضيلاتك', description: 'أجب على 10 أسئلة بسيطة', type: 'survey', reward: 2.5, duration: '5 دقائق', link: 'https://example.com' },
    { _id: 'task_3', title: 'اختبر تطبيق جديد', description: 'حمل التطبيق واستخدمه لمدة دقيقة', type: 'app_test', reward: 3, duration: '10 دقائق', link: 'https://example.com' },
    { _id: 'task_4', title: 'اشترك في قائمة بريدية', description: 'اشترك باستخدام بريدك الإلكتروني', type: 'email_signup', reward: 1.5, duration: '2 دقيقة', link: 'https://example.com' }
  ];

  const existingTasks = safeJSONParse(localStorage.getItem(STORAGE_KEYS.tasks), null);
  if (!existingTasks || existingTasks.length === 0) {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(defaultTasks));
  }

  const existingWithdrawals = safeJSONParse(localStorage.getItem(STORAGE_KEYS.withdrawals), null);
  if (!existingWithdrawals || existingWithdrawals.length === 0) {
    localStorage.setItem(STORAGE_KEYS.withdrawals, JSON.stringify([
      { _id: 'w_1', userId: 'user_demo_1', user: { name: 'Ahmed Ali' }, amount: 50, method: 'paypal', status: 'pending', createdAt: new Date().toISOString() }
    ]));
  }

  const existingEarnings = safeJSONParse(localStorage.getItem(STORAGE_KEYS.earnings), null);
  if (!existingEarnings || existingEarnings.length === 0) {
    localStorage.setItem(STORAGE_KEYS.earnings, JSON.stringify([
      { _id: 'e_1', userId: 'user_demo_1', type: 'task', status: 'approved', amount: 25, task: { title: 'إكمال استبيان' }, createdAt: new Date().toISOString() },
      { _id: 'e_2', userId: 'user_demo_1', type: 'referral', status: 'pending', amount: 10, task: { title: 'إحالة جديدة' }, createdAt: new Date().toISOString() }
    ]));
  }
}

seedMockData();

class APIClient {
  constructor() {
    this.token = localStorage.getItem(STORAGE_KEYS.authToken) || null;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem(STORAGE_KEYS.authToken, token);
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    return headers;
  }

  async request(endpoint, method = 'GET', data = null) {
    const url = `${API_URL}${endpoint}`;
    const options = { method, headers: this.getHeaders() };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errData.error || 'Request failed');
      }
      return await response.json();
    } catch (error) {
      return this.mockFallback(endpoint, method, data, error);
    }
  }

  mockFallback(endpoint, method, data, originalError) {
    const users = safeJSONParse(localStorage.getItem(STORAGE_KEYS.users), []);
    const tasks = safeJSONParse(localStorage.getItem(STORAGE_KEYS.tasks), []);
    const earnings = safeJSONParse(localStorage.getItem(STORAGE_KEYS.earnings), []);
    const withdrawals = safeJSONParse(localStorage.getItem(STORAGE_KEYS.withdrawals), []);

    const lower = endpoint.toLowerCase();

    if (endpoint === '/auth/register' && method === 'POST') {
      const { name, email, password, country } = data || {};
      if (!name || !email || !password) {
        throw new Error('Missing registration fields');
      }
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        throw new Error('هذا البريد مستخدم بالفعل');
      }
      const newUser = {
        _id: uid('user'),
        name,
        email,
        password,
        country,
        balance: 0,
        totalEarned: 0,
        tasksCompleted: 0,
        referralCode: `PTC${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        role: 'user',
        paymentMethod: '',
        phone: '',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
      const token = `mock_token_${newUser._id}`;
      this.setToken(token);
      localStorage.setItem(STORAGE_KEYS.sessionUser, JSON.stringify(newUser));
      return { success: true, token, user: { ...newUser } };
    }

    if (endpoint === '/auth/login' && method === 'POST') {
      const { email, password } = data || {};
      const match = users.find(u => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password);
      if (!match) {
        throw new Error('خطأ في البريد أو كلمة المرور');
      }
      const token = `mock_token_${match._id}`;
      this.setToken(token);
      localStorage.setItem(STORAGE_KEYS.sessionUser, JSON.stringify(match));
      return { success: true, token, user: { ...match } };
    }

    if (endpoint === '/users/profile' && method === 'GET') {
      const stored = safeJSONParse(localStorage.getItem(STORAGE_KEYS.sessionUser), null);
      if (!stored) {
        throw new Error('Unauthenticated');
      }
      const user = users.find(u => u._id === stored._id) || stored;
      return { user: { ...user } };
    }

    if (endpoint === '/users/profile' && method === 'PUT') {
      const stored = safeJSONParse(localStorage.getItem(STORAGE_KEYS.sessionUser), null);
      const current = users.find(u => u._id === stored._id) || stored;
      const updated = { ...current, ...data };
      const index = users.findIndex(u => u._id === current._id);
      if (index >= 0) users[index] = updated;
      localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.sessionUser, JSON.stringify(updated));
      return { success: true, user: { ...updated } };
    }

    if (endpoint === '/users/referrals' && method === 'GET') {
      const stored = safeJSONParse(localStorage.getItem(STORAGE_KEYS.sessionUser), null);
      const sameUser = users.filter(u => u._id !== stored._id && u.role !== 'admin');
      const mapped = sameUser.slice(0, 3).map(u => ({ name: u.name, email: u.email, createdAt: u.createdAt }));
      return { count: mapped.length, referrals: mapped };
    }

    if (endpoint === '/tasks' && method === 'GET') {
      return { tasks };
    }

    if (endpoint === '/tasks' && method === 'POST') {
      const newTask = { _id: uid('task'), ...data, duration: data.duration || '3 دقائق' };
      tasks.push(newTask);
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
      return { success: true, task: newTask };
    }

    if (lower.startsWith('/tasks/') && lower.endsWith('/complete') && method === 'POST') {
      const taskId = endpoint.split('/')[2];
      const task = tasks.find(t => t._id === taskId);
      if (!task) throw new Error('Task not found');
      const stored = safeJSONParse(localStorage.getItem(STORAGE_KEYS.sessionUser), null);
      const user = users.find(u => u._id === stored._id) || stored;
      const earningAmount = Number(task.reward || 0);
      user.balance = Number(user.balance || 0) + earningAmount;
      user.totalEarned = Number(user.totalEarned || 0) + earningAmount;
      user.tasksCompleted = Number(user.tasksCompleted || 0) + 1;
      const index = users.findIndex(u => u._id === user._id);
      if (index >= 0) users[index] = user;
      localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.sessionUser, JSON.stringify(user));
      earnings.push({
        _id: uid('earning'),
        userId: user._id,
        type: 'task',
        amount: earningAmount,
        status: 'approved',
        task: { title: task.title },
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.earnings, JSON.stringify(earnings));
      return { success: true, earning: earningAmount };
    }

    if (endpoint === '/earnings' && method === 'GET') {
      const stored = safeJSONParse(localStorage.getItem(STORAGE_KEYS.sessionUser), null);
      const user = users.find(u => u._id === stored._id) || stored;
      const userEarnings = earnings.filter(e => e.userId === user._id);
      const totalApproved = userEarnings.filter(e => e.status === 'approved').reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const pending = userEarnings.filter(e => e.status !== 'approved').reduce((sum, e) => sum + Number(e.amount || 0), 0);
      return {
        summary: { totalEarned: totalApproved, pending },
        earnings: userEarnings
      };
    }

    if (endpoint === '/withdrawals' && method === 'GET') {
      const stored = safeJSONParse(localStorage.getItem(STORAGE_KEYS.sessionUser), null);
      const user = users.find(u => u._id === stored._id) || stored;
      const userWithdrawals = withdrawals.filter(w => w.userId === user._id);
      return { withdrawals: userWithdrawals };
    }

    if (endpoint === '/withdrawals' && method === 'POST') {
      const stored = safeJSONParse(localStorage.getItem(STORAGE_KEYS.sessionUser), null);
      const user = users.find(u => u._id === stored._id) || stored;
      const newWithdrawal = {
        _id: uid('withdrawal'),
        userId: user._id,
        user: { name: user.name },
        amount: Number(data.amount || 0),
        method: data.method,
        status: 'pending',
        accountDetails: data.accountDetails,
        createdAt: new Date().toISOString()
      };
      withdrawals.push(newWithdrawal);
      localStorage.setItem(STORAGE_KEYS.withdrawals, JSON.stringify(withdrawals));
      return { success: true, withdrawal: newWithdrawal };
    }

    if (endpoint === '/admin/dashboard' && method === 'GET') {
      const totalUsers = users.filter(u => u.role !== 'admin').length;
      const totalTasks = tasks.length;
      const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
      const totalEarningsDistributed = users.reduce((sum, u) => sum + Number(u.totalEarned || 0), 0);
      return {
        stats: {
          totalUsers,
          totalTasks,
          pendingWithdrawals,
          totalEarningsDistributed
        }
      };
    }

    if (endpoint === '/admin/users' && method === 'GET') {
      return { users: users.filter(u => u.role !== 'admin') };
    }

    if (endpoint === '/admin/withdrawals' && method === 'GET') {
      return { withdrawals };
    }

    if (lower.startsWith('/admin/withdrawals/') && method === 'PUT') {
      const withdrawalId = endpoint.split('/')[3];
      const target = withdrawals.find(w => w._id === withdrawalId);
      if (!target) throw new Error('Withdrawal not found');
      target.status = 'completed';
      localStorage.setItem(STORAGE_KEYS.withdrawals, JSON.stringify(withdrawals));
      return { success: true, withdrawal: target };
    }

    throw new Error(`Fallback not implemented for ${endpoint}`);
  }

  register(name, email, password, country) {
    return this.request('/auth/register', 'POST', { name, email, password, country });
  }

  login(email, password) {
    return this.request('/auth/login', 'POST', { email, password });
  }

  getProfile() {
    return this.request('/users/profile');
  }

  updateProfile(data) {
    return this.request('/users/profile', 'PUT', data);
  }

  getReferrals() {
    return this.request('/users/referrals');
  }

  getTasks() {
    return this.request('/tasks');
  }

  completeTask(id) {
    return this.request(`/tasks/${id}/complete`, 'POST');
  }

  createTask(data) {
    return this.request('/tasks', 'POST', data);
  }

  getEarnings() {
    return this.request('/earnings');
  }

  requestWithdrawal(data) {
    return this.request('/withdrawals', 'POST', data);
  }

  getWithdrawals() {
    return this.request('/withdrawals');
  }

  getDashboardStats() {
    return this.request('/admin/dashboard');
  }

  getAllUsers() {
    return this.request('/admin/users');
  }

  getAllWithdrawals() {
    return this.request('/admin/withdrawals');
  }

  approveWithdrawal(id) {
    return this.request(`/admin/withdrawals/${id}/approve`, 'PUT');
  }
}

const api = new APIClient();

function showNotification(message, type = 'success') {
  let box = document.getElementById('global-notification');
  if (!box) {
    box = document.createElement('div');
    box.id = 'global-notification';
    box.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;padding:12px 18px;border-radius:10px;color:#fff;font-weight:700;box-shadow:0 10px 25px rgba(0,0,0,.2);max-width:320px;';
    document.body.appendChild(box);
  }

  box.textContent = message;
  box.style.background = type === 'error' ? '#ef4444' : '#22c55e';
  box.style.display = 'block';
  clearTimeout(box.timer);
  box.timer = setTimeout(() => {
    box.style.display = 'none';
  }, 2500);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount) || 0);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('ar-EG').format(new Date(date));
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.authToken);
  localStorage.removeItem(STORAGE_KEYS.sessionUser);
  window.location.href = 'index.html';
}
