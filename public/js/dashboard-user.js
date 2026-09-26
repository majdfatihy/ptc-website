// User Dashboard JS
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!api.token) {
        window.location.href = '/index.html';
        return;
    }

    await loadUserData();
    setupEventListeners();
});

async function loadUserData() {
    try {
        const user = await api.getProfile();
        updateUserInfo(user.user);
        
        const earnings = await api.getEarnings();
        updateEarningsData(earnings);

        const withdrawals = await api.getWithdrawals();
        updateWithdrawalHistory(withdrawals);

        await loadTasks();
        await loadReferrals();
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('خطأ في تحميل البيانات', 'error');
    }
}

function updateUserInfo(user) {
    document.getElementById('user-name').textContent = user.name || 'المستخدم';
    document.getElementById('user-email').textContent = user.email || '';
    document.getElementById('current-balance').textContent = formatCurrency(user.balance);
    document.getElementById('total-earned').textContent = formatCurrency(user.totalEarned);
    document.getElementById('tasks-count').textContent = user.tasksCompleted || 0;
    document.getElementById('referral-code').value = user.referralCode || 'N/A';
    document.getElementById('balance-info').textContent = `الرصيد المتاح: ${formatCurrency(user.balance)}`;
    
    // Update profile form
    document.getElementById('profile-name').value = user.name || '';
    document.getElementById('profile-email').value = user.email || '';
    document.getElementById('profile-phone').value = user.phone || '';
    document.getElementById('profile-payment').value = user.paymentMethod || '';
}

function updateEarningsData(earnings) {
    if (earnings.summary) {
        document.getElementById('approved-earnings').textContent = formatCurrency(earnings.summary.totalEarned || 0);
        document.getElementById('pending-earnings').textContent = formatCurrency(earnings.summary.pending || 0);
    }

    if (earnings.earnings) {
        const table = document.getElementById('earnings-list');
        table.innerHTML = '';
        
        earnings.earnings.forEach(earning => {
            const row = document.createElement('div');
            row.className = 'earnings-row';
            row.innerHTML = `
                <span>${earning.task?.title || 'إحالة'}</span>
                <span>${earning.type === 'task' ? 'مهمة' : earning.type === 'referral' ? 'إحالة' : 'مكافأة'}</span>
                <span class="${earning.status === 'approved' ? 'status-approved' : 'status-pending'}">📍 ${earning.status === 'approved' ? 'معتمدة' : 'معلقة'}</span>
                <span class="amount">+${formatCurrency(earning.amount)}</span>
            `;
            table.appendChild(row);
        });
    }
}

async function loadTasks() {
    try {
        const data = await api.getTasks();
        const tasksList = document.getElementById('tasks-list');
        tasksList.innerHTML = '';

        data.tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';
            card.innerHTML = `
                <div class="task-header">
                    <h3>${task.title}</h3>
                    <span class="reward-badge">💰 ${formatCurrency(task.reward)}</span>
                </div>
                <p class="task-desc">${task.description || ''}</p>
                <div class="task-footer">
                    <small>⏱️ ${task.duration || 'متغير'}</small>
                    <button class="btn-task" onclick="completeTask('${task._id}')">ابدأ المهمة</button>
                </div>
            `;
            tasksList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function completeTask(taskId) {
    try {
        const result = await api.completeTask(taskId);
        showNotification(`تم إضافة ${formatCurrency(result.earning)} لحسابك! ✅`, 'success');
        await loadUserData();
    } catch (error) {
        showNotification('حدث خطأ في إكمال المهمة', 'error');
    }
}

async function loadReferrals() {
    try {
        const data = await api.getReferrals();
        document.getElementById('referrals-count').textContent = data.count || 0;

        const referralsList = document.getElementById('referrals-list');
        if (data.referrals && data.referrals.length > 0) {
            referralsList.innerHTML = data.referrals.map(ref => `
                <div class="referral-row">
                    <span>${ref.name}</span>
                    <span>${ref.email}</span>
                    <span>${formatDate(ref.createdAt)}</span>
                </div>
            `).join('');
        } else {
            referralsList.innerHTML = '<p class="text-muted">لا توجد إحالات حتى الآن</p>';
        }
    } catch (error) {
        console.error('Error loading referrals:', error);
    }
}

function updateWithdrawalHistory(data) {
    const container = document.getElementById('withdrawals-history');
    if (data.withdrawals && data.withdrawals.length > 0) {
        container.innerHTML = data.withdrawals.map(w => `
            <div class="withdrawal-item">
                <span>${formatCurrency(w.amount)}</span>
                <span>${w.method}</span>
                <span class="status-${w.status}">${w.status}</span>
                <span>${formatDate(w.createdAt)}</span>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<p class="text-muted">لا توجد طلبات سحب</p>';
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            switchPage(page);
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Withdrawal form
    document.getElementById('withdrawal-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitWithdrawal();
    });

    // Profile form
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateProfile();
    });

    // Logout
    document.querySelector('.logout-btn').addEventListener('click', () => {
        if (confirm('هل تريد تسجيل الخروج؟')) {
            logout();
        }
    });
}

function switchPage(page) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
        const titles = {
            'dashboard': 'الرئيسية',
            'tasks': 'المهام',
            'earnings': 'الأرباح',
            'referrals': 'الإحالات',
            'withdrawal': 'السحب',
            'profile': 'الملف الشخصي'
        };
        document.getElementById('page-title').textContent = titles[page] || 'الرئيسية';
    }
}

async function submitWithdrawal() {
    const amount = parseFloat(document.getElementById('withdrawal-amount').value);
    const method = document.getElementById('withdrawal-method').value;
    const details = document.getElementById('withdrawal-details').value;

    if (!amount || !method || !details) {
        showNotification('يرجى ملء جميع الحقول', 'error');
        return;
    }

    try {
        await api.requestWithdrawal({ amount, method, accountDetails: details });
        showNotification('تم تقديم طلب السحب بنجاح! ✅', 'success');
        document.getElementById('withdrawal-form').reset();
        await loadUserData();
    } catch (error) {
        showNotification('خطأ في تقديم الطلب', 'error');
    }
}

async function updateProfile() {
    const data = {
        name: document.getElementById('profile-name').value,
        phone: document.getElementById('profile-phone').value,
        paymentMethod: document.getElementById('profile-payment').value,
    };

    try {
        await api.updateProfile(data);
        showNotification('تم تحديث البيانات بنجاح! ✅', 'success');
        await loadUserData();
    } catch (error) {
        showNotification('خطأ في التحديث', 'error');
    }
}

function copyReferralCode() {
    const code = document.getElementById('referral-code');
    code.select();
    document.execCommand('copy');
    showNotification('تم نسخ كود الإحالة! 📋', 'success');
}